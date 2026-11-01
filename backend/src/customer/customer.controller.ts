import { Body, Controller, Get, Post, Req, UseGuards, Put } from '@nestjs/common';
import { CustomerService } from './customer.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt.guard.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
    constructor(private readonly customerService: CustomerService) {}

    @Post()
    async CreateCustomerDto(@Req() req: any, @Body() dto : CreateCustomerDto) {
        const userId = req.user.userId;
        const customer = await this.customerService.createCustomer(userId, dto);
        return {
            message: 'Customer profile created Successfully',
            data: customer,
        };
    }
    
    @Get('me')
    async getMyProfile(@Req() req: any){
        const userId = req.user.userId;
        const customer = await this.customerService.getCustomerByUserId(userId);

        return {
            data: customer,
        };
    }

    @Get()
    async getAllCustomers(){
        const customers = await this.customerService.getAllCustomers();
        return {
            data: customers,
        };
    }

    @Put('me')
    async updateMyProfile(@Req() req: any, @Body() dto: CreateCustomerDto) {
        const userId = req.user.userId;
        const customer = await this.customerService.updateCustomer(userId, dto);

        return {
            message: 'Customer profile updated successfully',
            data: customer,
        };
    }
}
