import {
  Controller, Get, Post, Body, Query, UseGuards, HttpCode, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('WhatsApp')
@Controller('whatsapp')
@UseGuards(RolesGuard)
export class WhatsAppController {
  constructor(private wa: WhatsAppService) {}

  @ApiOperation({ summary: 'Meta Cloud API webhook verification (called by Meta)' })
  @Get('webhook')
  @Public()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const result = this.wa.verifyWebhook(mode, token, challenge);
    if (result) return res.status(200).send(result);
    return res.status(403).send('Forbidden');
  }

  @ApiOperation({ summary: 'Meta Cloud API inbound message webhook' })
  @Post('webhook')
  @Public()
  @HttpCode(200)
  handleInbound(@Body() body: Record<string, unknown>) {
    return this.wa.handleInbound(body);
  }

  @ApiOperation({ summary: 'Send a WhatsApp message (Admin only)' })
  @ApiBearerAuth('access-token')
  @Post('send')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async send(@Body() dto: SendMessageDto) {
    const id = await this.wa.sendText(dto.to, dto.body);
    return { success: true, data: { id } };
  }

  @ApiOperation({ summary: 'List WhatsApp messages (Admin only)' })
  @ApiBearerAuth('access-token')
  @ApiQuery({ name: 'direction', required: false, enum: ['INBOUND', 'OUTBOUND'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get('messages')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getMessages(
    @Query() query: { direction?: string; page?: string; limit?: string },
  ) {
    const data = await this.wa.getMessages(query);
    return { success: true, data };
  }
}
