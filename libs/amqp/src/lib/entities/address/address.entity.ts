import { AddressDbType } from '@h2-trust/database';

export class AddressEntity {
  street: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;

  constructor(street: string, postalCode: string, city: string, state: string, country: string) {
    this.street = street;
    this.postalCode = postalCode;
    this.city = city;
    this.state = state;
    this.country = country;
  }

  static fromDatabase(address: AddressDbType) {
    return address
      ? <AddressEntity>{
          street: address.street,
          postalCode: address.postalCode,
          city: address.city,
          state: address.state,
          country: address.country,
        }
      : undefined;
  }
}
