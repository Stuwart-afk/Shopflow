import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ValidatorService } from './validator.service.js';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt.guard.js';

@Controller('validator')
@UseGuards(JwtAuthGuard)
export class ValidatorController {
  constructor(private readonly validatorService: ValidatorService) {}

  // ── GET /validator/jobs ────────────────────────────
  // "Show me my assigned inspections"
  // The validator's ID comes from the JWT token,
  // NOT from the URL. This prevents impersonation.
  @Get('jobs')
  getMyJobs(@Request() req: any) {
    // req.user is populated by JwtAuthGuard from the token
    // It contains { id, email, role, name }
    const validatorId = req.user.id;
    return this.validatorService.getMyJobs(validatorId);
  }

  // ── GET /validator/jobs/:id ────────────────────────
  // "Show me the details of this specific job"
  @Get('jobs/:id')
  getJobForInspection(@Param('id') id: string, @Request() req: any) {
    return this.validatorService.getJobForInspection(id, req.user.id);
  }

  // ── POST /validator/jobs/:id/diagnosis ─────────────
  // "I finished inspecting, here's my report"
  // Body: { findings, recommended_repairs, priority }
  @Post('jobs/:id/diagnosis')
  submitDiagnosis(
    @Param('id') id: string,
    @Body() dto: CreateDiagnosisDto,
    @Request() req: any,
  ) {
    return this.validatorService.submitDiagnosis(id, req.user.id, dto);
  }
}