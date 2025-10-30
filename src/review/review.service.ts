import { Request } from 'express';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as net from 'net';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) {}

  async create(
    createReviewDto: CreateReviewDto,
    req: Request,
  ): Promise<Review> {
    const ipAddress = this.extractIp(req);

    if (!ipAddress)
      throw new BadRequestException('Unable to determine client IP');
    if (!net.isIP(ipAddress))
      throw new BadRequestException('Invalid IP address');

    const newReview = await this.reviewModel.create({
      ...createReviewDto,
      ipAddress,
    });

    return newReview;
  }

  findAll(): Promise<Review[]> {
    return this.reviewModel.find();
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
