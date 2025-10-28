import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
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

  @Prop({ default: false })
  delete: boolean;
}

export const BookSchema = SchemaFactory.createForClass(Book);
