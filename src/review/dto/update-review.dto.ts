import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsBoolean } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsBoolean()
  verified?: boolean;
}
