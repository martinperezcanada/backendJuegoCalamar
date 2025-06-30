import { Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { UserService } from 'src/services/User/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch('approve/:id')
  approveUser(@Param('id') id: string) {
    return this.userService.approveUser(id);
  }

  @Patch(':userId/ligas/:ligaId')
  registrarLiga(
    @Param('userId') userId: string,
    @Param('ligaId') ligaId: string,
  ) {
    return this.userService.registrarLiga(userId, ligaId);
  }

  @Patch(':userId/ligas/:ligaId/equipos/:equipo')
  registrarEquipoSeleccionado(
    @Param('userId') userId: string,
    @Param('ligaId') ligaId: string,
    @Param('equipo') equipo: string,
  ) {
    return this.userService.registrarEquipoEnLiga(userId, ligaId, equipo);
  }

  @Get('count/by-liga/:liga')
async countUsersByLiga(@Param('liga') liga: string) {
  return this.userService.countUsersByLiga(liga);
}

@Get(':userId/:ligaId/equiposSeleccionados')
getEquiposSeleccionados(
  @Param('userId') userId: string,
  @Param('ligaId') ligaId: string,
) {
  return this.userService.getEquiposSeleccionados(userId, ligaId);
}

@Delete(':userId/ligas/:ligaId/equipos/:equipo')
async eliminarEquipoSeleccionado(
  @Param('userId') userId: string,
  @Param('ligaId') ligaId: string,
  @Param('equipo') equipo: string,
) {
  return this.userService.eliminarEquipoDeLiga(userId, ligaId, equipo);
}


}
