import {
  ConflictException,
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
import { generateRandomPassword } from '../common/methods/random-password';

@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const randomPassword = generateRandomPassword();
    console.log(randomPassword); // TODO: Eliminar cuando se añada Nodemailer
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const existingAdmin = await this.adminModel.findOne({
      email: createAdminDto.email,
    });

    if (existingAdmin?.delete) {
      Object.assign(existingAdmin, {
        ...createAdminDto,
        password: hashedPassword,
        delete: false,
      });
      return existingAdmin.save();
    }

    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    try {
      const newAdmin = await this.adminModel.create({
        ...createAdminDto,
        password: hashedPassword,
      });
      return newAdmin;
    } catch (error) {
      return createErrorResponse('Admin', error);
    }
  }

  async findAll(): Promise<Admin[]> {
    return await this.adminModel.find({ delete: false });
  }

  async findOne(id: string): Promise<Admin> {
    const admin = await this.adminModel.findOne({ _id: id, delete: false });

    if (!admin) throw new NotFoundException('Admin not found or deleted');

    return admin;
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
