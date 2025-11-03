import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Book extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true })
  title: string;

  @Prop({ required: true, lowercase: true, trim: true })
  author: string;

  @Prop({ required: false, lowercase: true, trim: true, unique: true })
  isbn: string;

  @Prop({ required: false })
  synopsis: string;

  @Prop({ required: false })
  coverUrl: string;

  @Prop({ required: true, default: false })
  featured: boolean;

  @Prop({ required: false })
  featuredAt?: Date;

  @Prop({ default: false })
  delete: boolean;

  // Virtual properties
  reviews?: any[];
  averageRating?: number;
  totalReviews?: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);

BookSchema.index({ featured: 1, featuredAt: 1 });
BookSchema.index({ createdAt: -1 });
BookSchema.index({ delete: 1 });

BookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'bookId',
});
