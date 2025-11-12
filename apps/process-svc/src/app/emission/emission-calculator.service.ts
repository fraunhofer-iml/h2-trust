/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {Injectable} from '@nestjs/common';
import {LineageContextEntity, ProcessStepEntity} from '@h2-trust/amqp';
import {EmissionCalculationDto, EmissionComputationResultDto, EmissionForProcessStepDto} from '@h2-trust/api';
import {
  FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ,
  getPowerEmissionFactorByEnergySource,
  GRAVIMETRIC_ENERGY_DENSITY_H2_MJ_PER_KG,
  ProcessType,
  UNIT_G_CO2_PER_KG_H2,
} from '@h2-trust/domain';
import {LineageContextService} from '../lineage/lineage-context.service';
import {EmissionAssembler} from './emission.assembler';
import {PowerUnitLoader} from './power-unit.loader';

@Injectable()
export class EmissionCalculatorService {
  constructor(
    private readonly powerUnitLoader: PowerUnitLoader,
    private readonly lineageService: LineageContextService,
  ) {
  }

  async computeForContext(ctx: LineageContextEntity): Promise<EmissionComputationResultDto> {
    const emissionCalculations: EmissionCalculationDto[] = [];

    if (ctx.powerProductionProcessSteps) {
      const powerProductionEmissions = await this.calculatePowerProductionEmissions(ctx.powerProductionProcessSteps);
      emissionCalculations.push(...powerProductionEmissions);
    }

    if (ctx.waterConsumptionProcessSteps) {
      const waterConsumptionEmissions = this.calculateWaterConsumptionEmissions(ctx.waterConsumptionProcessSteps);
      emissionCalculations.push(...waterConsumptionEmissions);
    }

    if (ctx.hydrogenProductionProcessSteps) {
      const hydrogenProductionEmissions = ctx.hydrogenProductionProcessSteps.map((step) =>
        EmissionAssembler.assembleHydrogenStorageCalculation(step),
      );
      emissionCalculations.push(...hydrogenProductionEmissions);
    }

    if (ctx.hydrogenBottlingProcessStep) {
      const powerEmissionFactor = getPowerEmissionFactorByEnergySource('GRID');
      const hydrogenBottlingCalculation = EmissionAssembler.assembleHydrogenBottlingCalculation(
        powerEmissionFactor.emissionFactor,
      );
      emissionCalculations.push(hydrogenBottlingCalculation);
    }

    if (ctx.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      const hydrogenTransportationCalculations = EmissionAssembler.assembleHydrogenTransportationCalculation(ctx.root);
      emissionCalculations.push(hydrogenTransportationCalculations);
    }

    // Build sums and emissions aggregations
    const applicationEmissions = EmissionAssembler.assembleApplicationEmissions(emissionCalculations);
    const totalApplicationEmission = applicationEmissions.reduce((acc, e) => acc + e.amount, 0);
    const transportApplication = applicationEmissions.find((e) => e.name === 'Et')?.amount ?? 0;

    const regulatoryEmissions = EmissionAssembler.assembleRegulatoryEmissions(
      totalApplicationEmission,
      transportApplication,
    );

    const processStepEmissions: EmissionForProcessStepDto[] = [...applicationEmissions, ...regulatoryEmissions];

    const amountCO2PerMJH2 = totalApplicationEmission / GRAVIMETRIC_ENERGY_DENSITY_H2_MJ_PER_KG;
    const emissionReductionPercentage =
      ((FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ - amountCO2PerMJH2) / FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ) * 100;

    return {
      calculations: emissionCalculations,
      processStepEmissions,
      amountCO2PerMJH2,
      emissionReductionPercentage,
    };
  }

  async computePowerCalculation(processStep: ProcessStepEntity): Promise<EmissionCalculationDto> {
    const [powerCalculations]: EmissionCalculationDto[] = await this.calculatePowerProductionEmissions([processStep]);
    return powerCalculations;
  }

  private async calculatePowerProductionEmissions(
    processSteps: ProcessStepEntity[],
  ): Promise<EmissionCalculationDto[]> {
    const powerProductionUnitsByProcessSteps = await this.powerUnitLoader.loadByProcessSteps(processSteps);

    return Promise.all(
      processSteps.map((step) => {
        const unit = powerProductionUnitsByProcessSteps.get(step.id);
        const entry = getPowerEmissionFactorByEnergySource(unit?.type?.energySource);
        return EmissionAssembler.assemblePowerProductionCalculation(step, entry.emissionFactor, entry.label);
      }),
    );
  }

  computeWaterCalculation(processStep: ProcessStepEntity): EmissionCalculationDto {
    const [waterCalculation]: EmissionCalculationDto[] = this.calculateWaterConsumptionEmissions([processStep]);
    return waterCalculation;
  }

  private calculateWaterConsumptionEmissions(
    processSteps: ProcessStepEntity[],
  ): EmissionCalculationDto[] {
    return processSteps.map((step) =>
      EmissionAssembler.assembleWaterConsumptionCalculation(step),
    );
  }

  async computeForProcessStep(processStepId: string, emissionCalculationName: string): Promise<EmissionCalculationDto> {
    const context: LineageContextEntity = await this.lineageService.build(processStepId);
    const emissionComputationResult: EmissionComputationResultDto = await this.computeForContext(context);

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
