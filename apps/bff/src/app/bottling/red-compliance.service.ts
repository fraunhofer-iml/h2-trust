/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {firstValueFrom} from 'rxjs';
import { Inject, Injectable} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {
  BrokerQueues,
  HydrogenProductionUnitEntity, PowerProductionUnitEntity,
  ProcessStepEntity,
  ProvenanceEntity, ProvenanceMessagePatterns,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import {
  RedComplianceDto,
} from '@h2-trust/api';

interface PowerHydrogenPair {
  powerProduction: ProcessStepEntity;
  hydrogenProduction: ProcessStepEntity;
}

@Injectable()
export class RedComplianceService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
  ) {
  }

  async determineRedCompliance(processStepId: string): Promise<RedComplianceDto> {
    const provenance: ProvenanceEntity = await firstValueFrom(
      this.processSvc.send(ProvenanceMessagePatterns.BUILD_PROVENANCE, {processStepId}),
    );
    // TODO Checks, ob powerProductions und hydrogenProductions vorhanden sind
    console.log("## RedComplianceService.determineRedCompliance#provenance:");  // TODO Debug log
    console.log(provenance);

    const powerHydrogenPairs: PowerHydrogenPair[] = [];
    for (const powerProduction of provenance.powerProductions) {
      const hydrogenProduction = provenance.hydrogenProductions.find(
        (hydrogenProcessStep) => powerProduction.batch.successors.some((successorBatch) => successorBatch.processStepId === hydrogenProcessStep.id),
      );
      if (hydrogenProduction) {
        powerHydrogenPairs.push({powerProduction, hydrogenProduction});
      }
    }
    // TODO Kann `powerHydrogenPairs` leer sein?
    console.log("## RedComplianceService.determineRedCompliance#powerHydrogenPairs:");  // TODO Debug log
    console.log(powerHydrogenPairs);

    // TODO Besser abfangen/sicher stellen was passiert, wenn die Schleife nicht durchlaufen wird
    let isGeoCorrelationValid = powerHydrogenPairs.length > 0;
    let isTimeCorrelationValid = powerHydrogenPairs.length > 0;
    let isAdditionalityFulfilled = powerHydrogenPairs.length > 0;
    let isFinancialSupportReceived = powerHydrogenPairs.length > 0;

    for (const powerHydrogenPair of powerHydrogenPairs) {
      console.log("## RedComplianceService.determineRedCompliance#powerHydrogenPair:");  // TODO Debug log
      console.log(powerHydrogenPair);


      const powerProductionUnitEntities: PowerProductionUnitEntity[] = await firstValueFrom(
        this.generalSvc.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS, {ids: [powerHydrogenPair.powerProduction.executedBy.id]}),
      );
      // TODO Checks
      const powerProductionUnit = powerProductionUnitEntities[0];
      console.log("## RedComplianceService.determineRedCompliance#powerProductionUnit:");  // TODO Debug log
      console.log(powerProductionUnit);
      const hydrogenProductionUnitEntities: HydrogenProductionUnitEntity[] = await firstValueFrom(
        // TODO UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS_BY_IDS
        this.generalSvc.send(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS_BY_IDS, {ids: [powerHydrogenPair.hydrogenProduction.executedBy.id]}),
      );
      // TODO Checks
      const hydrogenProductionUnit = hydrogenProductionUnitEntities[0];
      console.log("## RedComplianceService.determineRedCompliance#hydrogenProductionUnit:");  // TODO Debug log
      console.log(hydrogenProductionUnit);


      isGeoCorrelationValid &&= this.areUnitsInSameBiddingZone(powerProductionUnit, hydrogenProductionUnit);
      // TODO Checks nötig?
      isTimeCorrelationValid &&= this.isWithinTimeCorrelation(
        powerHydrogenPair.powerProduction,
        powerHydrogenPair.hydrogenProduction,
      );
      // TODO Checks nötig?
      isAdditionalityFulfilled &&= this.isAdditionality(powerProductionUnit, hydrogenProductionUnit);
      isFinancialSupportReceived &&= this.hasFinancialSupport(powerProductionUnit);
      // TODO Eventuell Abbruch, sobald einmal false gefunden wurde
      // TODO Nicht matchendes Paar loggen?


    }

    return new RedComplianceDto(isGeoCorrelationValid, isTimeCorrelationValid, isAdditionalityFulfilled, isFinancialSupportReceived);
  }

  private areUnitsInSameBiddingZone(
    powerUnit: PowerProductionUnitEntity,
    hydrogenUnit: HydrogenProductionUnitEntity,
  ): boolean {
    console.log("## RedComplianceService.areUnitsInSameBiddingZone#powerUnit.biddingZone:");  // TODO Debug log
    console.log(powerUnit.biddingZone);
    console.log("## RedComplianceService.areUnitsInSameBiddingZone#hydrogenUnit.biddingZone:");  // TODO Debug log
    console.log(hydrogenUnit.biddingZone);
    console.log("## RedComplianceService.areUnitsInSameBiddingZone#powerUnit.biddingZone===hydrogenUnit.biddingZone:");  // TODO Debug log
    console.log(powerUnit.biddingZone === hydrogenUnit.biddingZone);
    return powerUnit.biddingZone === hydrogenUnit.biddingZone;
  }

  private isWithinTimeCorrelation(
    powerProduction: ProcessStepEntity,
    hydrogenProduction: ProcessStepEntity,
  ): boolean {
    const powerStartedAt = new Date(powerProduction.startedAt);
    const hydrogenStartedAt = new Date(hydrogenProduction.startedAt);
    // Rounding to the nearest hour and comparing
    return powerStartedAt.setMinutes(0, 0, 0) === hydrogenStartedAt.setMinutes(0, 0, 0);
  }

  private isAdditionality(
    powerUnit: PowerProductionUnitEntity,
    hydrogenUnit: HydrogenProductionUnitEntity,
  ): boolean {
    const powerCommissioning = new Date(powerUnit.commissionedOn);
    const hydrogenCommissioning = new Date(hydrogenUnit.commissionedOn);

    // Limit date: 36 months prior to commissioning of the electrolyzer
    const limitDate = new Date(hydrogenCommissioning);
    limitDate.setMonth(limitDate.getMonth() - 36);
    // Power generation must not occur BEFORE this limit date (i.e., it must be >=).
    return powerCommissioning >= limitDate;
  }

  private hasFinancialSupport(powerUnit: PowerProductionUnitEntity): boolean {
    return powerUnit.financialSupportReceived;
  }
}
