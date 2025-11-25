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
  static assemblePowerProductionCalculation(
    powerProduction: ProcessStepEntity,
    energySource: EnergySource,
  ): EmissionCalculationDto {
    const label = POWER_EMISSION_FACTORS[energySource].label;
    const powerAmountKwh = powerProduction.batch.amount;
    const emissionFactorGPerKWh = POWER_EMISSION_FACTORS[energySource].emissionFactor;
    const successorProducedHydrogenMassKg = powerProduction.batch.successors[0].amount;

    const basisOfCalculation = `E = ${powerAmountKwh} kWh * ${emissionFactorGPerKWh} g CO₂,eq/kWh / ${successorProducedHydrogenMassKg} kg H₂`;
    const result = (powerAmountKwh * emissionFactorGPerKWh) / successorProducedHydrogenMassKg;

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.HYDROGEN_PRODUCTION;

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

  static assembleHydrogenStorageCalculation(_hydrogenStorage: ProcessStepEntity): EmissionCalculationDto {
    const label = 'Emissions (Hydrogen Storage - placeholder)';

    const basisOfCalculation = `TBA`;
    const result = 0;

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = CalculationTopic.HYDROGEN_STORAGE;

    return new EmissionCalculationDto(label, basisOfCalculation, result, unit, calculationTopic);
  }

  static assembleHydrogenBottlingCalculation(): EmissionCalculationDto {
    const label = 'Emissions (Compression)';

    const compressionKWhPerKg = 1.65;
    const powerEmissionFactor = POWER_EMISSION_FACTORS[EnergySource.GRID].emissionFactor;
    const basisOfCalculation = `E = ${compressionKWhPerKg} kWh/kg H₂ * ${powerEmissionFactor} g CO₂,eq/kWh`;
    const result = compressionKWhPerKg * powerEmissionFactor;

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

  static assembleCumulativeCalculation(
    emissionCalculations: EmissionCalculationDto[],
    emissionCalculationName: string,
  ): EmissionCalculationDto {
    const label = emissionCalculationName;

    const basisOfCalculation = `Emissions (Cumulative - ${emissionCalculationName})`;
    const totalEmissionsPerKg = (emissionCalculations ?? []).reduce(
      (acc, emissionCalculation) => acc + (emissionCalculation.result || 0),
      0,
    );

    const unit = UNIT_G_CO2_PER_KG_H2;
    const calculationTopic = undefined as CalculationTopic;

    return new EmissionCalculationDto(label, basisOfCalculation, totalEmissionsPerKg, unit, calculationTopic);
  }

  static assembleComputationResult(emissionCalculations: EmissionCalculationDto[]): EmissionComputationResultDto {
    const applicationEmissions: EmissionForProcessStepDto[] =
      EmissionCalculationAssembler.assembleApplicationEmissions(emissionCalculations);
    const totalApplicationEmission: number = applicationEmissions.reduce((acc, emission) => acc + emission.amount, 0);
    const transportApplicationEmission: number = applicationEmissions.find((e) => e.name === 'Et')?.amount ?? 0;

    const regulatoryEmissions: EmissionForProcessStepDto[] = EmissionCalculationAssembler.assembleRegulatoryEmissions(
      totalApplicationEmission,
      transportApplicationEmission,
    );
    const processStepEmissions: EmissionForProcessStepDto[] = [...applicationEmissions, ...regulatoryEmissions];

    const amountCO2PerMJH2: number = totalApplicationEmission / GRAVIMETRIC_ENERGY_DENSITY_H2_MJ_PER_KG;
    const emissionReductionPercentage: number =
      ((FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ - amountCO2PerMJH2) / FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ) * 100;

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
    const calculateTotalEmissionsByCalculationTopic = (calculationTopic: CalculationTopic): number =>
      emissionCalculations
        .filter((emissionCalculation) => emissionCalculation.calculationTopic === calculationTopic)
        .reduce((acc, emissionCalculation) => acc + (emissionCalculation.result ?? 0), 0);

    const hydrogenProductionTotalEmissions = calculateTotalEmissionsByCalculationTopic(
      CalculationTopic.HYDROGEN_PRODUCTION,
    );
    const hydrogenProductionEmission = new EmissionForProcessStepDto(
      hydrogenProductionTotalEmissions,
      'Ehp',
      'Hydrogen Production Emissions',
      'APPLICATION',
    );

    const waterSupplyTotalEmissions = calculateTotalEmissionsByCalculationTopic(CalculationTopic.WATER_SUPPLY);
    const waterSupplyEmission = new EmissionForProcessStepDto(
      waterSupplyTotalEmissions,
      'Ew',
      'Water Supply Emissions',
      'APPLICATION',
    );

    const hydrogenStorageTotalEmissions = calculateTotalEmissionsByCalculationTopic(CalculationTopic.HYDROGEN_STORAGE);
    const hydrogenStorageEmission = new EmissionForProcessStepDto(
      hydrogenStorageTotalEmissions,
      'Ehs',
      'Hydrogen Storage Emissions',
      'APPLICATION',
    );

    const hydrogenBottlingTotalEmissions = calculateTotalEmissionsByCalculationTopic(
      CalculationTopic.HYDROGEN_BOTTLING,
    );
    const hydrogenBottlingEmission = new EmissionForProcessStepDto(
      hydrogenBottlingTotalEmissions,
      'Eb',
      'Hydrogen Bottling Emissions',
      'APPLICATION',
    );

    const hydrogenTransportationTotalEmissions = calculateTotalEmissionsByCalculationTopic(
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
    const hydrogenTransportationEmission = new EmissionForProcessStepDto(
      hydrogenTransportationTotalEmissions,
      'Et',
      'Hydrogen Transportation Emissions',
      'APPLICATION',
    );

    return [
      hydrogenProductionEmission,
      waterSupplyEmission,
      hydrogenStorageEmission,
      hydrogenBottlingEmission,
      hydrogenTransportationEmission,
    ];
  }

  private static assembleRegulatoryEmissions(
    totalApplicationEmission: number,
    transportApplicationAmount: number,
  ): EmissionForProcessStepDto[] {
    const transportAndDistributionEmission = new EmissionForProcessStepDto(
      transportApplicationAmount,
      'Etd',
      'Emissions from transport and distribution',
      'REGULATORY',
    );
    const processingEmission = new EmissionForProcessStepDto(
      totalApplicationEmission - transportApplicationAmount,
      'Ep',
      'Processing emissions',
      'REGULATORY',
    );

    return [transportAndDistributionEmission, processingEmission];
  }

  static assembleEmissionDto(calc: EmissionCalculationDto, hydrogenMassKg: number): EmissionDto {
    const amountCO2PerKgH2 = calc?.result ?? 0;
    const amountCO2 = amountCO2PerKgH2 * hydrogenMassKg;
    return new EmissionDto(amountCO2, amountCO2PerKgH2, calc?.basisOfCalculation ?? '');
  }
}
