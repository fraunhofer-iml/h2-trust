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
  ProofOfSustainabilityEmissionComputationEntity,
  ProofOfSustainabilityProcessStepEmissionEntity,
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
  UNIT_G_CO2_PER_KG_H2,
} from '@h2-trust/domain';

export class EmissionAssembler {
  static assemblePowerSupply(
    powerProduction: ProcessStepEntity,
    energySource: EnergySource,
    hydrogenAmount: number,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (powerProduction?.type !== ProcessType.POWER_PRODUCTION) {
      throw new Error(`Invalid process step type [${powerProduction?.type}] for power supply emission calculation`);
    }

    const label = POWER_EMISSION_FACTORS[energySource].label;

    const powerInput = powerProduction.batch.amount;
    const emissionFactor = POWER_EMISSION_FACTORS[energySource].emissionFactor;
    const hydrogenOutput = hydrogenAmount;
    const result = (powerInput * emissionFactor) / hydrogenOutput;

    const emissionFactorLabel = EnumLabelMapper.getEnergySource(energySource);
    const powerInputInput = `Power Input: ${powerInput} kWh`;
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${emissionFactor} g CO₂,eq/kWh`;
    const hydrogenOutputInput = `Hydrogen Output: ${hydrogenOutput} kg H₂`;
    const formula = `E = (Power Input * Emission Factor ${emissionFactorLabel}) / Hydrogen Output`;
    const basisOfCalculation = [powerInputInput, emissionFactorInput, hydrogenOutputInput, formula];

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.POWER_SUPPLY;

    return new ProofOfSustainabilityEmissionCalculationEntity(
      label,
      basisOfCalculation,
      result,
      unit,
      calculationTopic,
    );
  }

  static assembleWaterSupply(
    waterSupply: ProcessStepEntity,
    hydrogenAmount: number,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (waterSupply?.type !== ProcessType.WATER_CONSUMPTION) {
      throw new Error(`Invalid process step type [${waterSupply?.type}] for water supply emission calculation`);
    }

    const label = 'Emissions (Water Supply)';

    const waterInput = waterSupply.batch.amount;
    const emissionFactorDeionizedWater = 0.43;
    const hydrogenOutput = hydrogenAmount;
    const result = (waterInput * emissionFactorDeionizedWater) / hydrogenOutput;

    const emissionFactorLabel = 'Deionized Water';
    const waterInputInput = `Water Input: ${waterInput} L`;
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${emissionFactorDeionizedWater} g CO₂,eq/L`;
    const hydrogenOutputInput = `Hydrogen Output: ${hydrogenOutput} kg H₂`;
    const formula = `E = (Water Input * Emission Factor ${emissionFactorLabel}) / Hydrogen Output`;
    const basisOfCalculation = [waterInputInput, emissionFactorInput, hydrogenOutputInput, formula];

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.WATER_SUPPLY;

    return new ProofOfSustainabilityEmissionCalculationEntity(
      label,
      basisOfCalculation,
      result,
      unit,
      calculationTopic,
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

    const label = 'Emissions (Compression from 30 bar to 300 bar)';

    const energyDemand = 1.65; // 5.93 / 3.6 -> default values for compression from 30 bar to 300 bar
    const emissionFactor = POWER_EMISSION_FACTORS[EnergySource.GRID].emissionFactor;
    const result = energyDemand * emissionFactor;

    const emissionFactorLabel = EnumLabelMapper.getEnergySource(EnergySource.GRID);
    const energyDemandInput = `Energy Demand: ${energyDemand} kWh/kg H₂`;
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${emissionFactor} g CO₂,eq/kWh`;
    const formula = `E = Energy Demand * Emission Factor ${emissionFactorLabel}`;
    const basisOfCalculation = [energyDemandInput, emissionFactorInput, formula];

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.HYDROGEN_STORAGE;

    return new ProofOfSustainabilityEmissionCalculationEntity(
      label,
      basisOfCalculation,
      result,
      unit,
      calculationTopic,
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

    const label = 'Emissions (Hydrogen Bottling)';

    const result = 0;

    const basisOfCalculation = ['E = [TBD]'];

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.HYDROGEN_BOTTLING;

    return new ProofOfSustainabilityEmissionCalculationEntity(
      label,
      basisOfCalculation,
      result,
      unit,
      calculationTopic,
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
    const label = 'Emissions (Transportation with Pipeline)';

    const result = 0;

    const basisOfCalculation = ['E = 0 g CO₂,eq/kg H₂'];

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.HYDROGEN_TRANSPORTATION;

    return new ProofOfSustainabilityEmissionCalculationEntity(
      label,
      basisOfCalculation,
      result,
      unit,
      calculationTopic,
    );
  }

  private static assembleTrailer(
    amount: number,
    fuelType: FuelType,
    transportDistance: number,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    const label = 'Emissions (Transportation with Trailer)';

    const trailerParameter: TrailerParameter =
      TRAILER_PARAMETERS.find((trailerEntry) => amount <= trailerEntry.capacityKg) ??
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

    const result = emissionsFuelCombustion + emissionCh4AndN2O;

    const fuelTypeLabel = EnumLabelMapper.getFuelType(fuelType);
    const tonPerKgInput = `Ton per Kg: ${tonPerKg} ton/kg`;
    const transportDistanceInput = `Transport Distance: ${transportDistance} km`;
    const transportEfficiencyInput = `Transport Efficiency: ${transportEfficiency} MJ fuel / (ton, km)`;
    const emissionFactorFuelInput = `Emission Factor ${fuelTypeLabel}: ${emissionFactorFuel} g CO₂,eq / MJ`;
    const emissionFactorCh4AndN2OInput = `Emission Factor CH₄ & N₂O: ${emissionFactorCh4AndN2O} g CO₂,eq / (ton, km)`;
    const emissionFuelCombustionFormula = `Emission Fuel Combustion = Ton per Kg * Transport Distance * Transport Efficiency * Emission Factor ${fuelTypeLabel}`;
    const emissionCh4AndN2OFormula = `Emission CH₄ & N₂O = Ton per Kg * Transport Distance * Emission Factor CH₄ & N₂O`;
    const formula = `E = Emission Fuel Combustion + Emission CH₄ & N₂O`;
    const basisOfCalculation = [
      tonPerKgInput,
      transportDistanceInput,
      transportEfficiencyInput,
      emissionFactorFuelInput,
      emissionFactorCh4AndN2OInput,
      emissionFuelCombustionFormula,
      emissionCh4AndN2OFormula,
      formula,
    ];

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.HYDROGEN_TRANSPORTATION;

    return new ProofOfSustainabilityEmissionCalculationEntity(
      label,
      basisOfCalculation,
      result,
      unit,
      calculationTopic,
    );
  }

  static assembleComputationResult(
    emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[],
  ): ProofOfSustainabilityEmissionComputationEntity {
    const applicationEmissions: ProofOfSustainabilityProcessStepEmissionEntity[] =
      EmissionAssembler.assembleApplicationEmissions(emissionCalculations);

    const hydrogenProductionEmissionAmount: number = applicationEmissions
      .filter((e) => e.name === 'eps' || e.name === 'ews')
      .reduce((sum, e) => sum + e.amount, 0);

    const applicationEmissionAmount: number = applicationEmissions.reduce((acc, emission) => acc + emission.amount, 0);
    const hydrogenTransportEmissionAmount: number = applicationEmissions.find((e) => e.name === 'eht')?.amount ?? 0;

    const regulatoryEmissions: ProofOfSustainabilityProcessStepEmissionEntity[] =
      EmissionAssembler.assembleRegulatoryEmissions(
        hydrogenProductionEmissionAmount,
        applicationEmissionAmount,
        hydrogenTransportEmissionAmount,
      );
    const processStepEmissions: ProofOfSustainabilityProcessStepEmissionEntity[] = [
      ...applicationEmissions,
      ...regulatoryEmissions,
    ];

    const amountCO2PerMJH2: number = applicationEmissionAmount / GRAVIMETRIC_ENERGY_DENSITY_H2_MJ_PER_KG;
    const emissionReductionPercentage: number =
      (Math.max(FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ - amountCO2PerMJH2, 0) / FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ) * 100;

    return new ProofOfSustainabilityEmissionComputationEntity(
      emissionCalculations,
      processStepEmissions,
      amountCO2PerMJH2,
      emissionReductionPercentage,
    );
  }

  private static assembleApplicationEmissions(
    emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[],
  ): ProofOfSustainabilityProcessStepEmissionEntity[] {
    const calculateTotalEmissionAmountByCalculationTopic = (calculationTopic: CalculationTopic): number =>
      emissionCalculations
        .filter((emissionCalculation) => emissionCalculation.calculationTopic === calculationTopic)
        .reduce((acc, emissionCalculation) => acc + (emissionCalculation.result ?? 0), 0);

    const powerSupplyEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(CalculationTopic.POWER_SUPPLY);
    const powerSupplyEmission = new ProofOfSustainabilityProcessStepEmissionEntity(
      powerSupplyEmissionAmount,
      'eps',
      'Power Supply',
      'APPLICATION',
    );

    const waterSupplyEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(CalculationTopic.WATER_SUPPLY);
    const waterSupplyEmission = new ProofOfSustainabilityProcessStepEmissionEntity(
      waterSupplyEmissionAmount,
      'ews',
      'Water Supply',
      'APPLICATION',
    );

    const hydrogenStorageEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_STORAGE,
    );
    const hydrogenStorageEmission = new ProofOfSustainabilityProcessStepEmissionEntity(
      hydrogenStorageEmissionAmount,
      'ehs',
      'Hydrogen Storage',
      'APPLICATION',
    );

    const hydrogenBottlingEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_BOTTLING,
    );
    const hydrogenBottlingEmission = new ProofOfSustainabilityProcessStepEmissionEntity(
      hydrogenBottlingEmissionAmount,
      'ehb',
      'Hydrogen Bottling',
      'APPLICATION',
    );

    const hydrogenTransportationEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
    const hydrogenTransportationEmission = new ProofOfSustainabilityProcessStepEmissionEntity(
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
  ): ProofOfSustainabilityProcessStepEmissionEntity[] {
    const ei = new ProofOfSustainabilityProcessStepEmissionEntity(
      hydrogenProductionEmissionAmount,
      'ei',
      'Supply of Inputs',
      'REGULATORY',
    );

    const ep = new ProofOfSustainabilityProcessStepEmissionEntity(
      applicationEmissionAmount - hydrogenProductionEmissionAmount - hydrogenTransportEmissionAmount,
      'ep',
      'Processing',
      'REGULATORY',
    );

    const etd = new ProofOfSustainabilityProcessStepEmissionEntity(
      hydrogenTransportEmissionAmount,
      'etd',
      'Transport and Distribution',
      'REGULATORY',
    );

    return [ei, ep, etd];
  }

  static assembleEmissionDto(
    calc: ProofOfSustainabilityEmissionCalculationEntity,
    hydrogenMassKg: number,
  ): ProofOfOriginEmissionEntity {
    const amountCO2PerKgH2 = calc?.result ?? 0;
    const amountCO2 = amountCO2PerKgH2 * hydrogenMassKg;
    return new ProofOfOriginEmissionEntity(amountCO2, amountCO2PerKgH2, calc?.basisOfCalculation ?? []);
  }
}
