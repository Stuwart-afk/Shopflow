import {IsString, IsEnum, IsNumber, IsOptional, IsUUID } from "class-validator";


export class UpdateJobDto {
    @IsEnum(['PENDING','INSPECTING','DIAGNOSED','AWAITING_APPRIVAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    @IsOptional()
    status?: string;

    @IsUUID()
    @IsOptional()
    validator_id?: string;

    @IsUUID()
    @IsOptional()
    mechanic_id?: string;

    @IsString()
    @IsOptional()
    estimated_cost?: string;
}