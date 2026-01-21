/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProcessStepEntity,
  ProofOfOriginEmissionEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
  ProofOfSustainabilityEmissionEntity,
  ProofOfSustainabilityEntity,
} from '@h2-trust/amqp';
import { EnumLabelMapper } from '@h2-trust/api';
import {
  CalculationTopic,
  EnergySource,
  FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ,
  FUEL_EMISSION_FACTORS,
  FuelType,
  GRAVIMETRIC_ENERGY_DENSITY_H2_MJ_PER_KG,
  POWER_EMISSION_FACTORS,
  ProcessType,
  TRAILER_PARAMETERS,
  TrailerParameter,
  TransportMode,
  UNIT_G_CO2,
  UNIT_G_CO2_PER_KWH,
} from '@h2-trust/domain';

export class EmissionAssembler {
  static assemblePowerSupply(
    powerProduction: ProcessStepEntity,
    energySource: EnergySource,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (powerProduction?.type !== ProcessType.POWER_PRODUCTION) {
      throw new Error(`Invalid process step type [${powerProduction?.type}] for power supply emission calculation`);
    }

    const power = powerProduction.batch.amount;
    const powerInput = `Power Input: ${power} kWh`;

    const emissionFactorLabel = EnumLabelMapper.getEnergySource(energySource);
    const emissionFactor = POWER_EMISSION_FACTORS[energySource].emissionFactor;
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${emissionFactor} ${UNIT_G_CO2_PER_KWH}`;

    const result = power * emissionFactor;
    const formula = `E = Power Input * Emission Factor ${emissionFactorLabel}`;
    const formulaResult = `${result} ${UNIT_G_CO2} = ${power} kWh * ${emissionFactor} ${UNIT_G_CO2_PER_KWH}`;

    const basisOfCalculation = [powerInput, emissionFactorInput, formula, formulaResult];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      POWER_EMISSION_FACTORS[energySource].label,
      basisOfCalculation,
      result,
      UNIT_G_CO2,
      CalculationTopic.POWER_SUPPLY,
    );
  }

  static assembleWaterSupply(waterSupply: ProcessStepEntity): ProofOfSustainabilityEmissionCalculationEntity {
    if (waterSupply?.type !== ProcessType.WATER_CONSUMPTION) {
      throw new Error(`Invalid process step type [${waterSupply?.type}] for water supply emission calculation`);
    }

    const waterInput = waterSupply.batch.amount;
    const emissionFactorDeionizedWater = 0.43;
    const result = waterInput * emissionFactorDeionizedWater;

    const emissionFactorLabel = 'Deionized Water';
    const waterInputInput = `Water Input: ${waterInput} L`;
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${emissionFactorDeionizedWater} g CO₂,eq/L`;
    const formula = `E = Water Input * Emission Factor ${emissionFactorLabel}`;
    const formulaResult = `${result} ${UNIT_G_CO2} = ${waterInput} L * ${emissionFactorDeionizedWater} g CO₂,eq/L`;

    const basisOfCalculation = [waterInputInput, emissionFactorInput, formula, formulaResult];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      'Water Supply',
      basisOfCalculation,
      result,
      UNIT_G_CO2,
      CalculationTopic.WATER_SUPPLY,
    );
  }

  static assembleHydrogenStorage(
    hydrogenProduction: ProcessStepEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (hydrogenProduction?.type !== ProcessType.HYDROGEN_PRODUCTION) {
      throw new Error(
        `Invalid process step type [${hydrogenProduction?.type}] for hydrogen storage emission calculation`,
      );
    }

    const energyDemand = 1.65; // 5.93 / 3.6 -> default values for compression from 30 bar to 300 bar
    const emissionFactor = POWER_EMISSION_FACTORS[EnergySource.GRID].emissionFactor;
    const result = energyDemand * emissionFactor * hydrogenProduction.batch.amount;

    const hydrogenProducedKgInput = `Hydrogen Produced: ${hydrogenProduction.batch.amount} kg H₂`;

    const emissionFactorLabel = EnumLabelMapper.getEnergySource(EnergySource.GRID);
    const energyDemandInput = `Energy Demand: ${energyDemand} kWh/kg H₂`;
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${emissionFactor} g CO₂,eq/kWh`;
    const formula = `E = Energy Demand * Emission Factor ${emissionFactorLabel} * Hydrogen Produced`;
    const formulaResult = `${result} ${UNIT_G_CO2} = ${energyDemand} kWh/kg H₂ * ${emissionFactor} g CO₂,eq/kWh * ${hydrogenProduction.batch.amount} kg H₂`;

    const basisOfCalculation = [
      energyDemandInput,
      emissionFactorInput,
      hydrogenProducedKgInput,
      formula,
      formulaResult,
    ];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      'Compression from 30 bar to 300 bar',
      basisOfCalculation,
      result,
      UNIT_G_CO2,
      CalculationTopic.HYDROGEN_STORAGE,
    );
  }

  static assembleHydrogenBottling(
    _hydrogenBottling: ProcessStepEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (_hydrogenBottling?.type !== ProcessType.HYDROGEN_BOTTLING) {
      throw new Error(
        `Invalid process step type [${_hydrogenBottling?.type}] for hydrogen bottling emission calculation`,
      );
    }

    const result = 0;

    const basisOfCalculation = ['E = [TBD]'];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      'Hydrogen Bottling',
      basisOfCalculation,
      result,
      UNIT_G_CO2,
      CalculationTopic.HYDROGEN_BOTTLING,
    );
  }

  static assembleHydrogenTransportation(
    hydrogenTransportation: ProcessStepEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (hydrogenTransportation?.type !== ProcessType.HYDROGEN_TRANSPORTATION) {
      throw new Error(
        `Invalid process step type [${hydrogenTransportation?.type}] for hydrogen transportation emission calculation`,
      );
    }

    const transportMode: string = hydrogenTransportation.transportationDetails?.transportMode;
    let emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity;

    switch (transportMode) {
      case TransportMode.PIPELINE:
        emissionCalculation = this.assemblePipeline();
        break;
      case TransportMode.TRAILER:
        emissionCalculation = this.assembleTrailer(
          hydrogenTransportation.batch.amount,
          hydrogenTransportation.transportationDetails.fuelType,
          hydrogenTransportation.transportationDetails.distance,
        );
        break;
      default:
        throw new Error(`Unknown transport mode [${transportMode}] for process step [${hydrogenTransportation.id}]`);
    }

    return emissionCalculation;
  }

  private static assemblePipeline(): ProofOfSustainabilityEmissionCalculationEntity {
    const result = 0;

    const basisOfCalculation = ['E = 0 g CO₂,eq/kg H₂'];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      'Transportation with Pipeline',
      basisOfCalculation,
      result,
      UNIT_G_CO2,
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
  }

  private static assembleTrailer(
    hydrogenAmount: number,
    fuelType: FuelType,
    transportDistance: number,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    const trailerParameter: TrailerParameter =
      TRAILER_PARAMETERS.find((trailerEntry) => hydrogenAmount <= trailerEntry.capacityKg) ??
      TRAILER_PARAMETERS.at(TRAILER_PARAMETERS.length - 1);

    const tonPerKg = 0.001;

    // Amount of fuel used per ton of material transported = transport distance * transport efficiency
    // [MJ fuel / ton of H₂] = [km] * [MJ fuel / (ton, km)]
    const transportEfficiency = trailerParameter.transportEfficiencyMJPerTonnePerKm;
    const amountOfFuelPerTonOfHydrogen = transportDistance * transportEfficiency;

    // Emission = 0.001 * Amount of fuel used per ton of material transported * emission factor
    // [g CO₂,eq/kg of H₂] = [ton / kg] * [MJ fuel / ton of H₂] * [g CO₂,eq / MJ fuel]
    const emissionFactorFuel = FUEL_EMISSION_FACTORS[fuelType];
    const emissionsFuelCombustion = tonPerKg * amountOfFuelPerTonOfHydrogen * emissionFactorFuel;

    // Emission = 0.001 * transport distance * emission factor for CH4 and N2O emissions
    // [g CO₂,eq/kg of H₂] = [ton / kg] * [km] * [g CO₂,eq / (ton, km)]
    const emissionFactorCh4AndN2O = trailerParameter.gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2;
    const emissionCh4AndN2O = tonPerKg * transportDistance * emissionFactorCh4AndN2O;

    const result = (emissionsFuelCombustion + emissionCh4AndN2O) * hydrogenAmount;

    const fuelTypeLabel = EnumLabelMapper.getFuelType(fuelType);
    const tonPerKgInput = `Ton per Kg: ${tonPerKg} ton/kg`;
    const transportDistanceInput = `Transport Distance: ${transportDistance} km`;
    const transportEfficiencyInput = `Transport Efficiency: ${transportEfficiency} MJ fuel / (ton, km)`;
    const emissionFactorFuelInput = `Emission Factor ${fuelTypeLabel}: ${emissionFactorFuel} g CO₂,eq / MJ`;
    const emissionFactorCh4AndN2OInput = `Emission Factor CH₄ & N₂O: ${emissionFactorCh4AndN2O} g CO₂,eq / (ton, km)`;
    const hydrogenTransportedInput = `Hydrogen Transported: ${hydrogenAmount} kg H₂`;
    const emissionFuelCombustionFormula = `Emission Fuel Combustion = Ton per Kg * Transport Distance * Transport Efficiency * Emission Factor ${fuelTypeLabel}`;
    const emissionCh4AndN2OFormula = `Emission CH₄ & N₂O = Ton per Kg * Transport Distance * Emission Factor CH₄ & N₂O`;
    const formula = `E = (Emission Fuel Combustion + Emission CH₄ & N₂O) * Hydrogen Transported`;
    const basisOfCalculation = [
      tonPerKgInput,
      transportDistanceInput,
      transportEfficiencyInput,
      emissionFactorFuelInput,
      emissionFactorCh4AndN2OInput,
      hydrogenTransportedInput,
      emissionFuelCombustionFormula,
      emissionCh4AndN2OFormula,
      formula,
    ];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      'Transportation with Trailer',
      basisOfCalculation,
      result,
      UNIT_G_CO2,
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
  }

  static assembleProofOfSustainability(
    batchId: string,
    emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[],
    hydrogenAmountKg: number,
  ): ProofOfSustainabilityEntity {
    const applicationEmissions: ProofOfSustainabilityEmissionEntity[] =
      EmissionAssembler.assembleApplicationEmissions(emissionCalculations);

    const hydrogenProductionEmissionAmount: number = applicationEmissions
      .filter((e) => e.name === 'eps' || e.name === 'ews')
      .reduce((sum, e) => sum + e.amount, 0);

    const applicationEmissionAmount: number = applicationEmissions.reduce((acc, emission) => acc + emission.amount, 0);
    const hydrogenTransportEmissionAmount: number = applicationEmissions.find((e) => e.name === 'eht')?.amount ?? 0;

    const regulatoryEmissions: ProofOfSustainabilityEmissionEntity[] = EmissionAssembler.assembleRegulatoryEmissions(
      hydrogenProductionEmissionAmount,
      applicationEmissionAmount,
      hydrogenTransportEmissionAmount,
    );
    const emissions: ProofOfSustainabilityEmissionEntity[] = [...applicationEmissions, ...regulatoryEmissions];

    const totalEmissions: number = applicationEmissionAmount;
    const amountCO2PerKgH2: number = applicationEmissionAmount / hydrogenAmountKg;
    const amountCO2PerMJH2: number = amountCO2PerKgH2 / GRAVIMETRIC_ENERGY_DENSITY_H2_MJ_PER_KG;

    const emissionReductionPercentage: number =
      (Math.max(FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ - amountCO2PerMJH2, 0) / FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ) * 100;

    return new ProofOfSustainabilityEntity(
      batchId,
      totalEmissions,
      amountCO2PerKgH2,
      amountCO2PerMJH2,
      emissionReductionPercentage,
      emissionCalculations,
      emissions,
    );
  }

  private static assembleApplicationEmissions(
    emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[],
  ): ProofOfSustainabilityEmissionEntity[] {
    const calculateTotalEmissionAmountByCalculationTopic = (calculationTopic: CalculationTopic): number =>
      emissionCalculations
        .filter((emissionCalculation) => emissionCalculation.calculationTopic === calculationTopic)
        .reduce((acc, emissionCalculation) => acc + (Number(emissionCalculation.name) ?? 0), 0);

    const powerSupplyEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(CalculationTopic.POWER_SUPPLY);
    const powerSupplyEmission = new ProofOfSustainabilityEmissionEntity(
      powerSupplyEmissionAmount,
      'eps',
      'Power Supply',
      'APPLICATION',
    );

    const waterSupplyEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(CalculationTopic.WATER_SUPPLY);
    const waterSupplyEmission = new ProofOfSustainabilityEmissionEntity(
      waterSupplyEmissionAmount,
      'ews',
      'Water Supply',
      'APPLICATION',
    );

    const hydrogenStorageEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_STORAGE,
    );
    const hydrogenStorageEmission = new ProofOfSustainabilityEmissionEntity(
      hydrogenStorageEmissionAmount,
      'ehs',
      'Hydrogen Storage',
      'APPLICATION',
    );

    const hydrogenBottlingEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_BOTTLING,
    );
    const hydrogenBottlingEmission = new ProofOfSustainabilityEmissionEntity(
      hydrogenBottlingEmissionAmount,
      'ehb',
      'Hydrogen Bottling',
      'APPLICATION',
    );

    const hydrogenTransportationEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
    const hydrogenTransportationEmission = new ProofOfSustainabilityEmissionEntity(
      hydrogenTransportationEmissionAmount,
      'eht',
      'Hydrogen Transportation',
      'APPLICATION',
    );

    return [
      powerSupplyEmission,
      waterSupplyEmission,
      hydrogenStorageEmission,
      hydrogenBottlingEmission,
      hydrogenTransportationEmission,
    ];
  }

  private static assembleRegulatoryEmissions(
    hydrogenProductionEmissionAmount: number,
    applicationEmissionAmount: number,
    hydrogenTransportEmissionAmount: number,
  ): ProofOfSustainabilityEmissionEntity[] {
    const ei = new ProofOfSustainabilityEmissionEntity(
      hydrogenProductionEmissionAmount,
      'ei',
      'Supply of Inputs',
      'REGULATORY',
    );

    const ep = new ProofOfSustainabilityEmissionEntity(
      applicationEmissionAmount - hydrogenProductionEmissionAmount - hydrogenTransportEmissionAmount,
      'ep',
      'Processing',
      'REGULATORY',
    );

    const etd = new ProofOfSustainabilityEmissionEntity(
      hydrogenTransportEmissionAmount,
      'etd',
      'Transport and Distribution',
      'REGULATORY',
    );

    return [ei, ep, etd];
  }

  static assembleEmissionDto(
    calc: ProofOfSustainabilityEmissionCalculationEntity,
    kgHydrogen: number,
  ): ProofOfOriginEmissionEntity {
    const gCo2 = calc?.result ?? 0;
    const gCo2PerKgHydrogen = gCo2 / kgHydrogen;
    return {
      amountCO2: gCo2,
      amountCO2PerKgH2: gCo2PerKgHydrogen,
      basisOfCalculation: calc?.basisOfCalculation ?? [],
    };
  }
}
