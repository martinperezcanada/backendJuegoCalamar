import { IsNotEmpty, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TeamInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  logo: string;

  @IsString()
  @IsNotEmpty()
  ligas: string;

  @IsNumber()
  selectedCount: number;
}

export class CreateTeamMatchDto {
  @IsNumber()
  jornada: number;

  @IsString()
  fecha: string;
  

  @ValidateNested()
  @Type(() => TeamInfoDto)
  equipoLocal: TeamInfoDto;

  @ValidateNested()
  @Type(() => TeamInfoDto)
  equipoVisitante: TeamInfoDto;

  @IsString()
  resultado: string;
}
