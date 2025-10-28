import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { createErrorResponse } from 'src/common/methods/errors';

@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
    createAdminDto.password = hashedPassword;

    try {
      const newAdmin = await this.adminModel.create(createAdminDto);

      return newAdmin;
    } catch (error) {
      return createErrorResponse('Admin', error);
    }
  }

  async findAll(): Promise<Admin[]> {
    return await this.adminModel.find();
  }

  async findOne(id: string): Promise<Admin | null> {
    return await this.adminModel.findById(id);
  }

  async update(
    id: string,
    updateAdminDto: UpdateAdminDto,
  ): Promise<Admin | null> {
    if ('password' in updateAdminDto)
      throw new ForbiddenException('Password cannot be changed via this route');

    return await this.adminModel.findByIdAndUpdate(id, updateAdminDto, {
      new: true,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
