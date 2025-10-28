import {
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import {
  createErrorResponse,
  updateErrorResponse,
} from 'src/common/methods/errors';

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
    return await this.adminModel.find({ delete: false });
  }

  async findOne(id: string): Promise<Admin | null> {
    return await this.adminModel.findOne({ _id: id, delete: false });
  }

  async update(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    if ('password' in updateAdminDto)
      throw new ForbiddenException('Password cannot be changed via this route');

    try {
      const updatedAdmin = await this.adminModel.findOneAndUpdate(
        { _id: id, delete: false },
        updateAdminDto,
        { new: true },
      );

      if (!updatedAdmin) throw new NotFoundException('Admin not found');

      return updatedAdmin;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      return updateErrorResponse('Admin', error);
    }
  }

  async remove(currentAdmin: Admin, id: string): Promise<Admin | null> {
    if (currentAdmin._id.toString() === id)
      throw new ForbiddenException("You can't delete yourself");

    return await this.adminModel.findByIdAndUpdate(
      id,
      { delete: true },
      { new: true },
    );
  }
}
