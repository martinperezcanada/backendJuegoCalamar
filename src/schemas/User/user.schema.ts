import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class LigaRegistrada {
  @Prop({ required: true })
  liga: string;

  @Prop({ type: [String], default: [] })
  equiposSeleccionados: string[];
}

const LigaRegistradaSchema = SchemaFactory.createForClass(LigaRegistrada);

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ type: [LigaRegistradaSchema], default: [] })
  ligasRegistradas: LigaRegistrada[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
