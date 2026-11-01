import { IsString, IsOptional, Matches} from "class-validator";

export class CreateCustomerDto {
    @IsOptional()
    @IsString()
    phone: string;
}