/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO-MP: will be split into two payloads with validation later 
export class ReadProcessStepsPayload {
    processTypes!: string[];
    predecessorProcessTypes!: string[];
    active!: boolean;
    companyId!: string;

    static of(
        processTypes: string[],
        predecessorProcessTypes: string[],
        active: boolean,
        companyId: string,
    ): ReadProcessStepsPayload {
        return {
            processTypes,
            predecessorProcessTypes,
            active,
            companyId,
        };
    }
}
