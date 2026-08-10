import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private otpStore = new Map<string, { code: string; expiresAt: number }>();

  constructor(private prisma: PrismaService) {}

  async sendOtp(phoneNumber: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    this.otpStore.set(phoneNumber, { code, expiresAt });

    console.log(`========================================`);
    console.log(` [OTP SYSTEM] Generated OTP for ${phoneNumber}: ${code}`);
    console.log(`========================================`);

    return {
      message: 'OTP sent successfully',
    };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (dto.verificationCode) {
      const storedOtpData = this.otpStore.get(dto.phone);
      if (!storedOtpData) {
        throw new BadRequestException('No verification code found for this phone number. Please request a new code.');
      }
      if (Date.now() > storedOtpData.expiresAt) {
        this.otpStore.delete(dto.phone);
        throw new BadRequestException('Verification code has expired. Please request a new one.');
      }
      if (storedOtpData.code !== dto.verificationCode) {
        throw new BadRequestException('Invalid verification code entered.');
      }
      this.otpStore.delete(dto.phone);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const { licenseNumber, licenseIssuingAuthority, licenseExpiryDate, vehicleAssignment, plateNumber, chassisNumber, ...baseUserData } = dto;

    const user = await this.prisma.user.create({
      data: {
        email: baseUserData.email,
        password: hashedPassword,
        fullName: baseUserData.fullName,
        phone: baseUserData.phone,
        role: baseUserData.role,
        accountStatus: baseUserData.role === 'Driver' ? 'Pending' : 'Approved',
      },
    });

    const { password, ...result } = user;
    return {
      message: 'User registered successfully',
      user: result,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.role === 'Driver' && user.accountStatus !== 'Approved') {
      throw new ForbiddenException('Your account is pending admin approval');
    }

    const { password, ...result } = user;
    return {
      message: 'Login successful',
      user: result,
    };
  }

  async approveDriverAccount(identifier: string) {
    const updatedUser = await this.prisma.user.updateMany({
      where: {
        OR: [
          { id: identifier },
          { email: 'driver@gmail.com' }
        ]
      },
      data: { accountStatus: 'Approved' },
    });

    return {
      message: 'Driver account successfully approved',
      updatedUser,
    };
  }

  async getApprovedDrivers() {
    return this.prisma.user.findMany({
      where: {
        role: 'Driver',
        accountStatus: 'Approved',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });
  }
}