import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/dtos/User/createUser.dto';
import { User, UserDocument } from 'src/schemas/User/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { password, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      ...rest,
      password: hashedPassword,
    });

    return await newUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async approveUser(userId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true },
    );
  }

  async registrarLiga(userId: string, ligaId: string): Promise<User> {
    if (!ligaId) {
      throw new Error('ligaId es requerido');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error(`Usuario con id ${userId} no encontrado`);
    }

    const yaRegistrada = user.ligasRegistradas.some(
      (entry) => entry.liga === ligaId,
    );

    if (!yaRegistrada) {
      user.ligasRegistradas.push({
        liga: ligaId,
        equiposSeleccionados: [],
      });
      await user.save();
    }

    return user;
  }

  async registrarEquipoEnLiga(
    userId: string,
    ligaId: string,
    equipo: string,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error(`Usuario con id ${userId} no encontrado`);
    }

    const liga = user.ligasRegistradas.find((l) => l.liga === ligaId);
    if (!liga) {
      throw new Error(`La liga ${ligaId} no está registrada por el usuario`);
    }

    if (!liga.equiposSeleccionados.includes(equipo)) {
      liga.equiposSeleccionados.push(equipo);
      await user.save();
    }

    return user;
  }

  async countUsersByLiga(liga: string): Promise<number> {
  return this.userModel.countDocuments({
    'ligasRegistradas.liga': liga,
  });
}

async getEquiposSeleccionados(userId: string, ligaId: string): Promise<string[]> {
  const user = await this.userModel.findById(userId);
  if (!user) {
    throw new Error(`Usuario con id ${userId} no encontrado`);
  }

  const liga = user.ligasRegistradas.find((l) => l.liga === ligaId);
  if (!liga) {
    throw new Error(`La liga ${ligaId} no está registrada por el usuario`);
  }

  return liga.equiposSeleccionados;
}

async eliminarEquipoDeLiga(
  userId: string,
  ligaId: string,
  equipo: string,
): Promise<User> {
  const user = await this.userModel.findById(userId);
  if (!user) {
    throw new Error(`Usuario con id ${userId} no encontrado`);
  }

  const liga = user.ligasRegistradas.find((l) => l.liga === ligaId);
  if (!liga) {
    throw new Error(`La liga ${ligaId} no está registrada por el usuario`);
  }

  // Elimina el equipo si existe
  const index = liga.equiposSeleccionados.indexOf(equipo);
  if (index !== -1) {
    liga.equiposSeleccionados.splice(index, 1);
    await user.save();
  }

  return user;
}



}
