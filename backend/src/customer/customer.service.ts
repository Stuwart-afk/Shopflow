import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';

@Injectable()
export class CustomerService {
    constructor(private readonly prisma: PrismaService){}

    async createCustomer(userId: string, dto: CreateCustomerDto) {
        const existingCustomer = await this.prisma.customer.findUnique({
            where: { user_id: userId},
        });

        if (existingCustomer) {
            throw new ConflictException('This user already has a customer profile');
        }

        const customer = await this.prisma.customer.create({
            data: {
                user_id: userId,
                phone: dto.phone,
            },
        });

        return customer;
    }

    async getCustomerByUserId(userId: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { user_id: userId},
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                vehicles: true,
            },
        });

        if (!customer) {
            throw new NotFoundException('Customer profile not found');
        }

        return customer;
    }

    async getAllCustomers(){
        const customers = await this.prisma.customer.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                vehicles: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return customers;
    }

    async updateCustomer(userId: string, dto: CreateCustomerDto) {
        const customer = await this.prisma.customer.findUnique({
            where: {user_id: userId},
        });

        if (!customer) {
            throw new NotFoundException('Customer profile not found');
        }

        const updated = await this.prisma.customer.update({
            where: {user_id: userId},
            data: {
                phone: dto.phone,
            },
        });

        return updated;
    }
}

