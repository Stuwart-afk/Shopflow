import { BadRequestException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';

@Injectable()
export class AdvisorService {
    constructor(private readonly prisma: PrismaService) {}

    async createJob(dto: CreateJobDto) {

        const customer = await this.prisma.customer.findUnique({
            where: { id: dto.customer_id},
        })

        if (!customer) {
            throw new NotFoundException('Customer not found.');
        }

        const vehicle = await this.prisma.customer.findUnique({
            where: 
            {id: dto.vehicle_id,
                customer_id: dto.customer_id,
            },
        })

        if (!vehicle) {
            throw new BadRequestException('Vehicle Not Found or does not belong to this customer');
        }


        const job = await this.prisma.jobOrder.create({
            data: {
                customer_id: dto.customer_id,
                vehicle_id: dto.vehicle_id,
                customer_complaint: dto.customer_complaint,
                status: 'PENDING',
            },
            include: {
                customer: { include: {user: true}},
                vehicle: true,
            },
        });

        return { message: 'Job order created', data:job};
    }


    async getAllJobs(status?: string) {
        const where: any = {};

        if (status) {
            where.status = status;
        } 

        const jobs = await this.prisma.jobOrder.findMany({
            where,
            include: {
                customer: {include: { user: true} },
                vehicle: true,
                advisor: true,
                validator: true,
                mechanic: true,
                diagnosis: true,
                },
                orderBy: {created_at: 'desc'},
        });
        return {data: jobs, total: jobs.length};
    }

    async getJobById(id: string){
        const job = await this.prisma.jobOrder.findUnique({
            where: { id },
            include: {
                customer: { include: {user:true}},
                vehicle: true,
                advisor: true,
                validator: true,
                mechanic: true,
                diagnosis: true,
            },
        });
        
        if (!job) {
            throw new NotFoundException('Job order not found');
        }

        return { data: job };
    }

    async updateJob(id: string, dto:UpdateJobDto){
        const existing = await this.prisma.jobOrder.findUnique({
            where: {id},
        });

        if (!existing) {
            throw new NotFoundException('Job Order not found.');
        }

        const updateData: any = {};

        if (dto.status) {
            updateData.status = dto.status;
        }

        if (dto.validator_id) {
            
            const validator = await this.prisma.user.findFirst({
                where: {id: dto.validator_id, role: 'validator'},
            });

            if (!validator) {
                throw new BadRequestException('Validator not found.');
            }

            updateData.validator_id = dto.validator_id;
        }

        if (dto.mechanic_id) {

            const mechanic = await this.prisma.user.findFirst({
                where: {id: dto.mechanic_id, role: 'mechanic'},
            });

            if (!mechanic) {
                throw new BadRequestException('Mechanic not found.');
            }

            updateData.mechanic_id = dto.mechanic_id;
        }

        if (dto.estimated_cost) {
            updateData.estimated_cost = parseFloat(dto.estimated_cost);
        }

        const job = await this.prisma.jobOrder.update({
            where: {id},
            data: updateData,
            include: {
                customer: { include: { user: true}},
                vehicle: true,
                advisor: true,
                validator: true,
                mechanic: true,
                diagnosis: true,
            },
        });

        return { message: 'Job order updated', data: job};
    }

    async getMechanics(){
        const mechanics = await this.prisma.user.findMany({
            where: {role: 'mechanic', is_active: true},
            select: {
                id: true,
                name: true,
                email: true,

                _count: {
                    select: {
                        mechanicJobs: {
                            where: {
                                status: {
                                    in: 
                                    ['APPROVED', 'IN_PROGRESS']
                                }
                            }
                        }
                    }
                }
            }
        });

        return {data: mechanics};
    }

    async getValidators(){
        const validators = await this.prisma.user.findMany({
            where: {role: 'validators', is_active: true},
            select: {
                id: true,
                name: true,
                email: true,
                _count: {
                    select: {
                        validatorJobs: {
                            where: {
                                status: {
                                    in: 
                                    ['PENDING', 'INSPECTING']}},
                        }
                    }
                }
            }
        })

        return {data: validators};
    }




}
