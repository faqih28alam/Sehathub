import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@sehathub/types';

@ApiTags('CRM')
@ApiBearerAuth('access-token')
@Controller('crm')
@UseGuards(RolesGuard)
export class CrmController {
  constructor(private crm: CrmService) {}

  @ApiOperation({ summary: 'List leads (filterable, paginated)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'source', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get('leads')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findAllLeads(@Query() query: { status?: string; source?: string; page?: string; limit?: string }) {
    const result = await this.crm.findAllLeads(query);
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Get lead status counts (pipeline overview)' })
  @Get('leads/counts')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getStatusCounts() {
    const data = await this.crm.getStatusCounts();
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Get lead by ID with activity log' })
  @Get('leads/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findOne(@Param('id') id: string) {
    const data = await this.crm.findOne(id);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Create a new lead' })
  @Post('leads')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() dto: CreateLeadDto) {
    const data = await this.crm.create(dto);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Update lead status or info' })
  @Patch('leads/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    const data = await this.crm.update(id, dto);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Add a CRM activity to a lead' })
  @Post('leads/:id/activities')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async addActivity(
    @Param('id') id: string,
    @Body() dto: CreateActivityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.crm.addActivity(id, dto, user.sub);
    return { success: true, data };
  }
}
