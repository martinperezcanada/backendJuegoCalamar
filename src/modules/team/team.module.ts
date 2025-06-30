// src/team/team.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamController } from 'src/controllers/Team/teams.controller';
import { Match, MatchSchema } from 'src/schemas/Team/match.schema';
import { Team, TeamSchema } from 'src/schemas/Team/team.schema';
import { TeamService } from 'src/services/Team/team.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
