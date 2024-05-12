import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, usersSchema } from './schemas/users.schema';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from 'src/auth/strategies/access-token.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Users.name, schema: usersSchema }]),
    JwtModule
  ],
  controllers: [UsersController],
  providers: [UsersService, AccessTokenStrategy],
  exports: [UsersService]
})
export class UsersModule {}
