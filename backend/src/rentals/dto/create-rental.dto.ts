import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateRentalDto {
  @IsString()
  customerId!: string;

  @IsString()
  @IsOptional()
  vehicleId?: string;

  @IsString()
  @IsOptional()
  vehicleCategory?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsNumber()
  totalPrice!: number;
}