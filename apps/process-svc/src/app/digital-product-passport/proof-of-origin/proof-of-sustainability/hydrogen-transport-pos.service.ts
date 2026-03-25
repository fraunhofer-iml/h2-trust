/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity, ProofOfSustainabilityEmissionCalculationEntity, ProvenanceEntity } from '@h2-trust/amqp';
import { EnumLabelMapper } from '@h2-trust/api';
import {
  CalculationTopic,
  EmissionNumericConstants,
  EmissionStringConstants,
  FuelType,
  MeasurementUnit,
  ProcessType,
  TrailerParameter,
  TransportMode,
} from '@h2-trust/domain';

export class HydrogenTransportPosService {
  public static computeProvenanceEmissionsForTransport(
    provenance: ProvenanceEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (!provenance || provenance.root.type !== ProcessType.HYDROGEN_TRANSPORTATION) {
      throw new Error('Provenance is undefined or root is not HYDROGEN_TRANSPORTATION.');
    }

    const hydrogenAmount = provenance.hydrogenBottling
      ? provenance.hydrogenBottling.batch.amount
      : provenance.root.batch.amount;

    const hydrogenTransportation: ProofOfSustainabilityEmissionCalculationEntity = this.assembleHydrogenTransportation(
      provenance.root,
    );

    const totalEmissions = hydrogenTransportation.result;
    const totalEmissionsGrouped = [`${totalEmissions} ${MeasurementUnit.G_CO2}`];
    const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

    return new ProofOfSustainabilityEmissionCalculationEntity(
      totalEmissions.toString(),
      totalEmissionsGrouped,
      totalEmissionsPerKgHydrogen,
      MeasurementUnit.G_CO2_PER_KG_H2,
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
  }

  static assembleHydrogenTransportation(
    hydrogenTransportation: ProcessStepEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (hydrogenTransportation?.type !== ProcessType.HYDROGEN_TRANSPORTATION) {
      throw new Error(
        `Invalid process step type [${hydrogenTransportation?.type}] for hydrogen transportation emission calculation`,
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
        throw new Error(`Unknown transport mode [${transportMode}] for process step [${hydrogenTransportation.id}]`);
    }

    return emissionCalculation;
  }

  private static assemblePipeline(): ProofOfSustainabilityEmissionCalculationEntity {
    const result = 0;

    const basisOfCalculation = [`E = 0 ${MeasurementUnit.G_CO2_PER_KG_H2}`];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      EmissionStringConstants.HYDROGEN_TRANSPORTATION_PIPELINE,
      basisOfCalculation,
      result,
      MeasurementUnit.G_CO2,
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
  }

  private static assembleTrailer(
    hydrogenAmount: number,
    fuelType: FuelType,
    transportDistance: number,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    const trailerParameter: TrailerParameter =
      EmissionNumericConstants.TRAILER_PARAMETERS.find((trailerEntry) => hydrogenAmount <= trailerEntry.capacity) ??
      EmissionNumericConstants.TRAILER_PARAMETERS.at(EmissionNumericConstants.TRAILER_PARAMETERS.length - 1);

    const tonPerKg = 0.001;

    // Amount of fuel used per ton of material transported = transport distance * transport efficiency
    // [MJ fuel / ton of H₂] = [km] * [MJ fuel / (ton, km)]
    const transportEfficiency = trailerParameter.transportEfficiency;
    const amountOfFuelPerTonOfHydrogen = transportDistance * transportEfficiency;

    // Emission = 0.001 * Amount of fuel used per ton of material transported * emission factor
    // [g CO₂,eq/kg of H₂] = [ton / kg] * [MJ fuel / ton of H₂] * [g CO₂,eq / MJ fuel]
    const emissionFactorFuel = EmissionNumericConstants.FUEL_EMISSION_FACTORS[fuelType];
    const emissionsFuelCombustion = tonPerKg * amountOfFuelPerTonOfHydrogen * emissionFactorFuel;

    // Emission = 0.001 * transport distance * emission factor for CH4 and N2O emissions
    // [g CO₂,eq/kg of H₂] = [ton / kg] * [km] * [g CO₂,eq / (ton, km)]
    const emissionFactorCh4AndN2O = trailerParameter.emissionFactor;
    const emissionCh4AndN2O = tonPerKg * transportDistance * emissionFactorCh4AndN2O;

    const result = (emissionsFuelCombustion + emissionCh4AndN2O) * hydrogenAmount;

    const fuelTypeLabel = EnumLabelMapper.getFuelType(fuelType);
    const tonPerKgInput = `Ton per Kg: ${tonPerKg} ton/kg`;
    const transportDistanceInput = `Transport Distance: ${transportDistance} ${MeasurementUnit.KM}`;
    const transportEfficiencyInput = `Transport Efficiency: ${transportEfficiency} ${MeasurementUnit.MJ_FUEL_PER_TON_KM}`;
    const emissionFactorFuelInput = `Emission Factor ${fuelTypeLabel}: ${emissionFactorFuel} ${MeasurementUnit.G_CO2_PER_MJ}`;
    const emissionFactorCh4AndN2OInput = `Emission Factor ${EmissionStringConstants.CH4_N2O}: ${emissionFactorCh4AndN2O} ${MeasurementUnit.G_CO2_PER_TON_KM}`;
    const hydrogenTransportedInput = `Hydrogen Transported: ${hydrogenAmount} ${MeasurementUnit.KG_H2}`;
    const emissionFuelCombustionFormula = `Emission Fuel Combustion = Ton per Kg * Transport Distance * Transport Efficiency * Emission Factor ${fuelTypeLabel}`;
    const emissionCh4AndN2OFormula = `Emission ${EmissionStringConstants.CH4_N2O} = Ton per Kg * Transport Distance * Emission Factor ${EmissionStringConstants.CH4_N2O}`;
    const formula = `E = (Emission Fuel Combustion + Emission ${EmissionStringConstants.CH4_N2O}) * Hydrogen Transported`;
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
      EmissionStringConstants.HYDROGEN_TRANSPORTATION_TRAILER,
      basisOfCalculation,
      result,
      MeasurementUnit.G_CO2,
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    );
  }
}
