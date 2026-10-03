import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { verifyPassword } from './password.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    const stored = this.usersService.findByEmail(email);

    // same message for "no such email" and "wrong password" so emails can't be probed
    if (!stored?.password || !verifyPassword(password, stored.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = this.usersService.findOne(stored.id); // public shape, no hash
    const accessToken = await this.jwtService.signAsync({ sub: user.id });
    return { accessToken, user };
  }
}
