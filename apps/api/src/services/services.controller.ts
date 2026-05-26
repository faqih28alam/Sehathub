import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreatePromoCodeDto } from './dto/create-promo.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Services')
@Controller('services')
@UseGuards(RolesGuard)
export class ServicesController {
  constructor(private services: ServicesService) {}

  @ApiOperation({ summary: 'List services (public)' })
  @ApiQuery({ name: 'active', required: false, example: 'true' })
  @Get()
  @Public()
  findAll(@Query('active') active?: string) {
    return this.services.findAll(active === 'true');
  }

  @ApiOperation({ summary: 'Get service by ID (public)' })
  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.services.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new service' })
  @ApiBearerAuth('access-token')
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() dto: CreateServiceDto) {
    return this.services.create(dto);
  }

  @ApiOperation({ summary: 'Update a service' })
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.services.update(id, dto);
  }

  @ApiOperation({ summary: 'List all promo codes' })
  @ApiBearerAuth('access-token')
  @Get('promos/list')
  @Roles('SUPER_ADMIN', 'ADMIN')
  findAllPromos() {
    return this.services.findAllPromos();
  }

  @ApiOperation({ summary: 'Create a promo code' })
  @ApiBearerAuth('access-token')
  @Post('promos')
  @Roles('SUPER_ADMIN', 'ADMIN')
  createPromo(@Body() dto: CreatePromoCodeDto) {
    return this.services.createPromo(dto);
  }
}
