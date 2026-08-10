import { IsString, IsIn, IsDateString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  plateNumber!: string;

  @IsString()
  chassisNumber!: string;

  @IsString()
  @IsIn(['Active', 'Maintenance', 'Rented', 'PendingInspection'], { message: 'Invalid vehicle status' })
  status!: string;

  @IsDateString()
  insuranceExpiry!: string;

  @IsDateString()
  licenseExpiry!: string;
}
