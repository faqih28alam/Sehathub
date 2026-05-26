import {
  Controller, Get, Post, Param, Body, Query, UseGuards, Res, StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@sehathub/types';

@Controller('prescriptions')
@UseGuards(RolesGuard)
export class PrescriptionsController {
  constructor(private prescriptions: PrescriptionsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  create(@Body() dto: CreatePrescriptionDto, @CurrentUser() user: JwtPayload) {
    return this.prescriptions.create(dto, user);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  findAll(
    @Query() query: { patientId?: string; doctorId?: string; page?: string; limit?: string },
  ) {
    return this.prescriptions.findAll(query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PATIENT')
  findOne(@Param('id') id: string) {
    return this.prescriptions.findOne(id);
  }

  @Get('patient/:patientId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PATIENT')
  findByPatient(@Param('patientId') patientId: string) {
    return this.prescriptions.findByPatient(patientId);
  }

  @Get(':id/pdf')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PATIENT')
  async downloadPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.prescriptions.getPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="prescription-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    return new StreamableFile(buffer);
  }
}
