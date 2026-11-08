import { Injectable } from '@nestjs/common';
import { CreateValidatorDto } from './dto/create-validator.dto.js';
import { UpdateValidatorDto } from './dto/update-validator.dto.js';

@Injectable()
export class ValidatorService {
  create(createValidatorDto: CreateValidatorDto) {
    return 'This action adds a new validator';
  }

  findAll() {
    return `This action returns all validator`;
  }

  findOne(id: number) {
    return `This action returns a #${id} validator`;
  }

  update(id: number, updateValidatorDto: UpdateValidatorDto) {
    return `This action updates a #${id} validator`;
  }

  remove(id: number) {
    return `This action removes a #${id} validator`;
  }
}
