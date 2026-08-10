import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecoveryIncidentDto } from './dto/create-recovery-incident.dto';
import { UpdateRecoveryIncidentStatusDto } from './dto/update-recovery-incident-status.dto';

@Injectable()
export class RecoveryIncidentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRecoveryIncidentDto) {
    const incident = await this.prisma.recoveryIncident.create({
      data: {
        driverId: dto.driverId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        description: dto.description,
        status: 'Open',
      },
    });

    return {
      message: 'Recovery incident logged successfully',
      incident,
    };
  }

  async findAll() {
    return this.prisma.recoveryIncident.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const incident = await this.prisma.recoveryIncident.findUnique({
      where: { id },
    });

    if (!incident) {
      throw new NotFoundException(`Recovery incident with ID ${id} not found`);
    }

    return incident;
  }

  async updateStatus(id: string, dto: UpdateRecoveryIncidentStatusDto) {
    await this.findOne(id); // Ensure incident exists

    const updatedIncident = await this.prisma.recoveryIncident.update({
      where: { id },
      data: { status: dto.status },
    });

    return {
      message: 'Recovery incident status updated successfully',
      incident: updatedIncident,
    };
  }
}
