import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/dtos/User/createUser.dto';
import { AuthService } from 'src/services/Auth/auth.service';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }
}
