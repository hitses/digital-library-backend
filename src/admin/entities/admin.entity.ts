import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Admin extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true })
  name: string;

  @Prop({ required: false, lowercase: true, trim: true })
  lastname: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    required: true,
    default: false,
  })
  delete: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
