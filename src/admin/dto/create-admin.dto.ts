import { IsEmail, IsString } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  name: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;
}
