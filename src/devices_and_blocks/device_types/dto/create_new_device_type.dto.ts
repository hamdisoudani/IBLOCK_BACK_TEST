import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsString, IsUrl, MaxLength, MinLength } from "class-validator";

export class CreateNewDeviceTypeDto {
    @IsNotEmpty({ message: 'deviceType is required' })
    @IsString({ message: 'deviceType must be a string' })
    @MaxLength(50, { message: 'deviceType must be less than 50 characters' })
    @MinLength(3, { message: 'deviceType must be more than 3 characters' })
    deviceType: string;

    @IsNotEmpty({ message: 'Image is required' })
    @IsString({ message: 'Image must be a string' })
    // Check if the URL is an image URL
    @MaxLength(500, { message: 'Image must be less than 500 characters' })
    @MinLength(10, { message: 'Image must be more than 10 characters' })
    @IsUrl({
        protocols: ['https'],
        require_protocol: true,
        require_tld: true,
        require_host: true,
        require_valid_protocol: true
    }, { message: 'Image must be a valid URL' })
    imgUrl: string;

    @IsNotEmpty({ message: 'Vendor is required' })
    @IsString({ message: 'Vendor must be a string' })
    @MaxLength(50, { message: 'Vendor must be less than 50 characters' })
    @MinLength(3, { message: 'Vendor must be more than 3 characters' })
    vendor: string;

    @IsNotEmpty({ message: 'Connection Protocol is required' })
    @IsArray({ message: 'Connection Protocol must be an array' })
    @IsEnum(['serial_port', 'bluetooth', 'wifi'], { each: true, message: 'Connection Protocol must be either serial_port, bluetooth or wifi' })
    connectionProtocol: string[];

    @IsNotEmpty({ message: 'Categories is required' })
    @IsArray({ message: 'Categories must be an array' })
    @IsMongoId({ each: true, message: 'Categories must be an array of ObjectId' })
    categories: string[];
}