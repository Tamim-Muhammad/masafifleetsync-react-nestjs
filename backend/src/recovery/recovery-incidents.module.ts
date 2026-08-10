import { Module } from '@nestjs/common';
import { RecoveryIncidentsService } from './recovery-incidents.service';
import { RecoveryIncidentsController } from './recovery-incidents.controller';

@Module({
  controllers: [RecoveryIncidentsController],
  providers: [RecoveryIncidentsService],
  exports: [RecoveryIncidentsService],
})
export class RecoveryIncidentsModule {}
