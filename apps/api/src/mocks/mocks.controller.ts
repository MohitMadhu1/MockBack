import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { MocksService } from './mocks.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('mocks')
export class MocksController {
  constructor(private readonly mocksService: MocksService) {}

  @Post()
  async createMock(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId;
    const { name, config } = body;
    return this.mocksService.createMock(userId, name, config);
  }

  @Get()
  async getMocks(@Request() req: any) {
    const userId = req.user.userId;
    return this.mocksService.getMocksByUser(userId);
  }

  @Get(':id')
  async getMock(@Request() req: any, @Param('id') mockId: string) {
    const userId = req.user.userId;
    return this.mocksService.getMockById(userId, mockId);
  }

  @Put(':id')
  async updateMock(@Request() req: any, @Param('id') mockId: string, @Body() body: any) {
    const userId = req.user.userId;
    return this.mocksService.updateMock(userId, mockId, body.config);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteMock(@Request() req: any, @Param('id') mockId: string) {
    const userId = req.user.userId;
    await this.mocksService.deleteMock(userId, mockId);
  }
}
