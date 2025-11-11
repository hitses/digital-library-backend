import { Request } from 'express';
import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as net from 'net';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import {
  createErrorResponse,
  updateErrorResponse,
} from 'src/common/methods/errors';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReviewService {
  private readonly defaultReviewPage: number;
  private readonly defaultReviewLimit: number;

  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    private readonly configService: ConfigService,
  ) {
    this.defaultReviewPage = Number(
      this.configService.get('DEFAULT_REVIEW_PAGE'),
    );
    this.defaultReviewLimit = Number(
      this.configService.get('DEFAULT_REVIEW_LIMIT'),
    );
  }

  async create(
    createReviewDto: CreateReviewDto,
    req: Request,
  ): Promise<Review> {
    const ipAddress = this.extractIp(req);

    if (!ipAddress)
      throw new BadRequestException('Unable to determine client IP');
    if (!net.isIP(ipAddress))
      throw new BadRequestException('Invalid IP address');

    try {
      const newReview = await this.reviewModel.create({
        ...createReviewDto,
        bookId: new Types.ObjectId(createReviewDto.bookId),
        ipAddress,
      });

      return newReview;
    } catch (error) {
      return createErrorResponse('Review', error);
    }
  }

  async findAll(): Promise<Review[]> {
    return await this.reviewModel.find();
  }

  async findTotalCount(): Promise<number> {
    return await this.reviewModel.countDocuments();
  }

  async findPendings(): Promise<number> {
    return await this.reviewModel.countDocuments({ verified: false });
  }

  async findLatestsReviews(limit: number): Promise<Review[]> {
    const reviews = await this.reviewModel
      .find({ verified: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('bookId', 'title');

    if (!reviews.length) return [];

    return reviews;
  }

  async findAllByBookId(
    bookId: string,
    page: number,
  ): Promise<{
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    data: Review[];
  }> {
    const skip = (page - 1) * this.defaultReviewLimit;

    const [data, total] = await Promise.all([
      this.reviewModel
        .find({ bookId: new Types.ObjectId(bookId), verified: true })
        .skip(skip)
        .limit(this.defaultReviewLimit)
        .sort({ createdAt: -1 }),
      this.reviewModel.countDocuments({
        bookId: new Types.ObjectId(bookId),
        verified: true,
      }),
    ]);

    const totalPages = Math.ceil(total / this.defaultReviewLimit);

    return {
      total,
      totalPages,
      page: +page,
      limit: this.defaultReviewLimit,
      data,
    };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewModel.findById(id);

    if (!review) throw new NotFoundException('Review not found or deleted');

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    try {
      const updatedReview = await this.reviewModel.findOneAndUpdate(
        { _id: id },
        updateReviewDto,
        { new: true },
      );

      if (!updatedReview) throw new NotFoundException('Review not found');

      return updatedReview;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      return updateErrorResponse('Review', error);
    }
  }

  async remove(id: string): Promise<Review> {
    const deletedBook = await this.reviewModel.findOneAndDelete({ _id: id });

    if (!deletedBook)
      throw new NotFoundException('Book not found or already deleted');

    return deletedBook;
  }

  private extractIp(req: Request): string | null {
    // Cloudflare header
    const cf = req.header('cf-connecting-ip');
    if (cf && net.isIP(cf)) return cf;

    // x-forwarded-for may contain comma list; first is client
    const xff = req.header('x-forwarded-for');
    if (xff) {
      const first = xff.split(',')[0].trim();
      if (net.isIP(first)) return first;
    }

    // express req.ip (respects trust proxy setting)
    if (req.ip && net.isIP(req.ip)) return req.ip;

    // fallback to socket remote address
    const remote = (req.socket && req.socket.remoteAddress) || null;
    if (remote && net.isIP(remote)) return remote;

    return null;
  }
}
