import { IsString, IsIn } from 'class-validator';

export class UpdateVehicleStatusDto {
  @IsString()
  @IsIn(['Active', 'Maintenance', 'Rented'], { message: 'Invalid vehicle status' })
  status!: string;
}
