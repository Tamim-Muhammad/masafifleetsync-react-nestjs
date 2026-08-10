import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { RecoveryIncidentsService } from './recovery-incidents.service';
import { CreateRecoveryIncidentDto } from './dto/create-recovery-incident.dto';
import { UpdateRecoveryIncidentStatusDto } from './dto/update-recovery-incident-status.dto';

@Controller('recovery-incidents')
export class RecoveryIncidentsController {
  constructor(private readonly recoveryIncidentsService: RecoveryIncidentsService) {}

  @Post()
  create(@Body() createRecoveryIncidentDto: CreateRecoveryIncidentDto) {
    return this.recoveryIncidentsService.create(createRecoveryIncidentDto);
  }

  @Get()
  findAll() {
    return this.recoveryIncidentsService.findAll();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateRecoveryIncidentStatusDto: UpdateRecoveryIncidentStatusDto,
  ) {
    return this.recoveryIncidentsService.updateStatus(id, updateRecoveryIncidentStatusDto);
  }
}
