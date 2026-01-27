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
  EmissionNumericConstants,
  EnergySource,
  FuelType,
  MeasurementUnit,
  ProcessType,
  TrailerParameter,
  TransportMode,
  EmissionStringConstants,
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
    const powerInput = `Power Input: ${power} ${MeasurementUnit.KWH}`;

    const emissionFactorLabel = EnumLabelMapper.getEnergySource(energySource);
    const emissionFactor = EmissionNumericConstants.ENERGY_SOURCE_EMISSION_FACTORS[energySource];
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${emissionFactor} ${MeasurementUnit.G_CO2_PER_KWH}`;

    const result = power * emissionFactor;
    const formula = `E = Power Input * Emission Factor ${emissionFactorLabel}`;
    const formulaResult = `${result} ${MeasurementUnit.G_CO2} = ${power} ${MeasurementUnit.KWH} * ${emissionFactor} ${MeasurementUnit.G_CO2_PER_KWH}`;

    const basisOfCalculation = [powerInput, emissionFactorInput, formula, formulaResult];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      emissionFactorLabel,
      basisOfCalculation,
      result,
      MeasurementUnit.G_CO2,
      CalculationTopic.POWER_SUPPLY,
    );
  }

  static assembleWaterSupply(waterSupply: ProcessStepEntity): ProofOfSustainabilityEmissionCalculationEntity {
    if (waterSupply?.type !== ProcessType.WATER_CONSUMPTION) {
      throw new Error(`Invalid process step type [${waterSupply?.type}] for water supply emission calculation`);
    }

    const waterInput = waterSupply.batch.amount;
    const result = waterInput * EmissionNumericConstants.EMISSION_FACTOR_DEIONIZED_WATER_G_CO2_PER_L;

    const emissionFactorLabel = EmissionStringConstants.DEIONIZED_WATER;
    const waterInputInput = `Water Input: ${waterInput} ${MeasurementUnit.L}`;
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${EmissionNumericConstants.EMISSION_FACTOR_DEIONIZED_WATER_G_CO2_PER_L} ${MeasurementUnit.G_CO2_PER_L}`;
    const formula = `E = Water Input * Emission Factor ${emissionFactorLabel}`;
    const formulaResult = `${result} ${MeasurementUnit.G_CO2} = ${waterInput} ${MeasurementUnit.L} * ${EmissionNumericConstants.EMISSION_FACTOR_DEIONIZED_WATER_G_CO2_PER_L} ${MeasurementUnit.G_CO2_PER_L}`;

    const basisOfCalculation = [waterInputInput, emissionFactorInput, formula, formulaResult];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      EmissionStringConstants.WATER_SUPPLY,
      basisOfCalculation,
      result,
      MeasurementUnit.G_CO2,
      CalculationTopic.WATER_SUPPLY,
    );
  }

  static assembleHydrogenStorage(
    hydrogenProduction: ProcessStepEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (hydrogenProduction?.type !== ProcessType.HYDROGEN_PRODUCTION) {
      throw new Error(`Invalid process step type [${hydrogenProduction?.type}] for hydrogen storage emission calculation`);
    }

    const emissionFactor = EmissionNumericConstants.ENERGY_SOURCE_EMISSION_FACTORS[EnergySource.GRID];
    const result = EmissionNumericConstants.ENERGY_DEMAND_COMPRESSION_KWH_PER_KG_H2 * emissionFactor * hydrogenProduction.batch.amount;

    const hydrogenProducedKgInput = `Hydrogen Produced: ${hydrogenProduction.batch.amount} ${MeasurementUnit.KG_H2}`;

    const emissionFactorLabel = EnumLabelMapper.getEnergySource(EnergySource.GRID);
    const energyDemandInput = `Energy Demand: ${EmissionNumericConstants.ENERGY_DEMAND_COMPRESSION_KWH_PER_KG_H2} ${MeasurementUnit.KWH_PER_KG_H2}`;
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${emissionFactor} ${MeasurementUnit.G_CO2_PER_KWH}`;
    const formula = `E = Energy Demand * Emission Factor ${emissionFactorLabel} * Hydrogen Produced`;
    const formulaResult = `${result} ${MeasurementUnit.G_CO2} = ${EmissionNumericConstants.ENERGY_DEMAND_COMPRESSION_KWH_PER_KG_H2} ${MeasurementUnit.KWH_PER_KG_H2} * ${emissionFactor} ${MeasurementUnit.G_CO2_PER_KWH} * ${hydrogenProduction.batch.amount} ${MeasurementUnit.KG_H2}`;

    const basisOfCalculation = [
      energyDemandInput,
      emissionFactorInput,
      hydrogenProducedKgInput,
      formula,
      formulaResult,
    ];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      EmissionStringConstants.COMPRESSION,
      basisOfCalculation,
      result,
      MeasurementUnit.G_CO2,
      CalculationTopic.HYDROGEN_STORAGE,
    );
  }

  static assembleHydrogenBottling(
    _hydrogenBottling: ProcessStepEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (_hydrogenBottling?.type !== ProcessType.HYDROGEN_BOTTLING) {
      throw new Error(`Invalid process step type [${_hydrogenBottling?.type}] for hydrogen bottling emission calculation`);
    }

    const result = 0;

    const basisOfCalculation = ['E = [TBD]'];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      EmissionStringConstants.HYDROGEN_BOTTLING,
      basisOfCalculation,
      result,
      MeasurementUnit.G_CO2,
      CalculationTopic.HYDROGEN_BOTTLING,
    );
  }

  static assembleHydrogenTransportation(
    hydrogenTransportation: ProcessStepEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (hydrogenTransportation?.type !== ProcessType.HYDROGEN_TRANSPORTATION) {
      throw new Error(`Invalid process step type [${hydrogenTransportation?.type}] for hydrogen transportation emission calculation`);
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

    const basisOfCalculation = [`E = 0 ${MeasurementUnit.G_CO2_PER_KG_H2}`];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      EmissionStringConstants.HYDROGEN_TRANSPORTATION_PIPELINE,
      basisOfCalculation,
      result,
      MeasurementUnit.G_CO2,
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
  }

  private static assembleTrailer(
    hydrogenAmount: number,
    fuelType: FuelType,
    transportDistance: number,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    const trailerParameter: TrailerParameter =
      EmissionNumericConstants.TRAILER_PARAMETERS.find((trailerEntry) => hydrogenAmount <= trailerEntry.capacity) ??
      EmissionNumericConstants.TRAILER_PARAMETERS.at(EmissionNumericConstants.TRAILER_PARAMETERS.length - 1);

    const tonPerKg = 0.001;

    // Amount of fuel used per ton of material transported = transport distance * transport efficiency
    // [MJ fuel / ton of H₂] = [km] * [MJ fuel / (ton, km)]
    const transportEfficiency = trailerParameter.transportEfficiency;
    const amountOfFuelPerTonOfHydrogen = transportDistance * transportEfficiency;

    // Emission = 0.001 * Amount of fuel used per ton of material transported * emission factor
    // [g CO₂,eq/kg of H₂] = [ton / kg] * [MJ fuel / ton of H₂] * [g CO₂,eq / MJ fuel]
    const emissionFactorFuel = EmissionNumericConstants.FUEL_EMISSION_FACTORS[fuelType];
    const emissionsFuelCombustion = tonPerKg * amountOfFuelPerTonOfHydrogen * emissionFactorFuel;

    // Emission = 0.001 * transport distance * emission factor for CH4 and N2O emissions
    // [g CO₂,eq/kg of H₂] = [ton / kg] * [km] * [g CO₂,eq / (ton, km)]
    const emissionFactorCh4AndN2O = trailerParameter.emissionFactor;
    const emissionCh4AndN2O = tonPerKg * transportDistance * emissionFactorCh4AndN2O;

    const result = (emissionsFuelCombustion + emissionCh4AndN2O) * hydrogenAmount;

    const fuelTypeLabel = EnumLabelMapper.getFuelType(fuelType);
    const tonPerKgInput = `Ton per Kg: ${tonPerKg} ton/kg`;
    const transportDistanceInput = `Transport Distance: ${transportDistance} ${MeasurementUnit.KM}`;
    const transportEfficiencyInput = `Transport Efficiency: ${transportEfficiency} ${MeasurementUnit.MJ_FUEL_PER_TON_KM}`;
    const emissionFactorFuelInput = `Emission Factor ${fuelTypeLabel}: ${emissionFactorFuel} ${MeasurementUnit.G_CO2_PER_MJ}`;
    const emissionFactorCh4AndN2OInput = `Emission Factor ${EmissionStringConstants.CH4_N2O}: ${emissionFactorCh4AndN2O} ${MeasurementUnit.G_CO2_PER_TON_KM}`;
    const hydrogenTransportedInput = `Hydrogen Transported: ${hydrogenAmount} ${MeasurementUnit.KG_H2}`;
    const emissionFuelCombustionFormula = `Emission Fuel Combustion = Ton per Kg * Transport Distance * Transport Efficiency * Emission Factor ${fuelTypeLabel}`;
    const emissionCh4AndN2OFormula = `Emission ${EmissionStringConstants.CH4_N2O} = Ton per Kg * Transport Distance * Emission Factor ${EmissionStringConstants.CH4_N2O}`;
    const formula = `E = (Emission Fuel Combustion + Emission ${EmissionStringConstants.CH4_N2O}) * Hydrogen Transported`;
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
      EmissionStringConstants.HYDROGEN_TRANSPORTATION_TRAILER,
      basisOfCalculation,
      result,
      MeasurementUnit.G_CO2,
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
      .filter((e) => e.name === EmissionStringConstants.TYPES.EPS || e.name === EmissionStringConstants.TYPES.EWS)
      .reduce((sum, e) => sum + e.amount, 0);

    const applicationEmissionAmount: number = applicationEmissions.reduce((acc, emission) => acc + emission.amount, 0);
    const hydrogenTransportEmissionAmount: number = applicationEmissions.find((e) => e.name === EmissionStringConstants.TYPES.EHT)?.amount ?? 0;
    const regulatoryEmissions: ProofOfSustainabilityEmissionEntity[] = EmissionAssembler.assembleRegulatoryEmissions(
      hydrogenProductionEmissionAmount,
      applicationEmissionAmount,
      hydrogenTransportEmissionAmount,
    );
    const emissions: ProofOfSustainabilityEmissionEntity[] = [...applicationEmissions, ...regulatoryEmissions];

    const totalEmissions: number = applicationEmissionAmount;
    const amountCO2PerKgH2: number = applicationEmissionAmount / hydrogenAmountKg;
    const amountCO2PerMJH2: number = amountCO2PerKgH2 / EmissionNumericConstants.H2_LOWER_HEATING_VALUE_MJ_PER_KG;

    const emissionReductionPercentage: number =
      (Math.max(EmissionNumericConstants.FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ - amountCO2PerMJH2, 0) / EmissionNumericConstants.FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ) * 100;

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
        .reduce((acc, emissionCalculation) => acc + Number(emissionCalculation.name), 0);

    const powerSupplyEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(CalculationTopic.POWER_SUPPLY);
    const powerSupplyEmission = new ProofOfSustainabilityEmissionEntity(
      powerSupplyEmissionAmount,
      EmissionStringConstants.TYPES.EPS,
      EmissionStringConstants.POWER_SUPPLY,
      EmissionStringConstants.TYPES.APPLICATION,
    );

    const waterSupplyEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(CalculationTopic.WATER_SUPPLY);
    const waterSupplyEmission = new ProofOfSustainabilityEmissionEntity(
      waterSupplyEmissionAmount,
      EmissionStringConstants.TYPES.EWS,
      EmissionStringConstants.WATER_SUPPLY,
      EmissionStringConstants.TYPES.APPLICATION,
    );

    const hydrogenStorageEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_STORAGE,
    );
    const hydrogenStorageEmission = new ProofOfSustainabilityEmissionEntity(
      hydrogenStorageEmissionAmount,
      EmissionStringConstants.TYPES.EHS,
      EmissionStringConstants.HYDROGEN_STORAGE,
      EmissionStringConstants.TYPES.APPLICATION,
    );

    const hydrogenBottlingEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_BOTTLING,
    );
    const hydrogenBottlingEmission = new ProofOfSustainabilityEmissionEntity(
      hydrogenBottlingEmissionAmount,
      EmissionStringConstants.TYPES.EHB,
      EmissionStringConstants.HYDROGEN_BOTTLING,
      EmissionStringConstants.TYPES.APPLICATION,
    );

    const hydrogenTransportationEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
    const hydrogenTransportationEmission = new ProofOfSustainabilityEmissionEntity(
      hydrogenTransportationEmissionAmount,
      EmissionStringConstants.TYPES.EHT,
      EmissionStringConstants.HYDROGEN_TRANSPORTATION,
      EmissionStringConstants.TYPES.APPLICATION,
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
      EmissionStringConstants.TYPES.EI,
      EmissionStringConstants.SUPPLY_OF_INPUTS,
      EmissionStringConstants.TYPES.REGULATORY,
    );

    const ep = new ProofOfSustainabilityEmissionEntity(
      applicationEmissionAmount - hydrogenProductionEmissionAmount - hydrogenTransportEmissionAmount,
      EmissionStringConstants.TYPES.EP,
      EmissionStringConstants.PROCESSING,
      EmissionStringConstants.TYPES.REGULATORY,
    );

    const etd = new ProofOfSustainabilityEmissionEntity(
      hydrogenTransportEmissionAmount,
      EmissionStringConstants.TYPES.ETD,
      EmissionStringConstants.TRANSPORT_AND_DISTRIBUTION,
      EmissionStringConstants.TYPES.REGULATORY,
    );

    return [ei, ep, etd];
  }

  static assembleEmissionEntity(
    emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity,
    kgHydrogen: number,
  ): ProofOfOriginEmissionEntity {
    const totalEmissions = emissionCalculation?.result ?? 0;
    const totalEmissionsPerKgHydrogen = totalEmissions / kgHydrogen;
    return {
      totalEmissions: totalEmissions,
      totalEmissionsPerKgHydrogen: totalEmissionsPerKgHydrogen,
      basisOfCalculation: emissionCalculation?.basisOfCalculation ?? [],
    };
  }
}
