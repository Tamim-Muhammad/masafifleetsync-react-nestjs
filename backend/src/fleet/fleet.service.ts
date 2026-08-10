import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateVehicleStatusDto } from './dto/update-vehicle-status.dto';

@Injectable()
export class FleetService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVehicleDto) {
    const existingVehicle = await this.prisma.vehicle.findFirst({
      where: {
        OR: [
          { plateNumber: dto.plateNumber },
          { chassisNumber: dto.chassisNumber },
        ],
      },
    });

    if (existingVehicle) {
      throw new ConflictException('Vehicle with this plate number or chassis number already exists');
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        plateNumber: dto.plateNumber,
        chassisNumber: dto.chassisNumber,
        category: (dto as any).category || 'Water Tanker Fleet',
        status: dto.status,
        insuranceExpiry: new Date(dto.insuranceExpiry),
        licenseExpiry: new Date(dto.licenseExpiry),
      },
    });

    return {
      message: 'Vehicle registered successfully',
      vehicle,
    };
  }

  async findAll() {
    return this.prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.findOne(id); // Ensure vehicle exists

    if (dto.plateNumber || dto.chassisNumber) {
      const existingVehicle = await this.prisma.vehicle.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(dto.plateNumber ? [{ plateNumber: dto.plateNumber }] : []),
                ...(dto.chassisNumber ? [{ chassisNumber: dto.chassisNumber }] : []),
              ],
            },
          ],
        },
      });

      if (existingVehicle) {
        throw new ConflictException('Vehicle with this plate number or chassis number already exists');
      }
    }

    const updateData: any = {};
    if (dto.plateNumber) updateData.plateNumber = dto.plateNumber;
    if (dto.chassisNumber) updateData.chassisNumber = dto.chassisNumber;
    if ((dto as any).category) updateData.category = (dto as any).category;
    if (dto.status) updateData.status = dto.status;
    if (dto.insuranceExpiry) updateData.insuranceExpiry = new Date(dto.insuranceExpiry);
    if (dto.licenseExpiry) updateData.licenseExpiry = new Date(dto.licenseExpiry);

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle,
    };
  }

  async updateStatus(id: string, dto: UpdateVehicleStatusDto) {
    await this.findOne(id); // Ensure vehicle exists

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: { status: dto.status },
    });

    return {
      message: 'Vehicle status updated successfully',
      vehicle: updatedVehicle,
    };
  }
}