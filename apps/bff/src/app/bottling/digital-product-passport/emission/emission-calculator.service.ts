/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inject, Injectable } from '@nestjs/common';
import { ProvenanceEntity, ProcessStepEntity, BrokerQueues, ProvenanceMessagePatterns } from '@h2-trust/amqp';
import { EmissionCalculationDto, EmissionComputationResultDto, EmissionForProcessStepDto } from '@h2-trust/api';
import {
  EmissionFactorEntry,
  FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ,
  getPowerEmissionFactorByEnergySource,
  GRAVIMETRIC_ENERGY_DENSITY_H2_MJ_PER_KG,
  ProcessType,
  UNIT_G_CO2_PER_KG_H2,
} from '@h2-trust/domain';
import { EmissionCalculationAssembler } from './emission.assembler';
import { PowerUnitLoader } from './power-unit.loader';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmissionCalculatorService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly powerUnitLoader: PowerUnitLoader,
  ) { }

  async aggregateProvenanceEmissions(provenance: ProvenanceEntity): Promise<EmissionComputationResultDto> {
    const emissionCalculations: EmissionCalculationDto[] = [];

    if (provenance.powerProductions) {
      const powerProductions: EmissionCalculationDto[] = await this.calculatePowerProductionEmissions(provenance.powerProductions);
      emissionCalculations.push(...powerProductions);
    }

    if (provenance.waterConsumptions) {
      const waterConsumptions: EmissionCalculationDto[] = provenance.waterConsumptions.map((waterSupply) => EmissionCalculationAssembler.assembleWaterConsumptionEmission(waterSupply));
      emissionCalculations.push(...waterConsumptions);
    }

    if (provenance.hydrogenProductions) {
      const hydrogenProductions: EmissionCalculationDto[] = provenance.hydrogenProductions.map((step) =>
        EmissionCalculationAssembler.assembleHydrogenStorageEmission(step),
      );
      emissionCalculations.push(...hydrogenProductions);
    }

    if (provenance.hydrogenBottling) {
      const powerEmissionFactor: EmissionFactorEntry = getPowerEmissionFactorByEnergySource('GRID');
      const hydrogenBottling: EmissionCalculationDto = EmissionCalculationAssembler.assembleHydrogenBottlingEmission(powerEmissionFactor.emissionFactor);
      emissionCalculations.push(hydrogenBottling);
    }

    if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      const hydrogenTransportation: EmissionCalculationDto = EmissionCalculationAssembler.assembleHydrogenTransportationEmission(provenance.root);
      emissionCalculations.push(hydrogenTransportation);
    }

    // Build sums and emissions aggregations
    const applicationEmissions: EmissionForProcessStepDto[] = EmissionCalculationAssembler.assembleApplicationEmissions(emissionCalculations);
    const totalApplicationEmission: number = applicationEmissions.reduce((acc, emission) => acc + emission.amount, 0);
    const transportApplicationEmission: number = applicationEmissions.find((e) => e.name === 'Et')?.amount ?? 0;

    const regulatoryEmissions: EmissionForProcessStepDto[] = EmissionCalculationAssembler.assembleRegulatoryEmissions(totalApplicationEmission, transportApplicationEmission);

    const processStepEmissions: EmissionForProcessStepDto[] = [...applicationEmissions, ...regulatoryEmissions];

    const amountCO2PerMJH2: number = totalApplicationEmission / GRAVIMETRIC_ENERGY_DENSITY_H2_MJ_PER_KG;
    const emissionReductionPercentage: number = ((FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ - amountCO2PerMJH2) / FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ) * 100;

    return new EmissionComputationResultDto(emissionCalculations, processStepEmissions, amountCO2PerMJH2, emissionReductionPercentage);
  }

  async aggregatePowerProductionEmissions(powerProduction: ProcessStepEntity): Promise<EmissionCalculationDto> {
    const [powerCalculations]: EmissionCalculationDto[] = await this.calculatePowerProductionEmissions([powerProduction]);
    return powerCalculations;
  }

  private async calculatePowerProductionEmissions(powerProductions: ProcessStepEntity[]): Promise<EmissionCalculationDto[]> {
    const powerProductionUnitsByProcessSteps = await this.powerUnitLoader.loadByProcessSteps(powerProductions);

    return Promise.all(
      powerProductions.map((powerProduction) => {
        const powerProductionUnit = powerProductionUnitsByProcessSteps.get(powerProduction.id);
        const powerEmissionFactor = getPowerEmissionFactorByEnergySource(powerProductionUnit?.type?.energySource);
        return EmissionCalculationAssembler.assemblePowerProductionEmission(powerProduction, powerEmissionFactor.emissionFactor, powerEmissionFactor.label);
      }),
    );
  }

  aggregateWaterSupplyEmissions(waterSupply: ProcessStepEntity): EmissionCalculationDto {
    return EmissionCalculationAssembler.assembleWaterConsumptionEmission(waterSupply)
  }

  async computeForProcessStep(processStepId: string, emissionCalculationName: string): Promise<EmissionCalculationDto> {
    const context: ProvenanceEntity = await firstValueFrom(
      this.processSvc.send(ProvenanceMessagePatterns.BUILD_PROVENANCE, { processStepId }),
    );
    const emissionComputationResult: EmissionComputationResultDto = await this.aggregateProvenanceEmissions(context);

    const basisOfCalculation = `Emissions (Cumulative - ${emissionCalculationName})`;
    const totalEmissionsPerKg = (emissionComputationResult.calculations ?? []).reduce(
      (acc, c) => acc + (c.result || 0),
      0,
    );

    return new EmissionCalculationDto(
      emissionCalculationName,
      basisOfCalculation,
      totalEmissionsPerKg,
      UNIT_G_CO2_PER_KG_H2,
      undefined,
    );
  }
}
