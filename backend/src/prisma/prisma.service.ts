import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // In Prisma 7, PrismaMariaDb accepts the connection URL string directly!
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}