import { IsString, IsOptional, Matches} from "class-validator";

export class CreateCustomer {
    @IsOptional()
    @IsString()
    phone: string;
}