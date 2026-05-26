import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Appointments')
@ApiBearerAuth('access-token')
@Controller('appointments')
@UseGuards(RolesGuard)
export class AppointmentsController {
  constructor(private appointments: AppointmentsService) {}

  @ApiOperation({ summary: 'List appointments (filterable, paginated)' })
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  findAll(@Query() query: QueryAppointmentDto) {
    return this.appointments.findAll(query);
  }

  @ApiOperation({ summary: 'Get appointment by ID' })
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PATIENT')
  findOne(@Param('id') id: string) {
    return this.appointments.findOne(id);
  }

  @ApiOperation({ summary: 'Book a new appointment' })
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'PATIENT')
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointments.create(dto);
  }

  @ApiOperation({ summary: 'Update appointment status (confirm, complete, cancel, etc.)' })
  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PATIENT')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto) {
    return this.appointments.updateStatus(id, dto);
  }
}
