import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/masafi_fleet';
    const url = new URL(connectionString);

    const adapter = new PrismaMariaDb({
      host: process.env.DB_HOST || url.hostname || '127.0.0.1',
      port: Number(process.env.DB_PORT || url.port) || 3306,
      user: process.env.DB_USER || url.username || 'root',
      password: process.env.DB_PASSWORD || url.password || '',
      database: process.env.DB_NAME || url.pathname.replace('/', '') || 'masafi_fleet',
      connectionLimit: 5,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}