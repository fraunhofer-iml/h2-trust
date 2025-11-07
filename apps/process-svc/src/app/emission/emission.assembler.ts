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

export class EmissionAssembler {
    static assembleHydrogenProductionCalculation(
    processStep: ProcessStepEntity,
    emissionFactorGPerKWh: number,
    label: string,
  ): EmissionCalculationDto {
    const successorProducedHydrogenMassKg = processStep.batch.successors[0].amount;
    const basis = `E = ${processStep.batch.amount} kWh * ${emissionFactorGPerKWh} g CO₂,eq/kWh / ${successorProducedHydrogenMassKg} kg H₂`;
    const result = (processStep.batch.amount * emissionFactorGPerKWh) / successorProducedHydrogenMassKg;
    return new EmissionCalculationDto(label, basis, result, UNIT_G_CO2_PER_KG_H2, CalculationTopic.HYDROGEN_PRODUCTION);
  }

  static assembleWaterConsumptionCalculation(
    processStep: ProcessStepEntity,
  ): EmissionCalculationDto {
    const successorProducedHydrogenMassKg = processStep.batch.successors[0].amount;
    const name = 'Emissions (Water Supply)';
    const emissionFactorGCO2EqPerLiterWater = 0.43;
    const basis = `E = ${processStep.batch.amount} L * ${emissionFactorGCO2EqPerLiterWater} g CO₂,eq/L / ${successorProducedHydrogenMassKg} kg H₂`;
    const result = (processStep.batch.amount * emissionFactorGCO2EqPerLiterWater) / successorProducedHydrogenMassKg;
    return new EmissionCalculationDto(name, basis, result, UNIT_G_CO2_PER_KG_H2, CalculationTopic.WATER_SUPPLY);
  }

  static assembleHydrogenStorageCalculation(_processStep: ProcessStepEntity): EmissionCalculationDto {
    const name = 'Emissions (Hydrogen Storage - placeholder)';
    const basis = 'TBA';
    const result = 0;
    return new EmissionCalculationDto(name, basis, result, UNIT_G_CO2_PER_KG_H2, CalculationTopic.HYDROGEN_STORAGE);
  }

  static assembleHydrogenBottlingCalculation(gridFactorGPerKWh: number): EmissionCalculationDto {
    const compressionKWhPerKg = 1.65;
    const basis = `E = ${compressionKWhPerKg} kWh/kg H₂ * ${gridFactorGPerKWh} g CO₂,eq/kWh`;
    const result = compressionKWhPerKg * gridFactorGPerKWh;
    return new EmissionCalculationDto(
      'Emissions (Compression)',
      basis,
      result,
      UNIT_G_CO2_PER_KG_H2,
      CalculationTopic.HYDROGEN_BOTTLING,
    );
  }

  static assembleHydrogenTransportationCalculation(processStep: ProcessStepEntity): EmissionCalculationDto {
    const mode = processStep.transportationDetails?.transportMode;
    let emissionCalculation: EmissionCalculationDto;

    switch (mode) {
      case TransportMode.PIPELINE:
        emissionCalculation = this.assemblePipelineTransportationCalculation();
        break;
      case TransportMode.TRAILER:
        emissionCalculation = this.assembleTrailerTransportationCalculation(processStep);
        break;
      default:
        throw new Error(`Unknown transport mode ${mode}`);
    }

    return emissionCalculation;
  }

  static assemblePipelineTransportationCalculation(): EmissionCalculationDto {
    return new EmissionCalculationDto(
      'Emissions (Transportation with Pipeline)',
      'E = 0 g CO₂,eq/kg H₂',
      0,
      UNIT_G_CO2_PER_KG_H2,
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
  }

  static assembleTrailerTransportationCalculation(processStep: ProcessStepEntity): EmissionCalculationDto {
    const distanceKm = processStep.transportationDetails.distance;
    const fuelFactor = getFuelEmissionFactorByFuelType(processStep.transportationDetails.fuelType);

    const trailerParams: TrailerEntry = getTrailerParameters(155); // TODO-MP: hardcoded value will be calculated in DUHGW-176
    const transportEfficiencyMJPerKgPerKm = trailerParams.transportEfficiencyMJPerTonnePerKm / 1000;
    const gEqEmissionsOfCH4AndN2OPerKmPerKgH2 = trailerParams.gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2 / 1000;

    const basis = `E = ${distanceKm} km * (${transportEfficiencyMJPerKgPerKm} MJ fuel/(km*kg H₂) * ${fuelFactor} g CO₂,eq/MJ fuel + ${gEqEmissionsOfCH4AndN2OPerKmPerKgH2} g CO₂,eq/(km*kg H₂))`;
    const result = distanceKm * (transportEfficiencyMJPerKgPerKm * fuelFactor + gEqEmissionsOfCH4AndN2OPerKmPerKgH2);

    return new EmissionCalculationDto(
      'Emissions (Transportation with Trailer)',
      basis,
      result,
      UNIT_G_CO2_PER_KG_H2,
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
  }

  static assembleApplicationEmissions(
    calculations: { calculationTopic: CalculationTopic; result: number }[],
  ): EmissionForProcessStepDto[] {
    const sumBy = (topic: CalculationTopic) =>
      calculations.filter((c) => c.calculationTopic === topic).reduce((acc, c) => acc + (c.result ?? 0), 0);

    return [
      {
        amount: sumBy(CalculationTopic.HYDROGEN_PRODUCTION),
        name: 'Ehp',
        description: 'Hydrogen Production Emissions',
        processStepType: 'APPLICATION',
      },
      {
        amount: sumBy(CalculationTopic.WATER_SUPPLY),
        name: 'Ew',
        description: 'Water Supply Emissions',
        processStepType: 'APPLICATION',
      },
      {
        amount: sumBy(CalculationTopic.HYDROGEN_STORAGE),
        name: 'Ehs',
        description: 'Hydrogen Storage Emissions',
        processStepType: 'APPLICATION',
      },
      {
        amount: sumBy(CalculationTopic.HYDROGEN_BOTTLING),
        name: 'Eb',
        description: 'Hydrogen Bottling Emissions',
        processStepType: 'APPLICATION',
      },
      {
        amount: sumBy(CalculationTopic.HYDROGEN_TRANSPORTATION),
        name: 'Et',
        description: 'Hydrogen Transportation Emissions',
        processStepType: 'APPLICATION',
      },
    ];
  }

  static assembleRegulatoryEmissions(
    totalApplicationEmission: number,
    transportApplicationAmount: number,
  ): EmissionForProcessStepDto[] {
    return [
      {
        amount: transportApplicationAmount,
        name: 'Etd',
        description: 'Emissions from transport and distribution',
        processStepType: 'REGULATORY',
      },
      {
        amount: totalApplicationEmission - transportApplicationAmount,
        name: 'Ep',
        description: 'Processing emissions',
        processStepType: 'REGULATORY',
      },
    ];
  }
}
