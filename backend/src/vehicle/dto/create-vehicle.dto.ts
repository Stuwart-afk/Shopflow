import { IsString, IsInt, Min, Max, Matches} from 'class-validator'

export class CreateVehicleDto {
    @IsString()
    @Matches(/^[A-Z] {3}-\d{4}$/,{
        message: 'Plate number Must be in format ABC-1234',
    })
    plate_number: string;

    @IsString()
    make: string;


    @IsString()
    model: string;

    @IsInt()
    @Min(1900)
    @Max(2030)
    year: number;
}