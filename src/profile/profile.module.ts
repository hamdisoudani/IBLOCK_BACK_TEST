import { forwardRef, Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AccessTokenStrategy } from 'src/auth/strategies/access-token.strategy';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, usersSchema } from 'src/users/schemas/users.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([{ name: Users.name, schema: usersSchema }]),
    JwtModule
  ],
  controllers: [ProfileController],
  providers: [ProfileService, AccessTokenStrategy],
  exports: [ProfileService]
})
export class ProfileModule {}
