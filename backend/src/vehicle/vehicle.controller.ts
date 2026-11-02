import { 
    Controller, 
    ForbiddenException, 
    NotFoundException, 
    UseGuards,
    Req,
    Body,
    Post,
    Get,
    Param,
    Put,
    Delete,
    
 } from '@nestjs/common';
import { VehicleService } from './vehicle.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt.guard.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';

@Controller('vehicle')
@UseGuards(JwtAuthGuard)
export class VehicleController {
    constructor(
        private readonly vehicleService: VehicleService,
        private readonly prisma: PrismaService
    ) {}

    private async getCustomerId(userId: string) : Promise<string> {
        const customer = await this.prisma.customer.findUnique({
            where: {user_id: userId},
        });

        if (!customer) {
            throw new ForbiddenException('You must have a customer profile to manage vehicles');
        }

        return customer.id;
    }

    @Post()
    async createVehicle(@Req() req: any, @Body() dto: CreateVehicleDto) {
        const customerId = await this.getCustomerId(req.user.userId);
        const vehicle = await this.vehicleService.getVehicleByCustomer(customerId);

        return {
            data: vehicle,
        };
    }

    @Get(':id')
    async getVehicle(@Req() req: any, @Param('id') id: string) {
        const customerId = await this.getCustomerId(req.user.userId);
        const vehicle = await this.vehicleService.getVehicleById(id, customerId);

        return {
            data: vehicle,
        };
    }

    @Put(':id')
    async updateVehicle(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: CreateVehicleDto,
    ) {
        const customerId = await this.getCustomerId(req.user.userId);
        const vehicle = await this.vehicleService.updateVehicle(id, customerId, dto);
        
        return {
            message: 'Vehicle updated successfully',
            data: vehicle,
        }
    }

    @Delete(':id')
    async deleteVehicle(@Req() req: any, @Param('id') id: string) {
        const customerId = await this.getCustomerId(req.user.userId);
        const result = await this.vehicleService.deleteVehicle(id, customerId);


        return result;
    }
}
