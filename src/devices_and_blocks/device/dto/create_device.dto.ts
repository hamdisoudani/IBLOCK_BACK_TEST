import { IsMongoId, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateDeviceDto {
    @IsNotEmpty({ message: 'Device name is required'})
    @IsString({ message: 'Device name must be a string'})
    @MaxLength(50, { message: 'Device name must be less than 50 characters'})
    @MinLength(3, { message: 'Device name must be more than 3 characters'})
    name: string;

    @IsNotEmpty({ message: 'Device type is required'})
    @IsString({ message: 'Device type must be a string'})
    @IsMongoId({ message: 'Device type must be a valid device type ID'})
    deviceType: string;
}