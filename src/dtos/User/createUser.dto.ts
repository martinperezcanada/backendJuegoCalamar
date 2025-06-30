import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  _id?: string;

  @IsString()
  name: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsArray()
  ligasRegistradas?: string[];
}
