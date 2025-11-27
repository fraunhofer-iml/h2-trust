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
  TRAILER_PARAMETERS,
  TrailerParameter,
  TransportMode,
  UNIT_G_CO2_PER_KG_H2,
} from '@h2-trust/domain';

export class EmissionCalculationAssembler {
  static assemblePowerSupplyCalculation(
    powerSupply: ProcessStepEntity,
    energySource: EnergySource,
  ): EmissionCalculationDto {
    const label = POWER_EMISSION_FACTORS[energySource].label;
    const powerAmountKwh = powerSupply.batch.amount;
    const emissionFactorGPerKWh = POWER_EMISSION_FACTORS[energySource].emissionFactor;
    const successorProducedHydrogenMassKg = powerSupply.batch.successors[0].amount;

    const basisOfCalculation = `E = ${powerAmountKwh} kWh * ${emissionFactorGPerKWh} g CO₂,eq/kWh / ${successorProducedHydrogenMassKg} kg H₂`;
    const result = (powerAmountKwh * emissionFactorGPerKWh) / successorProducedHydrogenMassKg;

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.POWER_SUPPLY;

    return new EmissionCalculationDto(label, basisOfCalculation, result, unit, calculationTopic);
  }

  static assembleWaterSupplyCalculation(waterSupply: ProcessStepEntity): EmissionCalculationDto {
    const label = 'Emissions (Water Supply)';

    const emissionFactorGCO2EqPerLiterWater = 0.43;
    const successorProducedHydrogenMassKg = waterSupply.batch.successors[0].amount;
    const basisOfCalculation = `E = ${waterSupply.batch.amount} L * ${emissionFactorGCO2EqPerLiterWater} g CO₂,eq/L / ${successorProducedHydrogenMassKg} kg H₂`;
    const result = (waterSupply.batch.amount * emissionFactorGCO2EqPerLiterWater) / successorProducedHydrogenMassKg;

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.WATER_SUPPLY;

    return new EmissionCalculationDto(label, basisOfCalculation, result, unit, calculationTopic);
  }

  static assembleHydrogenStorageCalculation(numberOfHydrogenProductionBatches: number): EmissionCalculationDto {
    const label = 'Emissions (Compression)';

    const compressionKWhPerKg = 1.65;
    const powerEmissionFactor = POWER_EMISSION_FACTORS[EnergySource.GRID].emissionFactor;
    const basisOfCalculation = `E = ${compressionKWhPerKg} kWh/kg H₂ * ${powerEmissionFactor} g CO₂,eq/kWh / ${numberOfHydrogenProductionBatches} batches`;
    const result = compressionKWhPerKg * powerEmissionFactor / numberOfHydrogenProductionBatches;

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.HYDROGEN_STORAGE;

    return new EmissionCalculationDto(label, basisOfCalculation, result, unit, calculationTopic);
  }

  static assembleHydrogenBottlingCalculation(_hydrogenBottling: ProcessStepEntity): EmissionCalculationDto {
    const label = 'Emissions (Hydrogen Bottling)';

    const basisOfCalculation = `TBA`;
    const result = 0;

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.HYDROGEN_BOTTLING;

    return new EmissionCalculationDto(label, basisOfCalculation, result, unit, calculationTopic);
  }

  static assembleHydrogenTransportationCalculation(processStep: ProcessStepEntity): EmissionCalculationDto {
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

    const basisOfCalculation = 'E = 0 g CO₂,eq/kg H₂';
    const result = 0;

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
    const fuelEmissionFactor: number = FUEL_EMISSION_FACTORS[fuelType];

    const transportEfficiencyMJPerKgPerKm = trailerParameter.transportEfficiencyMJPerTonnePerKm / 1000;
    const gEqEmissionsOfCH4AndN2OPerKmPerKgH2 = trailerParameter.gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2 / 1000;

    const basisOfCalculation = `E = ${distanceKm} km * (${transportEfficiencyMJPerKgPerKm} MJ fuel/(km*kg H₂) * ${fuelEmissionFactor} g CO₂,eq/MJ fuel + ${gEqEmissionsOfCH4AndN2OPerKmPerKgH2} g CO₂,eq/(km*kg H₂))`;
    const result =
      distanceKm * (transportEfficiencyMJPerKgPerKm * fuelEmissionFactor + gEqEmissionsOfCH4AndN2OPerKmPerKgH2);

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
      ((FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ - amountCO2PerMJH2) / FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ) * 100;

    return new EmissionComputationResultDto(
      emissionCalculations,
      processStepEmissions,
      amountCO2PerMJH2,
      emissionReductionPercentage,
    );
  }

  private static assembleApplicationEmissions(emissionCalculations: EmissionCalculationDto[]): EmissionForProcessStepDto[] {
    const calculateTotalEmissionAmountByCalculationTopic = (calculationTopic: CalculationTopic): number =>
      emissionCalculations
        .filter((emissionCalculation) => emissionCalculation.calculationTopic === calculationTopic)
        .reduce((acc, emissionCalculation) => acc + (emissionCalculation.result ?? 0), 0);

    const powerSupplyEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.POWER_SUPPLY,
    );
    const powerSupplyEmission = new EmissionForProcessStepDto(
      powerSupplyEmissionAmount,
      'eps',
      'Emissions from power supply',
      'APPLICATION',
    );

    const waterSupplyEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.WATER_SUPPLY
    );
    const waterSupplyEmission = new EmissionForProcessStepDto(
      waterSupplyEmissionAmount,
      'ews',
      'Emissions from water supply',
      'APPLICATION',
    );

    const hydrogenStorageEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_STORAGE
    );
    const hydrogenStorageEmission = new EmissionForProcessStepDto(
      hydrogenStorageEmissionAmount,
      'ehs',
      'Emissions from hydrogen storage',
      'APPLICATION',
    );

    const hydrogenBottlingEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_BOTTLING,
    );
    const hydrogenBottlingEmission = new EmissionForProcessStepDto(
      hydrogenBottlingEmissionAmount,
      'ehb',
      'Emissions from hydrogen bottling',
      'APPLICATION',
    );

    const hydrogenTransportationEmissionAmount = calculateTotalEmissionAmountByCalculationTopic(
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
    const hydrogenTransportationEmission = new EmissionForProcessStepDto(
      hydrogenTransportationEmissionAmount,
      'eht',
      'Emissions from hydrogen transportation',
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
    const ei = new EmissionForProcessStepDto(
      hydrogenProductionEmissionAmount,
      'ei',
      'Emissions from the supply of inputs',
      'REGULATORY',
    );

    const ep = new EmissionForProcessStepDto(
      applicationEmissionAmount - hydrogenProductionEmissionAmount - hydrogenTransportEmissionAmount,
      'ep',
      'Emissions from processing',
      'REGULATORY',
    );

    const etd = new EmissionForProcessStepDto(
      hydrogenTransportEmissionAmount,
      'etd',
      'Emissions from transport and distribution',
      'REGULATORY',
    );

    return [ei, ep, etd];
  }

  static assembleEmissionDto(calc: EmissionCalculationDto, hydrogenMassKg: number): EmissionDto {
    const amountCO2PerKgH2 = calc?.result ?? 0;
    const amountCO2 = amountCO2PerKgH2 * hydrogenMassKg;
    return new EmissionDto(amountCO2, amountCO2PerKgH2, calc?.basisOfCalculation ?? '');
  }
}
