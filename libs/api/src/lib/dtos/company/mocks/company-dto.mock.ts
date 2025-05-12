import { AddressDto } from '../../address';
import { CompanyDto } from '../company.dto';

export const CompanyDtoMock: CompanyDto[] = [
  <CompanyDto>{
    id: 'company-power-1',
    name: 'PowerGen AG',
    mastrNumber: 'P12345',
    companyType: 'POWER_PRODUCER',
    address: <AddressDto>{
      id: 'address-power-1',
      street: 'Energieweg 1',
      postalCode: '12345',
      city: 'Energietown',
      state: 'Energieland',
      country: 'Energieland',
    },
    users: [],
  },
  <CompanyDto>{
    id: 'company-hydrogen-1',
    name: 'HydroGen GmbH',
    mastrNumber: 'H67890',
    companyType: 'HYDROGEN_PRODUCER',
    address: <AddressDto>{
      id: 'address-hydrogen-1',
      street: 'Wasserstoffstraße 1',
      postalCode: '67890',
      city: 'Wasserstadt',
      state: 'Wasserland',
      country: 'Wasserland',
    },
    users: [],
  },
  <CompanyDto>{
    id: 'company-recipient-1',
    name: 'H2Logistics',
    mastrNumber: 'R112233',
    companyType: 'HYDROGEN_RECIPIENT',
    address: <AddressDto>{
      id: 'address-recipient-1',
      street: 'Empfängerstraße 1',
      postalCode: '09876',
      city: 'Empfängerstadt',
      state: 'Empfängerland',
      country: 'Empfängerland',
    },
    users: [],
  },
];
