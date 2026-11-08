import { PartialType } from '@nestjs/mapped-types';
import { CreateValidatorDto } from './create-validator.dto.js';

export class UpdateValidatorDto extends PartialType(CreateValidatorDto) {}
