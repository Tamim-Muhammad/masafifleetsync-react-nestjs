import { IsString, IsIn } from 'class-validator';

export class UpdateRecoveryIncidentStatusDto {
  @IsString()
  @IsIn(['Open', 'In_Progress', 'Resolved', 'Closed'], { message: 'Invalid recovery incident status' })
  status!: string;
}
