import { IsString, IsIn } from 'class-validator';

export class UpdateAccountStatusDto {
  @IsString()
  @IsIn(['Approved', 'Rejected', 'Pending'], { message: 'Invalid account status specified' })
  accountStatus!: string;
}
