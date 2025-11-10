import { Body, Controller, Post, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Auth } from './decorators/auth.decorator';
import { CurrentAdmin } from './decorators/current-admin.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Admin } from 'src/admin/entities/admin.entity';
import { SkipPasswordChangeCheck } from './decorators/skip-password-change-check.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Patch('change-password')
  @Auth()
  @SkipPasswordChangeCheck() // Obvia que el administrador haya cambiado su contraseña al menos una vez para este endpoint
  async changePassword(
    @CurrentAdmin() admin: Admin,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(admin, changePasswordDto);

    return { message: 'Password changed successfully' };
  }

  @Patch('forgot')
  @Auth()
  async forgotPassword(
    @CurrentAdmin() admin: Admin,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(admin);

    return { message: 'Password reset successfully' };
  }
}
