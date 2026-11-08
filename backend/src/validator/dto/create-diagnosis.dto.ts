import {IsString, IsNotEmpty, IsEnum } from "class-validator";


export class CreateDiagnosisDto {
    @IsString()
    @IsNotEmpty()
    findings: string;


    @IsString()
    @IsNotEmpty()
    recommended_repairs: string;


    @IsEnum(['LOW','MEDIUM', 'HIGH', 'CRITICAL'])
    priority: string;

}