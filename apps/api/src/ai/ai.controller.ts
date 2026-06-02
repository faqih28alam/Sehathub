import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { TriageDto } from './dto/triage.dto';
import { FaqQueryDto } from './dto/faq.dto';
import { CreateFaqItemDto, UpdateFaqItemDto } from './dto/faq-item.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('AI')
@Controller('ai')
@UseGuards(RolesGuard)
export class AiController {
  constructor(private ai: AiService) {}

  // ─── Triage (public — patients use before registering) ─────────────────────

  @ApiOperation({ summary: 'Symptom triage — returns urgency level and recommendations' })
  @Post('triage')
  @Public()
  async triage(@Body() dto: TriageDto) {
    const data = await this.ai.triage(dto.symptoms, dto.language);
    return { success: true, data };
  }

  // ─── FAQ (public) ───────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Ask a clinic FAQ question (AI-powered RAG)' })
  @Post('faq/query')
  @Public()
  async faqQuery(@Body() dto: FaqQueryDto) {
    const data = await this.ai.faqQuery(dto.question);
    return { success: true, data };
  }

  // ─── Consultation Summary (Doctor / Admin) ──────────────────────────────────

  @ApiOperation({ summary: 'Generate AI consultation summary for an appointment' })
  @ApiBearerAuth('access-token')
  @Post('summary/:appointmentId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'DOCTOR')
  async generateSummary(@Param('appointmentId') id: string) {
    const data = await this.ai.generateSummary(id);
    return { success: true, data };
  }

  // ─── FAQ CRUD (Admin) ───────────────────────────────────────────────────────

  @ApiOperation({ summary: 'List all FAQ items' })
  @ApiBearerAuth('access-token')
  @Get('faq')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getFaqs() {
    const data = await this.ai.getFaqs();
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Create a FAQ item' })
  @ApiBearerAuth('access-token')
  @Post('faq')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createFaq(@Body() dto: CreateFaqItemDto) {
    const data = await this.ai.createFaq(dto);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Update a FAQ item' })
  @ApiBearerAuth('access-token')
  @Patch('faq/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqItemDto) {
    const data = await this.ai.updateFaq(id, dto);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Delete a FAQ item' })
  @ApiBearerAuth('access-token')
  @Delete('faq/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async deleteFaq(@Param('id') id: string) {
    await this.ai.deleteFaq(id);
    return { success: true };
  }
}
