import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin } from '../admin/entities/admin.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    const admin = await this.adminModel.findOne({ email }).select('+password');

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
    adminId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const admin = await this.adminModel.findById(adminId).select('+password');

    if (!admin) throw new UnauthorizedException('Admin not found');

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.password,
    );

    if (!isPasswordValid)
      throw new UnauthorizedException('Current password is incorrect');

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();
  }
}
