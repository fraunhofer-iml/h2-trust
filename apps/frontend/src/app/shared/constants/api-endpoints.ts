export const ApiEndpoints = {
  units: '/units',
  unitTypes: {
    powerProduction: 'power-production',
    hydrogenProduction: 'hydrogen-production',
    hydrogenStorage: 'hydrogen-storage',
  },
  users: {
    getUsers: '/users',
    userDetails: '/details',
    recipients: '/recipients',
  },
  companies: { getCompanies: '/companies' },
  processing: {
    getProcessingData: '/processing',
    createBottleBatch: '/processing/bottling',
  },
  production: {
    getProduction: '/production',
  },
};
