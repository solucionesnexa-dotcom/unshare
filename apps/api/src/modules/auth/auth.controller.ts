import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) { return this.authService.login(dto); }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) { return this.authService.refresh(dto); }

  @Post('logout')
  async logout(@Headers('x-refresh-token') refreshToken: string) { return this.authService.logout(refreshToken); }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: RequestUser) { return { id: user.id, role: user.role, familyId: user.familyId }; }
}
