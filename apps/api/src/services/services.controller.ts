import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreatePromoCodeDto } from './dto/create-promo.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('services')
@UseGuards(RolesGuard)
export class ServicesController {
  constructor(private services: ServicesService) {}

  @Get()
  @Public()
  findAll(@Query('active') active?: string) {
    return this.services.findAll(active === 'true');
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.services.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() dto: CreateServiceDto) {
    return this.services.create(dto);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.services.update(id, dto);
  }

  // Promo codes
  @Get('promos/list')
  @Roles('SUPER_ADMIN', 'ADMIN')
  findAllPromos() {
    return this.services.findAllPromos();
  }

  @Post('promos')
  @Roles('SUPER_ADMIN', 'ADMIN')
  createPromo(@Body() dto: CreatePromoCodeDto) {
    return this.services.createPromo(dto);
  }
}
