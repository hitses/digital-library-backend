import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin } from '../admin/entities/admin.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    const admin = await this.adminModel.findOne({ email, delete: false });

    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = {
      id: admin._id.toString(),
      email: admin.email,
    };

    const token = this.jwtService.sign(payload);

    return {
      id: admin._id.toString(),
      email: admin.email,
      token,
    };
  }

  async changePassword(
    admin: Admin,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    if (!currentPassword || !newPassword)
      throw new NotFoundException('Current or new passwords are required');

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.password,
    );

    if (!isPasswordValid)
      throw new BadRequestException('Current password is incorrect');

    try {
      admin.password = await bcrypt.hash(newPassword, 10);

      await admin.save();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Could not change password',
        error,
      );
    }
  }
}
