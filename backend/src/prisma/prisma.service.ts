import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionUrl = new URL(process.env.DATABASE_URL!);
    
    const adapter = new PrismaMariaDb({
      host: connectionUrl.hostname,
      port: Number(connectionUrl.port) || 3306,
      user: connectionUrl.username,
      password: connectionUrl.password,
      database: connectionUrl.pathname.replace(/^\//, ''),
      connectionLimit: 5,
    });
    
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}