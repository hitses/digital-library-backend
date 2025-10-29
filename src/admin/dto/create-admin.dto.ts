import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = (value: any) => (typeof value === 'string' ? value.trim() : value);

export class CreateAdminDto {
  @Transform(({ value }) => trim(value))
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Matches(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/, {
    message: 'Name can only contain letters, spaces, apostrophes, and hyphens',
  })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name too long (max 50 characters)' })
  name: string;

  @Transform(({ value }) => trim(value))
  @IsOptional()
  @IsString({ message: 'Lastname must be a string' })
  @Matches(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/, {
    message:
      'Lastname can only contain letters, spaces, apostrophes, and hyphens',
  })
  @MinLength(2, { message: 'Lastname must be at least 2 characters long' })
  @MaxLength(50, { message: 'Lastname too long (max 50 characters)' })
  lastname?: string;

  @Transform(({ value }) => trim(value?.toLowerCase()))
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(100, { message: 'Email too long (max 100 characters)' })
  email: string;
}
