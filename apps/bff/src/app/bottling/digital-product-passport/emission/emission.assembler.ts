/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '@h2-trust/amqp';
import { EmissionCalculationDto, EmissionComputationResultDto, EmissionForProcessStepDto } from '@h2-trust/api';
import {
  CalculationTopic,
  FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ,
  getFuelEmissionFactorByFuelType,
  getPowerEmissionFactorByEnergySource,
  getTrailerParameters,
  GRAVIMETRIC_ENERGY_DENSITY_H2_MJ_PER_KG,
  TrailerEntry,
  TransportMode,
  UNIT_G_CO2_PER_KG_H2,
} from '@h2-trust/domain';

export class EmissionCalculationAssembler {
  static assemblePowerProductionCalculation(powerProduction: ProcessStepEntity, emissionFactorGPerKWh: number, label: string): EmissionCalculationDto {
    const successorProducedHydrogenMassKg = powerProduction.batch.successors[0].amount;
    const basisOfCalculation = `E = ${powerProduction.batch.amount} kWh * ${emissionFactorGPerKWh} g CO₂,eq/kWh / ${successorProducedHydrogenMassKg} kg H₂`;
    const result = (powerProduction.batch.amount * emissionFactorGPerKWh) / successorProducedHydrogenMassKg;
    return new EmissionCalculationDto(label, basisOfCalculation, result, UNIT_G_CO2_PER_KG_H2, CalculationTopic.HYDROGEN_PRODUCTION);
  }

  static assembleWaterSupplyCalculation(waterSupply: ProcessStepEntity): EmissionCalculationDto {
    const emissionFactorGCO2EqPerLiterWater = 0.43;
    const successorProducedHydrogenMassKg = waterSupply.batch.successors[0].amount;
    const basisOfCalculation = `E = ${waterSupply.batch.amount} L * ${emissionFactorGCO2EqPerLiterWater} g CO₂,eq/L / ${successorProducedHydrogenMassKg} kg H₂`;
    const result = (waterSupply.batch.amount * emissionFactorGCO2EqPerLiterWater) / successorProducedHydrogenMassKg;
    return new EmissionCalculationDto('Emissions (Water Consumption)', basisOfCalculation, result, UNIT_G_CO2_PER_KG_H2, CalculationTopic.WATER_SUPPLY);
  }

  static assembleHydrogenStorageCalculation(_hydrogenStorage: ProcessStepEntity): EmissionCalculationDto {
    return new EmissionCalculationDto('Emissions (Hydrogen Storage - placeholder)', 'TBA', 0, UNIT_G_CO2_PER_KG_H2, CalculationTopic.HYDROGEN_STORAGE);
  }

  static assembleHydrogenBottlingCalculation(): EmissionCalculationDto {
    const compressionKWhPerKg = 1.65;
    const powerEmissionFactor = getPowerEmissionFactorByEnergySource('GRID').emissionFactor;
    const basisOfCalculation = `E = ${compressionKWhPerKg} kWh/kg H₂ * ${powerEmissionFactor} g CO₂,eq/kWh`;
    const result = compressionKWhPerKg * powerEmissionFactor;
    return new EmissionCalculationDto('Emissions (Compression)', basisOfCalculation, result, UNIT_G_CO2_PER_KG_H2, CalculationTopic.HYDROGEN_BOTTLING);
  }

  static assembleHydrogenTransportationCalculation(processStep: ProcessStepEntity): EmissionCalculationDto {
    const transportMode: string = processStep.transportationDetails?.transportMode;
    let emissionCalculation: EmissionCalculationDto;

    switch (transportMode) {
      case TransportMode.PIPELINE:
        emissionCalculation = this.assemblePipelineCalculation();
        break;
      case TransportMode.TRAILER:
        emissionCalculation = this.assembleTrailerCalculation(processStep.transportationDetails.distance, processStep.transportationDetails.fuelType);
        break;
      default:
        throw new Error(`Unknown transport mode [${transportMode}] for process step [${processStep.id}]`);
    }

    return emissionCalculation;
  }

  private static assemblePipelineCalculation(): EmissionCalculationDto {
    return new EmissionCalculationDto('Emissions (Transportation with Pipeline)', 'E = 0 g CO₂,eq/kg H₂', 0, UNIT_G_CO2_PER_KG_H2, CalculationTopic.HYDROGEN_TRANSPORTATION);
  }

  private static assembleTrailerCalculation(distanceKm: number, fuelType: string): EmissionCalculationDto {
    const fuelFactor = getFuelEmissionFactorByFuelType(fuelType);

    const trailerParams: TrailerEntry = getTrailerParameters(155); // TODO-MP: hardcoded value will be calculated in DUHGW-176
    const transportEfficiencyMJPerKgPerKm = trailerParams.transportEfficiencyMJPerTonnePerKm / 1000;
    const gEqEmissionsOfCH4AndN2OPerKmPerKgH2 = trailerParams.gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2 / 1000;

    const basisOfCalculation = `E = ${distanceKm} km * (${transportEfficiencyMJPerKgPerKm} MJ fuel/(km*kg H₂) * ${fuelFactor} g CO₂,eq/MJ fuel + ${gEqEmissionsOfCH4AndN2OPerKmPerKgH2} g CO₂,eq/(km*kg H₂))`;
    const result = distanceKm * (transportEfficiencyMJPerKgPerKm * fuelFactor + gEqEmissionsOfCH4AndN2OPerKmPerKgH2);

    return new EmissionCalculationDto('Emissions (Transportation with Trailer)', basisOfCalculation, result, UNIT_G_CO2_PER_KG_H2, CalculationTopic.HYDROGEN_TRANSPORTATION);
  }

  static assembleCumulativeCalculation(emissionCalculations: EmissionCalculationDto[], emissionCalculationName: string): EmissionCalculationDto {
    const basisOfCalculation = `Emissions (Cumulative - ${emissionCalculationName})`;
    const totalEmissionsPerKg = (emissionCalculations ?? [])
      .reduce((acc, emissionCalculation) => acc + (emissionCalculation.result || 0), 0);

    return new EmissionCalculationDto(emissionCalculationName, basisOfCalculation, totalEmissionsPerKg, UNIT_G_CO2_PER_KG_H2, undefined);
  }

  static assembleComputationResult(emissionCalculations: EmissionCalculationDto[]): EmissionComputationResultDto {
    const applicationEmissions: EmissionForProcessStepDto[] = EmissionCalculationAssembler.assembleApplicationEmissions(emissionCalculations);
    const totalApplicationEmission: number = applicationEmissions.reduce((acc, emission) => acc + emission.amount, 0);
    const transportApplicationEmission: number = applicationEmissions.find((e) => e.name === 'Et')?.amount ?? 0;

    const regulatoryEmissions: EmissionForProcessStepDto[] = EmissionCalculationAssembler.assembleRegulatoryEmissions(totalApplicationEmission, transportApplicationEmission);

    const processStepEmissions: EmissionForProcessStepDto[] = [...applicationEmissions, ...regulatoryEmissions];

    const amountCO2PerMJH2: number = totalApplicationEmission / GRAVIMETRIC_ENERGY_DENSITY_H2_MJ_PER_KG;
    const emissionReductionPercentage: number = ((FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ - amountCO2PerMJH2) / FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ) * 100;

    return new EmissionComputationResultDto(emissionCalculations, processStepEmissions, amountCO2PerMJH2, emissionReductionPercentage);
  }

  private static assembleApplicationEmissions(emissionCalculations: EmissionCalculationDto[]): EmissionForProcessStepDto[] {
    const calculateTotalEmissionsByCalculationTopic = (calculationTopic: CalculationTopic): number => emissionCalculations
      .filter((emissionCalculation) => emissionCalculation.calculationTopic === calculationTopic)
      .reduce((acc, emissionCalculation) => acc + (emissionCalculation.result ?? 0), 0);

    const hydrogenProductionTotalEmissions = calculateTotalEmissionsByCalculationTopic(CalculationTopic.HYDROGEN_PRODUCTION);
    const hydrogenProductionEmission = new EmissionForProcessStepDto(hydrogenProductionTotalEmissions, 'Ehp', 'Hydrogen Production Emissions', 'APPLICATION');

    const waterSupplyTotalEmissions = calculateTotalEmissionsByCalculationTopic(CalculationTopic.WATER_SUPPLY);
    const waterSupplyEmission = new EmissionForProcessStepDto(waterSupplyTotalEmissions, 'Ew', 'Water Supply Emissions', 'APPLICATION');

    const hydrogenStorageTotalEmissions = calculateTotalEmissionsByCalculationTopic(CalculationTopic.HYDROGEN_STORAGE);
    const hydrogenStorageEmission = new EmissionForProcessStepDto(hydrogenStorageTotalEmissions, 'Ehs', 'Hydrogen Storage Emissions', 'APPLICATION');

    const hydrogenBottlingTotalEmissions = calculateTotalEmissionsByCalculationTopic(CalculationTopic.HYDROGEN_BOTTLING);
    const hydrogenBottlingEmission = new EmissionForProcessStepDto(hydrogenBottlingTotalEmissions, 'Eb', 'Hydrogen Bottling Emissions', 'APPLICATION');

    const hydrogenTransportationTotalEmissions = calculateTotalEmissionsByCalculationTopic(CalculationTopic.HYDROGEN_TRANSPORTATION);
    const hydrogenTransportationEmission = new EmissionForProcessStepDto(hydrogenTransportationTotalEmissions, 'Et', 'Hydrogen Transportation Emissions', 'APPLICATION');

    return [
      hydrogenProductionEmission,
      waterSupplyEmission,
      hydrogenStorageEmission,
      hydrogenBottlingEmission,
      hydrogenTransportationEmission,
    ];
  }

  private static assembleRegulatoryEmissions(totalApplicationEmission: number, transportApplicationAmount: number): EmissionForProcessStepDto[] {
    const transportAndDistributionEmission = new EmissionForProcessStepDto(transportApplicationAmount, 'Etd', 'Emissions from transport and distribution', 'REGULATORY');
    const processingEmission = new EmissionForProcessStepDto(totalApplicationEmission - transportApplicationAmount, 'Ep', 'Processing emissions', 'REGULATORY');

    return [
      transportAndDistributionEmission,
      processingEmission,
    ];
  }
}
