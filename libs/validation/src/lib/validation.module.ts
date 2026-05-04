import { Module } from '@nestjs/common';
import { IsBeforeConstraint } from './validators/is-before.validator';

@Module({
  controllers: [],
  providers: [IsBeforeConstraint],
  exports: [IsBeforeConstraint],
})
export class ValidationModule {}
