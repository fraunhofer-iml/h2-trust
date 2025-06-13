import { Unit } from '@prisma/client';
import { AddressSeed } from '../addresses.seed';
import { CompaniesSeed } from '../companies.seed';
import { getElementOrThrowError } from '../utils';

export const UnitsSeed = <Unit[]>[
  {
    id: 'power-production-unit-1',
    name: 'Onshore Wind Turbine 3000',
    mastrNumber: 'OWT-3000-2025',
    manufacturer: 'WindPower Corp.',
    modelType: 'WPC3000',
    modelNumber: 'WPC3000-001',
    serialNumber: 'SN2233445566',
    commissionedOn: new Date('2025-04-01'),
    decommissioningPlannedOn: new Date('2045-04-01'),
    addressId: getElementOrThrowError(AddressSeed, 0, 'Address').id,
    companyId: getElementOrThrowError(CompaniesSeed, 0, 'Company').id,
  },
  {
    id: 'hydrogen-production-unit-1',
    name: 'Hydrogen Generator 3000',
    mastrNumber: 'HG-3000-2025',
    manufacturer: 'Green Energy Solutions',
    modelType: 'HG3000',
    modelNumber: 'HG3000-001',
    serialNumber: 'SN123456789',
    commissionedOn: new Date('2025-01-15'),
    decommissioningPlannedOn: new Date('2045-01-15'),
    addressId: getElementOrThrowError(AddressSeed, 1, 'Address').id,
    companyId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
  {
    id: 'hydrogen-storage-unit-1',
    name: 'Hydrogen Storage Unit 1000',
    mastrNumber: 'HSU-1000-2025',
    manufacturer: 'SafeStorage Ltd.',
    modelType: 'HSU1000',
    modelNumber: 'HSU1000-001',
    serialNumber: 'SN1122334455',
    commissionedOn: new Date('2025-03-01'),
    decommissioningPlannedOn: new Date('2040-03-01'),
    addressId: getElementOrThrowError(AddressSeed, 1, 'Address').id,
    companyId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
  {
    id: 'hydrogen-production-unit-2',
    name: 'Transportable Hydrogen Cylinder',
    mastrNumber: 'THC-2025-01',
    manufacturer: 'HydroTrans Inc.',
    modelType: 'HTC-500',
    modelNumber: 'HTC-500-001',
    serialNumber: 'SN987654321',
    commissionedOn: new Date('2025-02-01'),
    decommissioningPlannedOn: new Date('2035-02-01'),
    addressId: getElementOrThrowError(AddressSeed, 1, 'Address').id,
    companyId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
];
