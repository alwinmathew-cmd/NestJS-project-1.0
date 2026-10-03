import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// Dev fallback only; set JWT_SECRET in the environment for anything real (Nullish Coalescing)
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-secret-change-me';

@Module({
  imports: [
    UsersModule,
    // global: true => JwtService is available to the guards used in users/UsersController too
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: 60 * 60 }, // 1 hour, in seconds
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
