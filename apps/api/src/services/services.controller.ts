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
  async findAll(@Query('active') active?: string) {
    const data = await this.services.findAll(active === 'true');
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Get service by ID (public)' })
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    const data = await this.services.findOne(id);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Create a new service' })
  @ApiBearerAuth('access-token')
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() dto: CreateServiceDto) {
    const data = await this.services.create(dto);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Update a service' })
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    const data = await this.services.update(id, dto);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'List all promo codes' })
  @ApiBearerAuth('access-token')
  @Get('promos/list')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findAllPromos() {
    const data = await this.services.findAllPromos();
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Create a promo code' })
  @ApiBearerAuth('access-token')
  @Post('promos')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createPromo(@Body() dto: CreatePromoCodeDto) {
    const data = await this.services.createPromo(dto);
    return { success: true, data };
  }
}
