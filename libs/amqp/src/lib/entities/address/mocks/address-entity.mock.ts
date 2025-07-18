import { AddressSeed } from 'libs/database/src/seed';
import { AddressEntity } from '../address.entity';

export const AddressEntityPowerMock: AddressEntity = new AddressEntity(
  AddressSeed[0].street,
  AddressSeed[0].postalCode,
  AddressSeed[0].city,
  AddressSeed[0].state,
  AddressSeed[0].country,
);

export const AddressEntityHydrogenMock: AddressEntity = new AddressEntity(
  AddressSeed[1].street,
  AddressSeed[1].postalCode,
  AddressSeed[1].city,
  AddressSeed[1].state,
  AddressSeed[1].country,
);

export const AddressEntityRecipientMock: AddressEntity = new AddressEntity(
  AddressSeed[2].street,
  AddressSeed[2].postalCode,
  AddressSeed[2].city,
  AddressSeed[2].state,
  AddressSeed[2].country,
);
