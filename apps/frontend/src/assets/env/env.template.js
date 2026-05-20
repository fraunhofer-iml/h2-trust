/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

(function (window) {
  window.env = window.env || {};
  window.env.BFF_URL = '${BFF_URL}';
  window.env.KEYCLOAK_URL = '${KEYCLOAK_URL}';
  window.env.KEYCLOAK_REALM = '${KEYCLOAK_REALM}';
  window.env.KEYCLOAK_CLIENT_FRONTEND_ID = '${KEYCLOAK_CLIENT_FRONTEND_ID}';
})(this);
