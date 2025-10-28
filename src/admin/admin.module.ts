import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminSeedService } from './admin-seed.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Admin, AdminSchema } from './entities/admin.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    MailModule,
  ],
  exports: [AdminService],
  controllers: [AdminController],
  providers: [AdminSeedService, AdminService],
})
export class AdminModule {}
