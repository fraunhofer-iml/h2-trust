import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isBefore', async: false })
export class IsBeforeConstraint implements ValidatorConstraintInterface {
  validate(validTo: Date, args: ValidationArguments) {
    const object = args.object as any;
    const validFrom: Date = object.validFrom;

    return validFrom < validTo;
  }

  defaultMessage() {
    return 'validFrom needs to be before validTo';
  }
}
