import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdvisorService } from './advisor.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt.guard.js';

// @Controller('advisor') means all routes in this file
// start with /advisor. So @Get('jobs') becomes GET /advisor/jobs.
@Controller('advisor')
@UseGuards(JwtAuthGuard)  // Every route requires a valid JWT token
export class AdvisorController {
  // NestJS injects the service automatically
  constructor(private readonly advisorService: AdvisorService) {}

  // ── POST /advisor/jobs ─────────────────────────────
  // Create a new job order
  // Body: { customer_id, vehicle_id, customer_complaint }
  @Post('jobs')
  createJob(@Body() dto: CreateJobDto) {
    // @Body() extracts the JSON body from the request
    // and validates it against CreateJobDto rules
    return this.advisorService.createJob(dto);
  }

  // ── GET /advisor/jobs ──────────────────────────────
  // List all jobs. Optional filter: ?status=PENDING
  // Example: GET /advisor/jobs?status=INSPECTING
  @Get('jobs')
  getAllJobs(@Query('status') status?: string) {
    // @Query('status') grabs the ?status= value from the URL
    // If no ?status= in the URL, status is undefined (returns all)
    return this.advisorService.getAllJobs(status);
  }

  // ── GET /advisor/jobs/:id ──────────────────────────
  // Get one specific job by its UUID
  // Example: GET /advisor/jobs/abc-123-def
  @Get('jobs/:id')
  getJobById(@Param('id') id: string) {
    // @Param('id') grabs the :id part of the URL
    return this.advisorService.getJobById(id);
  }

  // ── PUT /advisor/jobs/:id ──────────────────────────
  // Update a job's status, assign validator/mechanic, set cost
  // Body: { status: "INSPECTING", validator_id: "xyz" }
  @Put('jobs/:id')
  updateJob(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.advisorService.updateJob(id, dto);
  }

  // ── GET /advisor/mechanics ─────────────────────────
  // List all mechanics with their current workload
  @Get('mechanics')
  getMechanics() {
    return this.advisorService.getMechanics();
  }

  // ── GET /advisor/validators ────────────────────────
  // List all validators with their current workload
  @Get('validators')
  getValidators() {
    return this.advisorService.getValidators();
  }
}