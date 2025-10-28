import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsISBN,
  MaxLength,
  MinLength,
} from 'class-validator';

function trim(value: any) {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateBookDto {
  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(1)
  @MaxLength(200, { message: 'Title too long (max 200 chars)' })
  title: string;

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty({ message: 'Author is required' })
  @MinLength(1)
  @MaxLength(150, { message: 'Author name too long (max 150 chars)' })
  author: string;

  @Transform(({ value }) => trim(value?.toLowerCase()))
  @IsNotEmpty({ message: 'ISBN is required' })
  @IsString()
  @IsISBN(undefined, { message: 'ISBN must be valid (10 or 13 digits)' })
  isbn: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Synopsis is required' })
  @IsString()
  @MinLength(10, { message: 'Synopsis too short (min 10 chars)' })
  @MaxLength(4000, { message: 'Synopsis too long (max 4000 chars)' })
  synopsis: string;

  @Transform(({ value }) => trim(value))
  @IsNotEmpty({ message: 'Cover URL is required' })
  @IsString()
  @MaxLength(1000, { message: 'Cover URL too long (max 1000 chars)' })
  coverUrl: string;
}
