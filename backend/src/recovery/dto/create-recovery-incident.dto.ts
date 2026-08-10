import { IsString, IsNumber } from 'class-validator';

export class CreateRecoveryIncidentDto {
  @IsString()
  driverId!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsString()
  description!: string;
}
