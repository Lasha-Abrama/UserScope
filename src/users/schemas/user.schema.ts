import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, lowercase: true, trim: true, unique: true })
  email: string;

  @Prop({ required: true, min: 18, max: 100 })
  age: number;

  @Prop({ required: true, enum: ['m', 'f'] })
  gender: string;

  @Prop({ trim: true })
  phoneNumber?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  country?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ age: 1 });
