/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '@h2-trust/amqp';
import { EmissionCalculationDto, EmissionForProcessStepDto } from '@h2-trust/api';
import {
  CalculationTopic,
  getFuelEmissionFactorByFuelType,
  getTrailerParameters,
  TrailerEntry,
  TransportMode,
  UNIT_G_CO2_PER_KG_H2,
} from '@h2-trust/domain';

export class EmissionCalculationAssembler {
  static assemblePowerProductionEmission(powerProduction: ProcessStepEntity, emissionFactorGPerKWh: number, label: string): EmissionCalculationDto {
    const successorProducedHydrogenMassKg = powerProduction.batch.successors[0].amount;
    const basisOfCalculation = `E = ${powerProduction.batch.amount} kWh * ${emissionFactorGPerKWh} g CO₂,eq/kWh / ${successorProducedHydrogenMassKg} kg H₂`;
    const result = (powerProduction.batch.amount * emissionFactorGPerKWh) / successorProducedHydrogenMassKg;
    return new EmissionCalculationDto(label, basisOfCalculation, result, UNIT_G_CO2_PER_KG_H2, CalculationTopic.HYDROGEN_PRODUCTION);
  }

  static assembleWaterConsumptionEmission(waterSupply: ProcessStepEntity): EmissionCalculationDto {
    const emissionFactorGCO2EqPerLiterWater = 0.43;
    const successorProducedHydrogenMassKg = waterSupply.batch.successors[0].amount;
    const basisOfCalculation = `E = ${waterSupply.batch.amount} L * ${emissionFactorGCO2EqPerLiterWater} g CO₂,eq/L / ${successorProducedHydrogenMassKg} kg H₂`;
    const result = (waterSupply.batch.amount * emissionFactorGCO2EqPerLiterWater) / successorProducedHydrogenMassKg;
    return new EmissionCalculationDto('Emissions (Water Consumption)', basisOfCalculation, result, UNIT_G_CO2_PER_KG_H2, CalculationTopic.WATER_SUPPLY);
  }

  static assembleHydrogenStorageEmission(_processStep: ProcessStepEntity): EmissionCalculationDto {
    return new EmissionCalculationDto('Emissions (Hydrogen Storage - placeholder)', 'TBA', 0, UNIT_G_CO2_PER_KG_H2, CalculationTopic.HYDROGEN_STORAGE);
  }

  static assembleHydrogenBottlingEmission(gridFactorGPerKWh: number): EmissionCalculationDto {
    const compressionKWhPerKg = 1.65;
    const basisOfCalculation = `E = ${compressionKWhPerKg} kWh/kg H₂ * ${gridFactorGPerKWh} g CO₂,eq/kWh`;
    const result = compressionKWhPerKg * gridFactorGPerKWh;
    return new EmissionCalculationDto('Emissions (Compression)', basisOfCalculation, result, UNIT_G_CO2_PER_KG_H2, CalculationTopic.HYDROGEN_BOTTLING);
  }

  static assembleHydrogenTransportationEmission(processStep: ProcessStepEntity): EmissionCalculationDto {
    const transportMode: string = processStep.transportationDetails?.transportMode;
    let emissionCalculation: EmissionCalculationDto;

    switch (transportMode) {
      case TransportMode.PIPELINE:
        emissionCalculation = this.assemblePipelineTransportationEmission();
        break;
      case TransportMode.TRAILER:
        emissionCalculation = this.assembleTrailerTransportationEmission(processStep);
        break;
      default:
        throw new Error(`Unknown transport mode ${transportMode}`);
    }

    return emissionCalculation;
  }

  private static assemblePipelineTransportationEmission(): EmissionCalculationDto {
    return new EmissionCalculationDto('Emissions (Transportation with Pipeline)', 'E = 0 g CO₂,eq/kg H₂', 0, UNIT_G_CO2_PER_KG_H2, CalculationTopic.HYDROGEN_TRANSPORTATION);
  }

  private static assembleTrailerTransportationEmission(processStep: ProcessStepEntity): EmissionCalculationDto {
    const distanceKm = processStep.transportationDetails.distance;
    const fuelFactor = getFuelEmissionFactorByFuelType(processStep.transportationDetails.fuelType);

    const trailerParams: TrailerEntry = getTrailerParameters(155); // TODO-MP: hardcoded value will be calculated in DUHGW-176
    const transportEfficiencyMJPerKgPerKm = trailerParams.transportEfficiencyMJPerTonnePerKm / 1000;
    const gEqEmissionsOfCH4AndN2OPerKmPerKgH2 = trailerParams.gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2 / 1000;

    const basisOfCalculation = `E = ${distanceKm} km * (${transportEfficiencyMJPerKgPerKm} MJ fuel/(km*kg H₂) * ${fuelFactor} g CO₂,eq/MJ fuel + ${gEqEmissionsOfCH4AndN2OPerKmPerKgH2} g CO₂,eq/(km*kg H₂))`;
    const result = distanceKm * (transportEfficiencyMJPerKgPerKm * fuelFactor + gEqEmissionsOfCH4AndN2OPerKmPerKgH2);

    return new EmissionCalculationDto('Emissions (Transportation with Trailer)', basisOfCalculation, result, UNIT_G_CO2_PER_KG_H2, CalculationTopic.HYDROGEN_TRANSPORTATION);
  }

  static assembleApplicationEmissions(emissionCalculations: EmissionCalculationDto[]): EmissionForProcessStepDto[] {
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

  static assembleRegulatoryEmissions(totalApplicationEmission: number, transportApplicationAmount: number): EmissionForProcessStepDto[] {
    const transportAndDistributionEmission = new EmissionForProcessStepDto(transportApplicationAmount, 'Etd', 'Emissions from transport and distribution', 'REGULATORY');
    const processingEmission = new EmissionForProcessStepDto(totalApplicationEmission - transportApplicationAmount, 'Ep', 'Processing emissions', 'REGULATORY');

    return [
      transportAndDistributionEmission,
      processingEmission,
    ];
  }
}
