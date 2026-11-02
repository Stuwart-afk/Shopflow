import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CustomerController } from './customer/customer.controller.js';
import { CustomerService } from './customer/customer.service.js';
import { CustomerModule } from './customer/customer.module.js';
import { VehicleController } from './vehicle/vehicle.controller.js';
import { VehicleService } from './vehicle/vehicle.service.js';
import { VehicleModule } from './vehicle/vehicle.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CustomerModule,
    VehicleModule
  ],
  controllers: [
    AppController, 
    CustomerController, 
    VehicleController
  ],
  providers: [
    AppService, 
    CustomerService, 
    VehicleService
  ],
})
export class AppModule {}