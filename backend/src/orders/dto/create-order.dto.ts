import { IsString, IsNumber, IsPositive, Min, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  customerId!: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  volume?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  volumeGallons?: number;

  @IsNumber()
  @IsOptional()
  locationLat?: number;

  @IsNumber()
  @IsOptional()
  locationLng?: number;

  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  scheduledTime?: string;

  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}
