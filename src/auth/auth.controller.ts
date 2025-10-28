import { Body, Controller, Post, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Auth } from './decorators/auth.decorator';
import { CurrentAdmin } from './decorators/current-admin.decorator';
import { type JwtPayload } from './interfaces/jwt-payload.interface';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Patch('change-password')
  @Auth()
  async changePassword(
    @CurrentAdmin() admin: JwtPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(admin.id, changePasswordDto);

    return { message: 'Password changed successfully' };
  }
}
