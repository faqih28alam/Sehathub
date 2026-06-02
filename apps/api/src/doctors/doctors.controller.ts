import {
  Controller, Get, Patch, Post, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { AvailabilityDto, UnavailabilityDto } from './dto/availability.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@sehathub/types';

@ApiTags('Doctors')
@ApiBearerAuth('access-token')
@Controller('doctors')
@UseGuards(RolesGuard)
export class DoctorsController {
  constructor(private doctors: DoctorsService) {}

  @ApiOperation({ summary: 'List all doctors' })
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findAll() {
    const data = await this.doctors.findAll();
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Get doctor by ID' })
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  async findOne(@Param('id') id: string) {
    const data = await this.doctors.findOne(id);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Update doctor profile' })
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  async update(@Param('id') id: string, @Body() dto: UpdateDoctorDto) {
    const data = await this.doctors.update(id, dto);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Get available time slots for a doctor on a given date' })
  @ApiQuery({ name: 'date', required: true, example: '2026-06-15', description: 'YYYY-MM-DD' })
  @Get(':id/slots')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PATIENT')
  async getSlots(@Param('id') id: string, @Query('date') date: string) {
    const data = await this.doctors.getAvailableSlots(id, date);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Set recurring weekly availability for a doctor' })
  @Post(':id/availability')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  async setAvailability(@Param('id') id: string, @Body() dto: AvailabilityDto[]) {
    const data = await this.doctors.setAvailability(id, dto);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Block a specific date as unavailable' })
  @Post(':id/unavailability')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  async addUnavailability(@Param('id') id: string, @Body() dto: UnavailabilityDto) {
    const data = await this.doctors.addUnavailability(id, dto);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Remove a blocked date' })
  @Delete(':id/unavailability/:uid')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  async removeUnavailability(@Param('id') id: string, @Param('uid') uid: string) {
    const data = await this.doctors.removeUnavailability(id, uid);
    return { success: true, data };
  }

  @ApiOperation({ summary: "Get the authenticated doctor's own profile" })
  @Get('me/profile')
  @Roles('DOCTOR')
  async myProfile(@CurrentUser() user: JwtPayload) {
    const doctor = await this.doctors.findByUserId(user.sub);
    if (!doctor) return { success: true, data: null };
    const data = await this.doctors.findOne(doctor.id);
    return { success: true, data };
  }
}
