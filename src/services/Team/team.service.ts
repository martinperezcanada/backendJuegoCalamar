import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTeamMatchDto } from 'src/dtos/Team/createTeam.dto';
import { Match, MatchDocument } from 'src/schemas/Team/match.schema';
import { Team, TeamDocument } from 'src/schemas/Team/team.schema';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
  ) {}

  async findAllTeams() {
    return this.teamModel.find();
  }

  async getMatchesByJornada(jornada: number) {
    return this.matchModel.find({ jornada }).populate('team1 team2');
  }

  async getMatchesByJornadaAndLiga(jornada: number, liga: string) {
  // Buscar partidos de la jornada con teams poblados
  const matches = await this.matchModel
    .find({ jornada })
    .populate({
      path: 'team1 team2',
      match: { ligas: liga },  // filtra solo equipos que pertenecen a esa liga
      select: 'name logo ligas',
    })
    .lean();

  // Filtrar partidos donde ambos equipos existen y pertenecen a la liga
  const filteredMatches = matches.filter(
    match => match.team1 !== null && match.team2 !== null
  );

  return filteredMatches;
}


  async getMatchesByTeam(teamId: string) {
    return this.matchModel
      .find({
        $or: [{ team1: teamId }, { team2: teamId }],
      })
      .populate('team1 team2');
  }

  async getTeamsSelectedCount() {
    return this.teamModel.find({}, { name: 1, selectedCount: 1 });
  }

  async insertMatches(matches: CreateTeamMatchDto[]) {
    try {
      const created = await this.matchModel.insertMany(matches);
      return { success: true, inserted: created.length };
    } catch (error) {
      throw new Error(`Error inserting matches: ${error.message}`);
    }
  }

  async insertEquipo(equipo: { name: string; logo: string; ligas: string[] }) {

    try {
      const created = await this.teamModel.create(equipo);
      return { message: 'Equipo insertado correctamente', data: created };
    } catch (error) {
      throw new Error('Error insertando equipo: ' + error.message);
    }
  }
  

  async createTeam(equipo: CreateTeamMatchDto): Promise<Team> {
    try {
      const created = new this.teamModel(equipo);
      return await created.save();
    } catch (error) {
      throw new Error('Error creando equipo: ' + error.message);
    }
  }

  async getLigasConEquipos(): Promise<any[]> {
  const equipos = await this.teamModel.find().select('name logo ligas');

  const ligasMap: Record<string, any[]> = {};

  equipos.forEach((equipo) => {
    equipo.ligas.forEach((liga: string) => {
      if (!ligasMap[liga]) {
        ligasMap[liga] = [];
      }
      ligasMap[liga].push({
        name: equipo.name,
        logo: equipo.logo,
      });
    });
  });

  return Object.entries(ligasMap).map(([liga, equipos]) => ({
    liga,
    equipos,
  }));
}




  async insertPartidosConEstructura(matches: CreateTeamMatchDto[]) {
    try {
      const transformedMatches = await Promise.all(
        matches.map(async (match) => {
          // Buscar o crear equipo local
          let team1 = await this.teamModel.findOne({ name: match.equipoLocal.name });
          if (!team1) {
            team1 = await this.teamModel.create({
              name: match.equipoLocal.name,
              logo: match.equipoLocal.logo || '',
              selectedCount: match.equipoLocal.selectedCount || 0,
              liga: match.equipoLocal.ligas || '',
            });
          }
  
          // Buscar o crear equipo visitante
          let team2 = await this.teamModel.findOne({ name: match.equipoVisitante.name });
          if (!team2) {
            team2 = await this.teamModel.create({
              name: match.equipoVisitante.name,
              logo: match.equipoVisitante.logo || '',
              selectedCount: match.equipoVisitante.selectedCount || 0,
              liga: match.equipoVisitante.ligas || '',
            });
          }
  
          // ⚠️ Validar si alguno de los equipos ya juega en esa jornada
          const existingMatch = await this.matchModel.findOne({
            jornada: match.jornada,
            $or: [
              { team1: team1._id },
              { team2: team1._id },
              { team1: team2._id },
              { team2: team2._id },
            ],
          });
  
          if (existingMatch) {
            throw new Error(
              `El equipo ${team1.name} o ${team2.name} ya tiene un partido en la jornada ${match.jornada}`
            );
          }
  
          return {
            jornada: match.jornada,
            fecha: match.fecha,
            team1: team1._id,
            team2: team2._id,
            resultado: match.resultado,
          };
        })
      );
  
      const created = await this.matchModel.insertMany(transformedMatches);
      return { message: 'Partidos insertados correctamente', inserted: created.length };
    } catch (error) {
      throw new Error(`Error insertando partidos: ${error.message}`);
    }
  }

  async getTeamById(teamId: string) {
  const team = await this.teamModel.findById(teamId);
  if (!team) {
    throw new Error(`No se encontró un equipo con ID: ${teamId}`);
  }
  return team;
}


async incrementSelectedCountByName(teamName: string) {
  const updated = await this.teamModel.findOneAndUpdate(
    { name: teamName },
    { $inc: { selectedCount: 1 } },
    { new: true }
  );

  if (!updated) {
    throw new Error(`No se pudo actualizar el equipo con nombre: ${teamName}`);
  }

  return {
    message: 'selectedCount incrementado correctamente',
    equipo: updated,
  };
}

async decrementSelectedCountByName(teamName: string) {
  const updated = await this.teamModel.findOneAndUpdate(
    { name: teamName },
    { $inc: { selectedCount: -1 } },
    { new: true }
  );

  if (!updated) {
    throw new Error(`No se pudo actualizar el equipo con nombre: ${teamName}`);
  }

  return {
    message: 'selectedCount decrementado correctamente',
    equipo: updated,
  };
}


async findByNameRegex(nameRegex: RegExp) {
  const equipo = await this.teamModel.findOne({ name: { $regex: nameRegex } });

  if (!equipo) {
    throw new NotFoundException(`No se encontró el equipo con nombre similar a: ${nameRegex}`);
  }

  return equipo;
}

async getJornadasDisponiblesByLiga(liga: string): Promise<number[]> {
  const matches = await this.matchModel
    .find()
    .populate({
      path: 'team1 team2',
      select: 'ligas',
    })
    .lean();

  const filteredMatches = matches.filter(match => {
    const team1 = match.team1 as any;
    const team2 = match.team2 as any;

    // Comprobar que ambos equipos existen y pertenecen a la liga
    const ambosEnLiga =
      team1 &&
      team2 &&
      team1.ligas?.includes(liga) &&
      team2.ligas?.includes(liga);

    return ambosEnLiga;
  });

  const jornadasSet = new Set<number>();
  filteredMatches.forEach(match => {
    if (match.jornada != null) {
      jornadasSet.add(match.jornada);
    }
  });

  return Array.from(jornadasSet).sort((a, b) => a - b);
}

async getJornadasByLiga(liga: string): Promise<number[]> {
  const matches = await this.matchModel
    .find({})
    .populate('team1 team2')
    .lean();

  // Filtrar partidos donde ambos equipos tienen exactamente esa liga en su array
  const filteredMatches = matches.filter((match) => {
    const team1: any = match.team1;
    const team2: any = match.team2;

    return (
      Array.isArray(team1?.ligas) &&
      Array.isArray(team2?.ligas) &&
      team1.ligas.includes(liga) &&
      team2.ligas.includes(liga)
    );
  });

  const jornadasUnicas = [...new Set(filteredMatches.map((m) => m.jornada))];
  return jornadasUnicas.sort((a, b) => a - b);
}

  
}
