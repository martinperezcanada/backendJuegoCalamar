import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Team } from '../Team/team.schema';

@Schema()
export class Match {
  @Prop({ required: true })
  jornada: number;

  @Prop({ type: Date, required: true })
  fecha: Date;
  

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  team1: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  team2: Types.ObjectId;

  @Prop({ type: String, default: '' })
  resultado: string;
}

export type MatchDocument = Match & Document;
export const MatchSchema = SchemaFactory.createForClass(Match);
