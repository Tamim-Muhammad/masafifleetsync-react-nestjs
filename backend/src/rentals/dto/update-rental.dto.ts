import { IsString, IsOptional, IsIn, IsUrl } from 'class-validator';

export class UpdateRentalDto {
  @IsOptional()
  @IsString()
  @IsIn(['Pending', 'Paid', 'Refunded', 'Verified'], { message: 'Invalid deposit status' })
  depositStatus?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Active', 'Completed', 'Cancelled'], { message: 'Invalid rental status' })
  status?: string;

  @IsOptional()
  @IsString()
  contractPdfUrl?: string;
}