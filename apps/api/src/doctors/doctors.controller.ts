import {
  Controller, Get, Patch, Post, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { AvailabilityDto, UnavailabilityDto } from './dto/availability.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@sehathub/types';

@Controller('doctors')
@UseGuards(RolesGuard)
export class DoctorsController {
  constructor(private doctors: DoctorsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  findAll() {
    return this.doctors.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  findOne(@Param('id') id: string) {
    return this.doctors.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  update(@Param('id') id: string, @Body() dto: UpdateDoctorDto) {
    return this.doctors.update(id, dto);
  }

  @Get(':id/slots')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PATIENT')
  getSlots(@Param('id') id: string, @Query('date') date: string) {
    return this.doctors.getAvailableSlots(id, date);
  }

  @Post(':id/availability')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  setAvailability(@Param('id') id: string, @Body() dto: AvailabilityDto[]) {
    return this.doctors.setAvailability(id, dto);
  }

  @Post(':id/unavailability')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  addUnavailability(@Param('id') id: string, @Body() dto: UnavailabilityDto) {
    return this.doctors.addUnavailability(id, dto);
  }

  @Delete(':id/unavailability/:uid')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  removeUnavailability(@Param('id') id: string, @Param('uid') uid: string) {
    return this.doctors.removeUnavailability(id, uid);
  }

  // Doctor reads their own profile
  @Get('me/profile')
  @Roles('DOCTOR')
  async myProfile(@CurrentUser() user: JwtPayload) {
    const doctor = await this.doctors.findByUserId(user.sub);
    if (!doctor) return null;
    return this.doctors.findOne(doctor.id);
  }
}
