import { Module } from '@nestjs/common';
import { AdvisorController } from './advisor.controller.js';
import { AdvisorService } from './advisor.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
    imports: [PrismaModule],
    controllers: [AdvisorController],
    providers: [AdvisorService],
})
export class AdvisorModule {}
