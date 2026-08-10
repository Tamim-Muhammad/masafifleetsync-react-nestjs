import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsString()
  fullName!: string;

  @IsString()
  phone!: string;

  @IsString()
  @IsIn(['Customer', 'Driver', 'Admin', 'Dispatcher'], { message: 'Invalid role specified' })
  role!: string;

  @IsString()
  @IsOptional()
  verificationCode?: string;

  // Driver Compliance & Vehicle Fields
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  licenseIssuingAuthority?: string;

  @IsString()
  @IsOptional()
  licenseExpiryDate?: string;

  @IsString()
  @IsOptional()
  vehicleAssignment?: string;

  @IsString()
  @IsOptional()
  plateNumber?: string;

  @IsString()
  @IsOptional()
  chassisNumber?: string;
}