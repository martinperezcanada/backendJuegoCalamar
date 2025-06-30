import { BadRequestException, Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import {  CreateTeamMatchDto } from 'src/dtos/Team/createTeam.dto';
import { TeamService } from 'src/services/Team/team.service';

@Controller()
export class TeamController {
  constructor(private readonly teamService: TeamService) { }

  @Get('teams')
  getTeams() {
    return this.teamService.findAllTeams();
  }

  @Get('teams/jornada/:jornada')
  getByJornada(@Param('jornada') jornada: string) {
    return this.teamService.getMatchesByJornada(Number(jornada));
  }

  @Get('teams/jornada/:jornada/liga/:liga')
getTeamsByJornadaAndLiga(
  @Param('jornada') jornada: string,
  @Param('liga') liga: string,
) {
  return this.teamService.getMatchesByJornadaAndLiga(Number(jornada), liga.trim());
}



  @Get('team/jornadas/:teamId')
  getTeamMatches(@Param('teamId') teamId: string) {
    return this.teamService.getMatchesByTeam(teamId);
  }

  @Get('teamsSelected')
  getTeamsSelected() {
    return this.teamService.getTeamsSelectedCount();
  }

  @Post('teams/matches')
  insertMatches(@Body() matches: CreateTeamMatchDto[]) {
    return this.teamService.insertMatches(matches);
  }

  @Post('teams/matches/estructura')
  insertMatchesEstructura(@Body() matches: CreateTeamMatchDto[]) {
    return this.teamService.insertPartidosConEstructura(matches);
  }

  @Get('ligas-equipos')
getLigasConEquipos() {
  return this.teamService.getLigasConEquipos();
}


  @Post('insertEquipoConLogo')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async insertEquipoConLogo(
  @UploadedFile() file: Express.Multer.File,
  @Body() body: { name: string; liga: string[] }

) {
  if (!file || !body?.name || !body?.liga) {
    throw new BadRequestException('Faltan datos: logo, name o liga');
  }

  const teamData = {
  name: body.name,
  logo: `/uploads/${file.filename}`,
  ligas: Array.isArray(body.liga) ? body.liga : [body.liga],
};


  return this.teamService.insertEquipo(teamData);
}

@Get('teams/:teamId')
getTeamById(@Param('teamId') teamId: string) {
  return this.teamService.getTeamById(teamId);
}

@Post('teams/name/:teamName/increment')
incrementSelectedCountByName(@Param('teamName') teamName: string) {
  return this.teamService.incrementSelectedCountByName(teamName);
}

@Post('teams/name/:teamName/decrement')
decrementSelectedCountByName(@Param('teamName') teamName: string) {
  return this.teamService.decrementSelectedCountByName(teamName);
}


@Get('teams/by-name/:name')
async getTeamByName(@Param('name') name: string) {
  // Escapar caracteres especiales del nombre recibido para usar en regex
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Crear regex case-insensitive
  const regex = new RegExp(`^${escapedName}$`, 'i');

  return this.teamService.findByNameRegex(regex);
}

@Get('teams/jornadas/liga/:liga')
getJornadasByLiga(@Param('liga') liga: string) {
  return this.teamService.getJornadasByLiga(liga.trim());
}




}
