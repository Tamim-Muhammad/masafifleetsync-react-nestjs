import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { UpdateAccountStatusDto } from './dto/update-account-status.dto';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('drivers/pending')
  async getPendingDrivers() {
    return this.complianceService.getPendingDrivers();
  }

  @Patch('drivers/:id/status')
  async updateDriverStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAccountStatusDto,
  ) {
    return this.complianceService.updateDriverStatus(id, dto);
  }
}
