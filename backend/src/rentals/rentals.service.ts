import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';

@Injectable()
export class RentalsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRentalDto) {
    const customer = await this.prisma.user.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${dto.customerId} not found`);
    }

    let targetVehicleId = dto.vehicleId;

    if (targetVehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: targetVehicleId },
      });
      if (!vehicle) {
        throw new NotFoundException(`Vehicle with ID ${targetVehicleId} not found`);
      }
      // Accept either 'Available' or 'Active' statuses
      if (vehicle.status !== 'Available' && vehicle.status !== 'Active') {
        throw new BadRequestException(`Vehicle is not available for rental (Current status: ${vehicle.status})`);
      }
    } else if (dto.vehicleCategory) {
      // Find an available vehicle matching category
      let availableVehicle = await this.prisma.vehicle.findFirst({
        where: { 
          status: 'Available',
          category: dto.vehicleCategory,
        },
      });

      if (!availableVehicle) {
        // Fallback: grab any available vehicle in inventory
        availableVehicle = await this.prisma.vehicle.findFirst({
          where: { status: 'Available' },
        });
      }

      if (!availableVehicle) {
        // Ultimate fallback: check for 'Active' if 'Available' is not found
        availableVehicle = await this.prisma.vehicle.findFirst({
          where: { status: 'Active' },
        });
      }

      if (!availableVehicle) {
        throw new BadRequestException(`No available vehicles currently in inventory.`);
      }
      targetVehicleId = availableVehicle.id;
    } else {
      throw new BadRequestException('Either vehicleId or vehicleCategory must be provided.');
    }

    const [rental] = await this.prisma.$transaction([
      this.prisma.rentalAgreement.create({
        data: {
          customerId: dto.customerId,
          vehicleId: targetVehicleId,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          totalPrice: dto.totalPrice,
          status: 'Active',
          depositStatus: 'Pending',
        },
        include: {
          vehicle: true,
          customer: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
        },
      }),
      this.prisma.vehicle.update({
        where: { id: targetVehicleId },
        data: { status: 'Rented' },
      }),
    ]);

    return {
      message: 'Rental agreement created successfully and vehicle status updated to Rented',
      rental,
    };
  }

  async findAll() {
    return this.prisma.rentalAgreement.findMany({
      include: {
        vehicle: true,
        customer: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const rental = await this.prisma.rentalAgreement.findUnique({
      where: { id },
      include: {
        vehicle: true,
        customer: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
    });

    if (!rental) {
      throw new NotFoundException(`Rental agreement with ID ${id} not found`);
    }

    return rental;
  }

  async update(id: string, dto: UpdateRentalDto) {
    const rental = await this.findOne(id);

    const updatedRental = await this.prisma.rentalAgreement.update({
      where: { id },
      data: {
        ...(dto.depositStatus !== undefined && { depositStatus: dto.depositStatus }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.contractPdfUrl !== undefined && { contractPdfUrl: dto.contractPdfUrl }),
      },
      include: {
        vehicle: true,
        customer: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
    });

    if (dto.status === 'Completed' || dto.status === 'Cancelled') {
      await this.prisma.vehicle.update({
        where: { id: rental.vehicleId },
        data: { status: 'Available' }, // Reset back to Available for dispatch
      });
    }

    return {
      message: 'Rental agreement updated successfully',
      rental: updatedRental,
    };
  }
}