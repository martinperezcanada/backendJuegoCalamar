import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema()
export class Team {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  logo: string;

  @Prop({ default: 0 })
  selectedCount: number;

  @Prop({ type: [String], default: [] })
  ligas: string[];

}

export const TeamSchema = SchemaFactory.createForClass(Team);
