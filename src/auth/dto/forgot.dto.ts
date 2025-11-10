import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ForgotDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;
}
