import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { FleetService } from './fleet.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateVehicleStatusDto } from './dto/update-vehicle-status.dto';

@Controller('fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Post()
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.fleetService.create(createVehicleDto);
  }

  @Get()
  async findAll() {
    return this.fleetService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.fleetService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.fleetService.update(id, updateVehicleDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateVehicleStatusDto: UpdateVehicleStatusDto,
  ) {
    return this.fleetService.updateStatus(id, updateVehicleStatusDto);
  }
}
