import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto.js';

@Injectable()
export class ValidatorService {
  constructor(private prisma: PrismaService) {}

  async getMyJobs(validatorId: string) {
    const jobs = await this.prisma.jobOrder.findMany({
      where: {
        validator_id: validatorId,
        status: { in: ['PENDING', 'INSPECTING', 'DIAGNOSED'] },
      },
      include: {
        customer: { include: { user: true } },
        vehicle: true,
        diagnosis: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return { data: jobs, total: jobs.length };
  }

  async getJobForInspection(jobId: string, validatorId: string) {
    const job = await this.prisma.jobOrder.findUnique({
      where: { id: jobId },
      include: {
        customer: { include: { user: true } },
        vehicle: true,
        diagnosis: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.validator_id !== validatorId) {
      throw new ForbiddenException('This job is not assigned to you');
    }

    return { data: job };
  }

  // ── 3. SUBMIT DIAGNOSIS REPORT ─────────────────────
  // This is the main action. The validator inspected the car
  // and now writes what they found.
  //
  // This method does TWO things in one transaction:
  //   a) Creates the DiagnosisReport record
  //   b) Updates the JobOrder status to DIAGNOSED
  //
  // Why a transaction? If step (a) succeeds but step (b) fails,
  // we'd have a diagnosis report for a job that's still "INSPECTING".
  // A transaction ensures both succeed or both fail together.
  async submitDiagnosis(
    jobId: string,
    validatorId: string,
    dto: CreateDiagnosisDto,
  ) {
    // Verify the job exists and is assigned to this validator
    const job = await this.prisma.jobOrder.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.validator_id !== validatorId) {
      throw new ForbiddenException('This job is not assigned to you');
    }

    // Don't allow duplicate diagnoses
    if (job.status === 'DIAGNOSED' || job.status === 'AWAITING_APPROVAL') {
      throw new BadRequestException(
        'Diagnosis already submitted for this job',
      );
    }

    // ── THE TRANSACTION ──
    // $transaction runs all operations inside it as a single unit.
    // If anything fails, everything rolls back (like Ctrl+Z for the database).
    const result = await this.prisma.$transaction(async (tx) => {
      // (a) Create the diagnosis report
      const diagnosis = await tx.diagnosisReport.create({
        data: {
          job_order_id: jobId,
          validator_id: validatorId,
          findings: dto.findings,
          recommended_repairs: dto.recommended_repairs,
          priority: dto.priority as any,  // Prisma enum cast
        },
      });

      // (b) Move the job to DIAGNOSED status
      const updatedJob = await tx.jobOrder.update({
        where: { id: jobId },
        data: { status: 'DIAGNOSED' },
      });

      return { diagnosis, updatedJob };
    });

    return {
      message: 'Diagnosis submitted successfully',
      data: result,
    };
  }
}