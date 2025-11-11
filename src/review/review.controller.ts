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
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Review } from './entities/review.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('review')
export class ReviewController {
  private readonly defaultReviewPage: number;

  constructor(
    private readonly reviewService: ReviewService,
    private readonly configService: ConfigService,
  ) {
    this.defaultReviewPage = Number(
      this.configService.get('DEFAULT_REVIEW_PAGE'),
    );
  }

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

  @Get('count')
  @Auth()
  findTotalCount(): Promise<number> {
    return this.reviewService.findTotalCount();
  }

  @Get('pendings')
  @Auth()
  findPendings(): Promise<number> {
    return this.reviewService.findPendings();
  }

  @Get('book/:bookId')
  findAllByBookId(
    @Query('page') page = this.defaultReviewPage,
    @Param('bookId', MongoIdPipe) bookId: string,
  ): Promise<{
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    data: Review[];
  }> {
    return this.reviewService.findAllByBookId(bookId, page);
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
