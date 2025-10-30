import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  create(createReviewDto: CreateReviewDto) {
    return createReviewDto;
  }

  findAll() {
    return `This action returns all review`;
  }

  findOne(id: string) {
    return `This action returns a #${id} review`;
  }

  update(id: string, updateReviewDto: UpdateReviewDto) {
    return updateReviewDto;
  }

  remove(id: string) {
    return `This action removes a #${id} review`;
  }
}
