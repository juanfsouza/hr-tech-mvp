import { JwtAuthGuard } from "@/shared/infrastructure/http/guards/jwt-auth.guard";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiBearerAuth } from "@nestjs/swagger";


@Controller('health')
export class HealthController {
    constructor() { }

    @Get()
    @ApiOperation({ summary: 'Check if the API is running' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async health(): Promise<{ status: string }> {
        return { status: 'ok' };
    }

    @Get('db')
    @ApiOperation({ summary: 'Check if the database is running' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async healthDb(): Promise<{ status: string }> {
        return { status: 'ok' };
    }
}