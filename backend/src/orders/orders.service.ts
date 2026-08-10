import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignOrderDto } from './dto/assign-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const finalVolume = dto.volumeGallons !== undefined ? Number(dto.volumeGallons) : (dto.volume !== undefined ? Number(dto.volume) : 1000);
    const finalPrice = dto.price !== undefined ? Number(dto.price) : (finalVolume * 0.1);

    const order = await this.prisma.waterOrder.create({
      data: {
        customerId: dto.customerId,
        volume: finalVolume,
        locationLat: dto.locationLat ?? 25.2048,
        locationLng: dto.locationLng ?? 55.2708,
        price: finalPrice,
        status: 'Pending',
      },
    });

    return {
      message: 'Water order created successfully',
      order,
    };
  }

  async findAll(customerId?: string, driverId?: string) {
    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (driverId) {
      where.OR = [
        { driverId: driverId },
      ];
    }
    return this.prisma.waterOrder.findMany({
      where,
      include: {
        customer: { select: { id: true, fullName: true, email: true, phone: true } },
        driver: { select: { id: true, fullName: true, email: true, phone: true } },
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.waterOrder.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, fullName: true, email: true, phone: true } },
        driver: { select: { id: true, fullName: true, email: true, phone: true } },
        vehicle: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async assignOrder(id: string, dto: AssignOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.waterOrder.findUnique({
        where: { id },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      const driver = await tx.user.findUnique({
        where: { id: dto.driverId },
      });

      if (!driver || driver.role !== 'Driver') {
        throw new NotFoundException(`Driver with ID ${dto.driverId} not found or invalid`);
      }

      if (driver.accountStatus !== 'Approved') {
        throw new ConflictException('Selected driver account is not approved');
      }

      const vehicle = await tx.vehicle.findUnique({
        where: { id: dto.vehicleId },
      });

      if (!vehicle) {
        throw new NotFoundException(`Vehicle with ID ${dto.vehicleId} not found`);
      }

      // Check if vehicle is already assigned to another active order or rented
      const activeOrderWithVehicle = await tx.waterOrder.findFirst({
        where: {
          vehicleId: dto.vehicleId,
          status: { notIn: ['Completed', 'Cancelled'] },
          id: { not: id },
        },
      });

      if (activeOrderWithVehicle || vehicle.status === 'Maintenance' || vehicle.status === 'Rented') {
        throw new ConflictException('Selected vehicle is currently busy, under maintenance, or rented');
      }

      const updatedOrder = await tx.waterOrder.update({
        where: { id },
        data: {
          driverId: dto.driverId,
          vehicleId: dto.vehicleId,
          status: 'Accepted',
        },
        include: {
          customer: { select: { id: true, fullName: true, email: true, phone: true } },
          driver: { select: { id: true, fullName: true, email: true, phone: true } },
          vehicle: true,
        },
      });

      return {
        message: 'Order assigned to driver and vehicle successfully',
        order: updatedOrder,
      };
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.findOne(id); // Ensure order exists

    const updatedOrder = await this.prisma.waterOrder.update({
      where: { id },
      data: { status: dto.status },
      include: {
        customer: { select: { id: true, fullName: true, email: true, phone: true } },
        driver: { select: { id: true, fullName: true, email: true, phone: true } },
        vehicle: true,
      },
    });

    return {
      message: 'Order status updated successfully',
      order: updatedOrder,
    };
  }
}