import { type Request } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Review } from './entities/review.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 600000, limit: 2 } })
  create(
    @Body() createReviewDto: CreateReviewDto,
    @Req() req: Request,
  ): Promise<Review> {
    return this.reviewService.create(createReviewDto, req);
  }

  @Get()
  findAll(): Promise<Review[]> {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', MongoIdPipe) id: string): Promise<Review> {
    return this.reviewService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    return this.reviewService.update(id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id', MongoIdPipe) id: string): Promise<Review> {
    return this.reviewService.remove(id);
  }
}
