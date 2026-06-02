import {
  Controller, Get, Post, Param, Body, Query, UseGuards, Res, StreamableFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@sehathub/types';

@ApiTags('Prescriptions')
@ApiBearerAuth('access-token')
@Controller('prescriptions')
@UseGuards(RolesGuard)
export class PrescriptionsController {
  constructor(private prescriptions: PrescriptionsService) {}

  @ApiOperation({ summary: 'Issue a new prescription' })
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  async create(@Body() dto: CreatePrescriptionDto, @CurrentUser() user: JwtPayload) {
    const data = await this.prescriptions.create(dto, user);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'List prescriptions (filterable, paginated)' })
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  async findAll(
    @Query() query: { patientId?: string; doctorId?: string; page?: string; limit?: string },
  ) {
    const data = await this.prescriptions.findAll(query);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Get prescription by ID' })
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PATIENT')
  async findOne(@Param('id') id: string) {
    const data = await this.prescriptions.findOne(id);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Get all prescriptions for a patient' })
  @Get('patient/:patientId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PATIENT')
  async findByPatient(@Param('patientId') patientId: string) {
    const data = await this.prescriptions.findByPatient(patientId);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Download prescription as PDF' })
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
