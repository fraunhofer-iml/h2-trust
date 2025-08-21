import { FormControl } from '@angular/forms';
import { FuelType, HydrogenStorageOverviewDto, TransportMode, UserDto } from '@h2-trust/api';

export type BottlingForm = {
  date: FormControl<Date | undefined | null>;
  time: FormControl<Date | undefined | null>;
  amount: FormControl<number | undefined | null>;
  recipient: FormControl<UserDto | undefined | null>;
  storageUnit: FormControl<HydrogenStorageOverviewDto | undefined | null>;
  type: FormControl<'MIX' | 'GREEN' | undefined | null>;
  transportMode: FormControl<TransportMode | null>;
  fuelType: FormControl<FuelType | null>;
};
