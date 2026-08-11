import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaMariaDb({
      host: process.env.MYSQLHOST!,
      port: Number(process.env.MYSQLPORT!) || 3306,
      user: process.env.MYSQLUSER!,
      password: process.env.MYSQLPASSWORD!,
      database: process.env.MYSQLDATABASE!,
      connectionLimit: 5,
    });
    
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}