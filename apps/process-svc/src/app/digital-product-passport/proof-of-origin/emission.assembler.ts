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
  CH4_N2O,
  EMISSION_FACTOR_DEIONIZED_WATER,
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
  UNIT_G_CO2_PER_KG_H2,
  UNIT_G_CO2_PER_KWH,
  UNIT_G_CO2_PER_L,
  UNIT_G_CO2_PER_MJ,
  UNIT_G_CO2_PER_TON_KM,
  UNIT_KG_H2,
  UNIT_KM,
  UNIT_KWH,
  UNIT_KWH_PER_KG_H2,
  UNIT_L,
  UNIT_MJ_FUEL_PER_TON_KM,
} from '@h2-trust/domain';
import { DisplayLabels, EmissionErrorMessages, EmissionTypes } from '../../constants';

export class EmissionAssembler {
  static assemblePowerSupply(
    powerProduction: ProcessStepEntity,
    energySource: EnergySource,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (powerProduction?.type !== ProcessType.POWER_PRODUCTION) {
      throw new Error(EmissionErrorMessages.INVALID_PROCESS_TYPE_FOR_POWER_SUPPLY(powerProduction?.type));
    }

    const power = powerProduction.batch.amount;
    const powerInput = `Power Input: ${power} ${UNIT_KWH}`;

    const emissionFactorLabel = EnumLabelMapper.getEnergySource(energySource);
    const emissionFactor = POWER_EMISSION_FACTORS[energySource].emissionFactor;
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${emissionFactor} ${UNIT_G_CO2_PER_KWH}`;

    const result = power * emissionFactor;
    const formula = `E = Power Input * Emission Factor ${emissionFactorLabel}`;
    const formulaResult = `${result} ${UNIT_G_CO2} = ${power} ${UNIT_KWH} * ${emissionFactor} ${UNIT_G_CO2_PER_KWH}`;

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
      throw new Error(EmissionErrorMessages.INVALID_PROCESS_TYPE_FOR_WATER_SUPPLY(waterSupply?.type));
    }

    const waterInput = waterSupply.batch.amount;
    const result = waterInput * EMISSION_FACTOR_DEIONIZED_WATER;

    const emissionFactorLabel = DisplayLabels.DEIONIZED_WATER;
    const waterInputInput = `Water Input: ${waterInput} ${UNIT_L}`;
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${EMISSION_FACTOR_DEIONIZED_WATER} ${UNIT_G_CO2_PER_L}`;
    const formula = `E = Water Input * Emission Factor ${emissionFactorLabel}`;
    const formulaResult = `${result} ${UNIT_G_CO2} = ${waterInput} ${UNIT_L} * ${EMISSION_FACTOR_DEIONIZED_WATER} ${UNIT_G_CO2_PER_L}`;

    const basisOfCalculation = [waterInputInput, emissionFactorInput, formula, formulaResult];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      DisplayLabels.WATER_SUPPLY,
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
      throw new Error(EmissionErrorMessages.INVALID_PROCESS_TYPE_FOR_HYDROGEN_STORAGE(hydrogenProduction?.type));
    }

    const energyDemand = 1.65; // 5.93 / 3.6 -> default values for compression from 30 bar to 300 bar
    const emissionFactor = POWER_EMISSION_FACTORS[EnergySource.GRID].emissionFactor;
    const result = energyDemand * emissionFactor * hydrogenProduction.batch.amount;

    const hydrogenProducedKgInput = `Hydrogen Produced: ${hydrogenProduction.batch.amount} ${UNIT_KG_H2}`;

    const emissionFactorLabel = EnumLabelMapper.getEnergySource(EnergySource.GRID);
    const energyDemandInput = `Energy Demand: ${energyDemand} ${UNIT_KWH_PER_KG_H2}`;
    const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${emissionFactor} ${UNIT_G_CO2_PER_KWH}`;
    const formula = `E = Energy Demand * Emission Factor ${emissionFactorLabel} * Hydrogen Produced`;
    const formulaResult = `${result} ${UNIT_G_CO2} = ${energyDemand} ${UNIT_KWH_PER_KG_H2} * ${emissionFactor} ${UNIT_G_CO2_PER_KWH} * ${hydrogenProduction.batch.amount} ${UNIT_KG_H2}`;

    const basisOfCalculation = [
      energyDemandInput,
      emissionFactorInput,
      hydrogenProducedKgInput,
      formula,
      formulaResult,
    ];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      DisplayLabels.COMPRESSION,
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
      throw new Error(EmissionErrorMessages.INVALID_PROCESS_TYPE_FOR_HYDROGEN_BOTTLING(_hydrogenBottling?.type));
    }

    const result = 0;

    const basisOfCalculation = ['E = [TBD]'];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      DisplayLabels.HYDROGEN_BOTTLING,
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
        EmissionErrorMessages.INVALID_PROCESS_TYPE_FOR_HYDROGEN_TRANSPORTATION(hydrogenTransportation?.type),
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
        throw new Error(EmissionErrorMessages.UNKNOWN_TRANSPORT_MODE(transportMode, hydrogenTransportation.id));
    }

    return emissionCalculation;
  }

  private static assemblePipeline(): ProofOfSustainabilityEmissionCalculationEntity {
    const result = 0;

    const basisOfCalculation = [`E = 0 ${UNIT_G_CO2_PER_KG_H2}`];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      DisplayLabels.TRANSPORTATION_PIPELINE,
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
      TRAILER_PARAMETERS.find((trailerEntry) => hydrogenAmount <= trailerEntry.capacity) ??
      TRAILER_PARAMETERS.at(TRAILER_PARAMETERS.length - 1);

    const tonPerKg = 0.001;

    // Amount of fuel used per ton of material transported = transport distance * transport efficiency
    // [MJ fuel / ton of H₂] = [km] * [MJ fuel / (ton, km)]
    const transportEfficiency = trailerParameter.transportEfficiency;
    const amountOfFuelPerTonOfHydrogen = transportDistance * transportEfficiency;

    // Emission = 0.001 * Amount of fuel used per ton of material transported * emission factor
    // [g CO₂,eq/kg of H₂] = [ton / kg] * [MJ fuel / ton of H₂] * [g CO₂,eq / MJ fuel]
    const emissionFactorFuel = FUEL_EMISSION_FACTORS[fuelType];
    const emissionsFuelCombustion = tonPerKg * amountOfFuelPerTonOfHydrogen * emissionFactorFuel;

    // Emission = 0.001 * transport distance * emission factor for CH4 and N2O emissions
    // [g CO₂,eq/kg of H₂] = [ton / kg] * [km] * [g CO₂,eq / (ton, km)]
    const emissionFactorCh4AndN2O = trailerParameter.emissionFactor;
    const emissionCh4AndN2O = tonPerKg * transportDistance * emissionFactorCh4AndN2O;

    const result = (emissionsFuelCombustion + emissionCh4AndN2O) * hydrogenAmount;

    const fuelTypeLabel = EnumLabelMapper.getFuelType(fuelType);
    const tonPerKgInput = `Ton per Kg: ${tonPerKg} ton/kg`;
    const transportDistanceInput = `Transport Distance: ${transportDistance} ${UNIT_KM}`;
    const transportEfficiencyInput = `Transport Efficiency: ${transportEfficiency} ${UNIT_MJ_FUEL_PER_TON_KM}`;
    const emissionFactorFuelInput = `Emission Factor ${fuelTypeLabel}: ${emissionFactorFuel} ${UNIT_G_CO2_PER_MJ}`;
    const emissionFactorCh4AndN2OInput = `Emission Factor ${CH4_N2O}: ${emissionFactorCh4AndN2O} ${UNIT_G_CO2_PER_TON_KM}`;
    const hydrogenTransportedInput = `Hydrogen Transported: ${hydrogenAmount} ${UNIT_KG_H2}`;
    const emissionFuelCombustionFormula = `Emission Fuel Combustion = Ton per Kg * Transport Distance * Transport Efficiency * Emission Factor ${fuelTypeLabel}`;
    const emissionCh4AndN2OFormula = `Emission ${CH4_N2O} = Ton per Kg * Transport Distance * Emission Factor ${CH4_N2O}`;
    const formula = `E = (Emission Fuel Combustion + Emission ${CH4_N2O}) * Hydrogen Transported`;
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
      DisplayLabels.TRANSPORTATION_TRAILER,
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
      .filter((e) => e.name === EmissionTypes.EPS || e.name === EmissionTypes.EWS)
      .reduce((sum, e) => sum + e.amount, 0);

    const applicationEmissionAmount: number = applicationEmissions.reduce((acc, emission) => acc + emission.amount, 0);
    const hydrogenTransportEmissionAmount: number = applicationEmissions.find((e) => e.name === EmissionTypes.EHT)?.amount ?? 0;
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
        .reduce((acc, emissionCalculation) => acc + Number(emissionCalculation.name), 0);

    const powerSupplyEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(CalculationTopic.POWER_SUPPLY);
    const powerSupplyEmission = new ProofOfSustainabilityEmissionEntity(
      powerSupplyEmissionAmount,
      EmissionTypes.EPS,
      DisplayLabels.POWER_SUPPLY,
      EmissionTypes.APPLICATION,
    );

    const waterSupplyEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(CalculationTopic.WATER_SUPPLY);
    const waterSupplyEmission = new ProofOfSustainabilityEmissionEntity(
      waterSupplyEmissionAmount,
      EmissionTypes.EWS,
      DisplayLabels.WATER_SUPPLY,
      EmissionTypes.APPLICATION,
    );

    const hydrogenStorageEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_STORAGE,
    );
    const hydrogenStorageEmission = new ProofOfSustainabilityEmissionEntity(
      hydrogenStorageEmissionAmount,
      EmissionTypes.EHS,
      DisplayLabels.HYDROGEN_STORAGE,
      EmissionTypes.APPLICATION,
    );

    const hydrogenBottlingEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_BOTTLING,
    );
    const hydrogenBottlingEmission = new ProofOfSustainabilityEmissionEntity(
      hydrogenBottlingEmissionAmount,
      EmissionTypes.EHB,
      DisplayLabels.HYDROGEN_BOTTLING,
      EmissionTypes.APPLICATION,
    );

    const hydrogenTransportationEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
    const hydrogenTransportationEmission = new ProofOfSustainabilityEmissionEntity(
      hydrogenTransportationEmissionAmount,
      EmissionTypes.EHT,
      DisplayLabels.HYDROGEN_TRANSPORTATION,
      EmissionTypes.APPLICATION,
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
      EmissionTypes.EI,
      DisplayLabels.SUPPLY_OF_INPUTS,
      EmissionTypes.REGULATORY,
    );

    const ep = new ProofOfSustainabilityEmissionEntity(
      applicationEmissionAmount - hydrogenProductionEmissionAmount - hydrogenTransportEmissionAmount,
      EmissionTypes.EP,
      DisplayLabels.PROCESSING,
      EmissionTypes.REGULATORY,
    );

    const etd = new ProofOfSustainabilityEmissionEntity(
      hydrogenTransportEmissionAmount,
      EmissionTypes.ETD,
      DisplayLabels.TRANSPORT_AND_DISTRIBUTION,
      EmissionTypes.REGULATORY,
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
