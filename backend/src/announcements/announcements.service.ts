import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAnnouncementDto) {
    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        message: dto.message,
        audience: dto.audience,
        priority: dto.priority,
        status: 'Active Feed',
      },
    });

    return {
      message: 'Announcement broadcasted successfully',
      announcement,
    };
  }

  async findAll() {
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    await this.prisma.announcement.delete({ where: { id } });

    return {
      message: `Announcement ${id} revoked and removed successfully`,
    };
  }
}