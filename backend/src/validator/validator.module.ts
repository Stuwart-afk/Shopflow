import { Module } from '@nestjs/common';
import { ValidatorService } from './validator.service.js';
import { ValidatorController } from './validator.controller.js';

@Module({
  controllers: [ValidatorController],
  providers: [ValidatorService],
})
export class ValidatorModule {}
