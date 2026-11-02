import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';

@Injectable()
export class VehicleService {
    constructor(private readonly prisma:PrismaService){}

    async createVehicle(customerId: string, dto: CreateVehicleDto){
        const existingPlate = await this.prisma.vehicle.findUnique({
            where: {plate_number: dto.plate_number},
        });

        if (existingPlate) {
            throw new ConflictException(`Plate number ${dto.plate_number} is already registed`);
        }

        const vehicle = await this.prisma.vehicle.create({
            data: {
                customer_id: customerId,
                plate_number: dto.plate_number,
                make: dto.make,
                model: dto.model,
                year: dto.year
            },
        });

        return vehicle;
    }

    async getVehicleByCustomer(customerId: string) {
        const vehicle = await this.prisma.vehicle.findMany({
            where: {customer_id: customerId},
            orderBy: {created_at: 'desc'}
        });

        return vehicle;
    }

    async getVehicleById(vehicleId: string, customerId: string){
        const vehicle = await this.prisma.vehicle.findUnique({
            where: {id: vehicleId}
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not Found');
        }

        if (vehicle.customer_id !== customerId) {
            throw new ForbiddenException('You do not have access to this vehicle');
        }

        return vehicle;
    }
    async updateVehicle(
        vehicleId: string,
        customerId: string,
        dto: CreateVehicleDto) 
        {
            const vehicle = await this.getVehicleById(vehicleId, customerId);

            if (dto.plate_number !== vehicle.plate_number) {
                const existingPlate = await this.prisma.vehicle.findUnique({
                    where: { plate_number: dto.plate_number}
                });
                
                if (existingPlate) {
                    throw new ConflictException(`Plate number ${dto.plate_number} is already registered`
                    );
                }
            }

            const updated = await this.prisma.vehicle.update({
                where: {id: vehicleId},
                data: {
                    plate_number: dto.plate_number,
                    make: dto.make,
                    model: dto.model,
                    year: dto.year,
                },
            });

            return updated;
    }

    async deleteVehicle(vehicleId: string, customerId: string){

        await this.getVehicleById(vehicleId, customerId);

        await this.prisma.vehicle.delete({
            where: {id: vehicleId}
        });

        return { message: 'Vehicle deleted successfully'};
    }

}
