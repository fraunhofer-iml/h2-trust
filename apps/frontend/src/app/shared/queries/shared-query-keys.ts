export const QUERY_KEYS = {
  HYDROGEN_PRODUCTION_UNITS: {
    ALL: ['hydrogen-production-units'],
    DETAILS: (id: string) => ['hydrogen-production-units', id] as const,
  },
};
