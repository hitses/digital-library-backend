import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Book } from 'src/book/entities/book.entity';

@Schema({ timestamps: true })
export class Review extends Document {
  declare _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Book',
    required: true,
  })
  book: Book;

  @Prop({ required: true, lowercase: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  review: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: false })
  delete: boolean;

  @Prop({ required: false })
  ipAddress: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
