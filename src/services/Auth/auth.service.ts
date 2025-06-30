import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { RegisterDto } from 'src/dtos/Auth/register.dto';
import { UserService } from '../User/user.service';
import { UserDocument } from 'src/schemas/User/user.schema';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ token: string; user: { id: string; name: string; lastName: string; email: string } }> {
  const newUser: UserDocument = await this.userService.createUser(registerDto);

  const userId: string = newUser._id ? newUser._id.toString() : '';
  if (!userId) throw new Error('newUser._id no definido');

  const payload = { email: newUser.email, sub: userId };
  const token = this.jwtService.sign(payload);

  // Devolvemos el token y los datos del usuario necesarios para el frontend
  return {
    token,
    user: {
      id: userId,
      name: newUser.name,
      lastName: newUser.lastName,
      email: newUser.email,
    },
  };
}



  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const user: UserDocument | null = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario pendiente de aprobación');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = { sub: user.id, email: user.email };
const token = this.jwtService.sign(payload);



    const { password: _, ...userData } = user;

    return {
      token,
      user: {
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
      },
    };
  }
}
