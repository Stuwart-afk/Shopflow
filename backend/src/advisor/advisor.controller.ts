import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdvisorService } from './advisor.service.js';

@Controller('advisor')
export class AdvisorController {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly advisorService: AdvisorService
    ){}


    

}
