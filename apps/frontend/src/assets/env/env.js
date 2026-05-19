/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

(function (window) {
  window.env = window.env || {};
  window.env.BFF_URL = 'http://localhost:3000';
  window.env.KEYCLOAK_URL = 'http://localhost:8080';
  window.env.KEYCLOAK_REALM = 'h2-trust';
  window.env.KEYCLOAK_CLIENT_FRONTEND_ID = 'h2-trust-frontend';
})(this);
