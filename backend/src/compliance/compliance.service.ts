import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAccountStatusDto } from './dto/update-account-status.dto';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  async getPendingDrivers() {
    const drivers = await this.prisma.user.findMany({
      where: {
        role: 'Driver',
        accountStatus: 'Pending',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        accountStatus: true,
        createdAt: true,
      },
    });

    return {
      count: drivers.length,
      drivers,
    };
  }

  async updateDriverStatus(id: string, dto: UpdateAccountStatusDto) {
    const driver = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!driver || driver.role !== 'Driver') {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        accountStatus: dto.accountStatus,
      },
    });

    const { password, ...result } = updatedUser;
    return {
      message: `Driver account status updated to ${dto.accountStatus} successfully`,
      user: result,
    };
  }
}
