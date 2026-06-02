import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@Controller('analytics')
@UseGuards(RolesGuard)
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @ApiOperation({ summary: 'Get dashboard summary stats (Admin only)' })
  @Get('summary')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getSummary() {
    const data = await this.analytics.getSummary();
    return { success: true, data };
  }
}
