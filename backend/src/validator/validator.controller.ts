import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ValidatorService } from './validator.service.js';
import { CreateValidatorDto } from './dto/create-validator.dto.js';
import { UpdateValidatorDto } from './dto/update-validator.dto.js';

@Controller('validator')
export class ValidatorController {
  constructor(private readonly validatorService: ValidatorService) {}

  @Post()
  create(@Body() createValidatorDto: CreateValidatorDto) {
    return this.validatorService.create(createValidatorDto);
  }

  @Get()
  findAll() {
    return this.validatorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.validatorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateValidatorDto: UpdateValidatorDto) {
    return this.validatorService.update(+id, updateValidatorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.validatorService.remove(+id);
  }
}
