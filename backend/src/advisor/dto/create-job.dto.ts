import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";




export class CreateJobDto {
    @IsUUID()
    @IsNotEmpty()
    customer_id: string;

    @IsUUID()
    @IsNotEmpty()
    vehicle_id: string;

    @IsString()
    @IsNotEmpty()
    customer_complaint: string;

    @IsUUID()
    @IsOptional()
    advisor_id?: string;

}