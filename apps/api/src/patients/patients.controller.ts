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
  findAll(@Query() query: QueryPatientDto) {
    return this.patients.findAll(query);
  }

  @ApiOperation({ summary: 'Get patient by ID' })
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  findOne(@Param('id') id: string) {
    return this.patients.findOne(id);
  }

  @ApiOperation({ summary: 'Get patient appointment + prescription timeline' })
  @Get(':id/timeline')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  getTimeline(@Param('id') id: string) {
    return this.patients.getTimeline(id);
  }

  @ApiOperation({ summary: 'Create a new patient record' })
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() dto: CreatePatientDto) {
    return this.patients.create(dto);
  }

  @ApiOperation({ summary: 'Update patient record' })
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patients.update(id, dto);
  }
}
