import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { FleetModule } from './fleet/fleet.module';
import { RentalsModule } from './rentals/rentals.module';
import { RecoveryIncidentsModule } from './recovery/recovery-incidents.module';
import { ComplianceModule } from './compliance/compliance.module';
import { AnnouncementsModule } from './announcements/announcements.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OrdersModule,
    FleetModule,
    RentalsModule,
    RecoveryIncidentsModule,
    ComplianceModule,
    AnnouncementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}