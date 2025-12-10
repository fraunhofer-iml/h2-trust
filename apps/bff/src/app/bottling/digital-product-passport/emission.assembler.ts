/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '@h2-trust/amqp';
import {
  EmissionCalculationDto,
  EmissionComputationResultDto,
  EmissionDto,
  EmissionForProcessStepDto,
} from '@h2-trust/api';
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

export class EmissionCalculationAssembler {
  static assemblePowerSupplyCalculation(
    powerProduction: ProcessStepEntity,
    energySource: EnergySource,
    hydrogenAmount: number,
  ): EmissionCalculationDto {
    if (powerProduction?.type !== ProcessType.POWER_PRODUCTION) {
      throw new Error(`Invalid process step type [${powerProduction?.type}] for power supply emission calculation`);
    }

    const label = POWER_EMISSION_FACTORS[energySource].label;

    const powerInput = powerProduction.batch.amount;
    const emissionFactor = POWER_EMISSION_FACTORS[energySource].emissionFactor;
    const hydrogenOutput = hydrogenAmount;
    const result = (powerInput * emissionFactor) / hydrogenOutput;

    const powerInputVar = `Power Input: ${powerInput} kWh`;
    const emissionFactorVar = `Emission Factor: ${emissionFactor} g CO₂,eq/kWh`;
    const hydrogenOutputVar = `Hydrogen Output: ${hydrogenOutput} kg H₂`;
    const formula = `E = (Energy Input *  Emission Factor) / Hydrogen Output`;
    const basisOfCalculation = [powerInputVar, emissionFactorVar, hydrogenOutputVar, formula];

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.POWER_SUPPLY;

    return new EmissionCalculationDto(label, basisOfCalculation, result, unit, calculationTopic);
  }

  static assembleWaterSupplyCalculation(waterSupply: ProcessStepEntity, hydrogenAmount: number): EmissionCalculationDto {
    if (waterSupply?.type !== ProcessType.WATER_CONSUMPTION) {
      throw new Error(`Invalid process step type [${waterSupply?.type}] for water supply emission calculation`);
    }

    const label = 'Emissions (Water Supply)';

    const waterInput = waterSupply.batch.amount;
    const emissionFactor = 0.43;
    const hydrogenOutput = hydrogenAmount;
    const result = (waterInput * emissionFactor) / hydrogenOutput;

    const waterInputVar = `Water Input: ${waterInput} L`;
    const emissionFactorVar = `Emission Factor: ${emissionFactor} g CO₂,eq/L`;
    const hydrogenOutputVar = `Hydrogen Output: ${hydrogenOutput} kg H₂`;
    const formula = `E = (Water Input * Emission Factor) / Hydrogen Output`;

    const basisOfCalculation = [waterInputVar, emissionFactorVar, hydrogenOutputVar, formula];

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.WATER_SUPPLY;

    return new EmissionCalculationDto(label, basisOfCalculation, result, unit, calculationTopic);
  }

  static assembleHydrogenStorageCalculation(hydrogenProduction: ProcessStepEntity): EmissionCalculationDto {
    if (hydrogenProduction?.type !== ProcessType.HYDROGEN_PRODUCTION) {
      throw new Error(`Invalid process step type [${hydrogenProduction?.type}] for hydrogen storage emission calculation`);
    }

    const label = 'Emissions (Compression)';

    const energyDemand = 1.65;
    const emissionFactor = POWER_EMISSION_FACTORS[EnergySource.GRID].emissionFactor;
    const result = energyDemand * emissionFactor;

    const energyDemandVar = `Energy Demand: ${energyDemand} kWh/kg H₂`;
    const emissionFactorVar = `Emission Factor: ${emissionFactor} g CO₂,eq/kWh`;
    const formula = `E = Energy Demand * Emission Factor`;
    const basisOfCalculation = [energyDemandVar, emissionFactorVar, formula];

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.HYDROGEN_STORAGE;

    return new EmissionCalculationDto(label, basisOfCalculation, result, unit, calculationTopic);
  }

  static assembleHydrogenBottlingCalculation(_hydrogenBottling: ProcessStepEntity): EmissionCalculationDto {
    if (_hydrogenBottling?.type !== ProcessType.HYDROGEN_BOTTLING) {
      throw new Error(
        `Invalid process step type [${_hydrogenBottling?.type}] for hydrogen bottling emission calculation`,
      );
    }

    const label = 'Emissions (Hydrogen Bottling)';

    const result = 0;

    const basisOfCalculation = [`TBA`];

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.HYDROGEN_BOTTLING;

    return new EmissionCalculationDto(label, basisOfCalculation, result, unit, calculationTopic);
  }

  static assembleHydrogenTransportationCalculation(processStep: ProcessStepEntity): EmissionCalculationDto {
    if (processStep?.type !== ProcessType.HYDROGEN_TRANSPORTATION) {
      throw new Error(
        `Invalid process step type [${processStep?.type}] for hydrogen transportation emission calculation`,
      );
    }

    const transportMode: string = processStep.transportationDetails?.transportMode;
    let emissionCalculation: EmissionCalculationDto;

    switch (transportMode) {
      case TransportMode.PIPELINE:
        emissionCalculation = this.assemblePipelineCalculation();
        break;
      case TransportMode.TRAILER:
        emissionCalculation = this.assembleTrailerCalculation(
          processStep.batch.amount,
          processStep.transportationDetails.fuelType,
          processStep.transportationDetails.distance,
        );
        break;
      default:
        throw new Error(`Unknown transport mode [${transportMode}] for process step [${processStep.id}]`);
    }

    return emissionCalculation;
  }

  private static assemblePipelineCalculation(): EmissionCalculationDto {
    const label = 'Emissions (Transportation with Pipeline)';

    const result = 0;
    const basisOfCalculation = ['E = 0 g CO₂,eq/kg H₂'];

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.HYDROGEN_TRANSPORTATION;

    return new EmissionCalculationDto(label, basisOfCalculation, result, unit, calculationTopic);
  }

  private static assembleTrailerCalculation(
    amount: number,
    fuelType: FuelType,
    distanceKm: number,
  ): EmissionCalculationDto {
    const label = 'Emissions (Transportation with Trailer)';

    const trailerParameter: TrailerParameter =
      TRAILER_PARAMETERS.find((trailerEntry) => amount <= trailerEntry.capacityKg) ??
      TRAILER_PARAMETERS.at(TRAILER_PARAMETERS.length - 1);

    const transportEfficiency: number = trailerParameter.transportEfficiencyMJPerTonnePerKm / 1000;
    const emissionFactor: number = FUEL_EMISSION_FACTORS[fuelType];
    const emissions: number = trailerParameter.gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2 / 1000;
    const result = distanceKm * (transportEfficiency * emissionFactor + emissions);

    const formula = `E = ${distanceKm} km * (${transportEfficiency} MJ fuel/(km*kg H₂) * ${emissionFactor} g CO₂,eq/MJ fuel + ${emissions} g CO₂,eq/(km*kg H₂))`;

    const basisOfCalculation = [formula];

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.HYDROGEN_TRANSPORTATION;

    return new EmissionCalculationDto(label, basisOfCalculation, result, unit, calculationTopic);
  }

  static assembleComputationResult(emissionCalculations: EmissionCalculationDto[]): EmissionComputationResultDto {
    const applicationEmissions: EmissionForProcessStepDto[] =
      EmissionCalculationAssembler.assembleApplicationEmissions(emissionCalculations);

    const hydrogenProductionEmissionAmount: number = applicationEmissions
      .filter((e) => e.name === 'eps' || e.name === 'ews')
      .reduce((sum, e) => sum + e.amount, 0);

    const applicationEmissionAmount: number = applicationEmissions.reduce((acc, emission) => acc + emission.amount, 0);
    const hydrogenTransportEmissionAmount: number = applicationEmissions.find((e) => e.name === 'eht')?.amount ?? 0;

    const regulatoryEmissions: EmissionForProcessStepDto[] = EmissionCalculationAssembler.assembleRegulatoryEmissions(
      hydrogenProductionEmissionAmount,
      applicationEmissionAmount,
      hydrogenTransportEmissionAmount,
    );
    const processStepEmissions: EmissionForProcessStepDto[] = [...applicationEmissions, ...regulatoryEmissions];

    const amountCO2PerMJH2: number = applicationEmissionAmount / GRAVIMETRIC_ENERGY_DENSITY_H2_MJ_PER_KG;
    const emissionReductionPercentage: number =
      (Math.max(FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ - amountCO2PerMJH2, 0) / FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ) * 100;

    return new EmissionComputationResultDto(
      emissionCalculations,
      processStepEmissions,
      amountCO2PerMJH2,
      emissionReductionPercentage,
    );
  }

  private static assembleApplicationEmissions(
    emissionCalculations: EmissionCalculationDto[],
  ): EmissionForProcessStepDto[] {
    const calculateTotalEmissionAmountByCalculationTopic = (calculationTopic: CalculationTopic): number =>
      emissionCalculations
        .filter((emissionCalculation) => emissionCalculation.calculationTopic === calculationTopic)
        .reduce((acc, emissionCalculation) => acc + (emissionCalculation.result ?? 0), 0);

    const powerSupplyEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(CalculationTopic.POWER_SUPPLY);
    const powerSupplyEmission = new EmissionForProcessStepDto(
      powerSupplyEmissionAmount,
      'eps',
      'Power Supply',
      'APPLICATION',
    );

    const waterSupplyEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(CalculationTopic.WATER_SUPPLY);
    const waterSupplyEmission = new EmissionForProcessStepDto(
      waterSupplyEmissionAmount,
      'ews',
      'Water Supply',
      'APPLICATION',
    );

    const hydrogenStorageEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_STORAGE,
    );
    const hydrogenStorageEmission = new EmissionForProcessStepDto(
      hydrogenStorageEmissionAmount,
      'ehs',
      'Hydrogen Storage',
      'APPLICATION',
    );

    const hydrogenBottlingEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_BOTTLING,
    );
    const hydrogenBottlingEmission = new EmissionForProcessStepDto(
      hydrogenBottlingEmissionAmount,
      'ehb',
      'Hydrogen Bottling',
      'APPLICATION',
    );

    const hydrogenTransportationEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
    const hydrogenTransportationEmission = new EmissionForProcessStepDto(
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
  ): EmissionForProcessStepDto[] {
    const ei = new EmissionForProcessStepDto(hydrogenProductionEmissionAmount, 'ei', 'Supply of Inputs', 'REGULATORY');

    const ep = new EmissionForProcessStepDto(
      applicationEmissionAmount - hydrogenProductionEmissionAmount - hydrogenTransportEmissionAmount,
      'ep',
      'Processing',
      'REGULATORY',
    );

    const etd = new EmissionForProcessStepDto(
      hydrogenTransportEmissionAmount,
      'etd',
      'Transport and Distribution',
      'REGULATORY',
    );

    return [ei, ep, etd];
  }

  static assembleEmissionDto(calc: EmissionCalculationDto, hydrogenMassKg: number): EmissionDto {
    const amountCO2PerKgH2 = calc?.result ?? 0;
    const amountCO2 = amountCO2PerKgH2 * hydrogenMassKg;
    return new EmissionDto(amountCO2, amountCO2PerKgH2, calc?.basisOfCalculation ?? []);
  }
}
