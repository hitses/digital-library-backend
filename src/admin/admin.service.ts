import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './entities/admin.entity';
import { Model } from 'mongoose';

@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>) {}

  create(createAdminDto: CreateAdminDto) {
    console.log(createAdminDto);
    return 'This action adds a new admin';
  }

  findAll() {
    return `This action returns all admin`;
  }

  async findOne(id: string): Promise<Admin | null> {
    return await this.adminModel.findById(id);
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    console.log(updateAdminDto);
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
