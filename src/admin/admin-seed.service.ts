import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultAdmin();
  }

  private async seedDefaultAdmin(): Promise<void> {
    try {
      const adminCount = await this.adminModel.countDocuments();

      if (adminCount > 0) {
        this.logger.log('Admin already exists in database. Skipping seed.');

        return;
      }

      const defaultName = this.configService.get<string>('ADMIN_NAME');
      const defaultLastName = this.configService.get<string>('ADMIN_LASTNAME');
      const defaultEmail = this.configService.get<string>('ADMIN_EMAIL');
      const defaultPassword = this.configService.get<string>('ADMIN_PASSWORD');

      if (
        !defaultName ||
        !defaultLastName ||
        !defaultEmail ||
        !defaultPassword
      ) {
        this.logger.warn(
          'Any ADMIN info not found in environment variables. Skipping admin seed.',
        );

        return;
      }

      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      await this.adminModel.create({
        name: defaultName,
        lastname: defaultLastName,
        email: defaultEmail,
        password: hashedPassword,
        mustChangePassword: false,
      });

      this.logger.log(
        `Default admin created successfully with email: ${defaultEmail}`,
      );
    } catch (error) {
      this.logger.error('Error seeding default admin:', error);
    }
  }
}
