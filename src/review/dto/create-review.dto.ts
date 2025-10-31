import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { trim } from 'src/common/methods/trim';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'Book ID is required' })
  @IsMongoId({ message: 'Invalid book ID format' })
  bookId: string;

  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => trim(value))
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  name: string;

  @Transform(({ value }) => trim(value))
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Transform(({ value }) => trim(value))
  @IsNotEmpty({ message: 'Review is required' })
  @IsString({ message: 'Review must be a string' })
  @Length(10, 1000, {
    message: 'Review must be between 10 and 1000 characters',
  })
  review: string;

  @IsNotEmpty({ message: 'Rating is required' })
  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(1, { message: 'Minimum rating is 1' })
  @Max(5, { message: 'Maximum rating is 5' })
  rating: number;
}
