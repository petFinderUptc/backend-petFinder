import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { AuthService } from '../../application/services';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  RefreshTokenDto,
  LogoutDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../../application/dtos/auth';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, UserFromJwt } from '../decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const token = refreshTokenDto.token ?? refreshTokenDto.refreshToken;
    return this.authService.refresh(token || '');
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyByToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ valid: boolean }> {
    const token = refreshTokenDto.token ?? refreshTokenDto.refreshToken;
    await this.authService.validateToken(token || '');
    return { valid: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() logoutDto: LogoutDto): Promise<{ message: string }> {
    return this.authService.logout(logoutDto);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: UserFromJwt): Promise<{ message: string }> {
    return this.authService.logoutAll(user.id);
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verify(@CurrentUser() user: UserFromJwt): Promise<{ valid: boolean; user: UserFromJwt }> {
    return { valid: true, user };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string; resetToken?: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
