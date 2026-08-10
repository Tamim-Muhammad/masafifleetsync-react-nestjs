import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsString()
  chassisNumber?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Active', 'Maintenance', 'Rented', 'PendingInspection'], { message: 'Invalid vehicle status' })
  status?: string;

  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;
}
