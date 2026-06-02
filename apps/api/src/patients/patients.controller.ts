import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Patients')
@ApiBearerAuth('access-token')
@Controller('patients')
@UseGuards(RolesGuard)
export class PatientsController {
  constructor(private patients: PatientsService) {}

  @ApiOperation({ summary: 'List patients (searchable, paginated)' })
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  async findAll(@Query() query: QueryPatientDto) {
    const data = await this.patients.findAll(query);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Get patient by ID' })
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  async findOne(@Param('id') id: string) {
    const data = await this.patients.findOne(id);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Get patient appointment + prescription timeline' })
  @Get(':id/timeline')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  async getTimeline(@Param('id') id: string) {
    const data = await this.patients.getTimeline(id);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Create a new patient record' })
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() dto: CreatePatientDto) {
    const data = await this.patients.create(dto);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Update patient record' })
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    const data = await this.patients.update(id, dto);
    return { success: true, data };
  }
}
