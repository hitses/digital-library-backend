import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';
import { Admin } from './entities/admin.entity';
import { CurrentAdmin } from 'src/auth/decorators/current-admin.decorator';

@Controller('admin')
@Auth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto): Promise<Admin> {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  findAll(): Promise<Admin[]> {
    return this.adminService.findAll();
  }

  @Get('me')
  getCurrentAdmin(@CurrentAdmin() admin: Admin): Admin {
    return admin;
  }

  @Get(':id')
  findOne(@Param('id', MongoIdPipe) id: string) {
    return this.adminService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminService.update(id, updateAdminDto);
  }

  @Delete(':id')
  remove(
    @CurrentAdmin() currentAdmin: Admin,
    @Param('id', MongoIdPipe) id: string,
  ) {
    return this.adminService.remove(currentAdmin, id);
  }
}
