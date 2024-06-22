import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, usersSchema } from './schemas/users.schema';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from 'src/auth/strategies/access-token.strategy';
import { ProjectsModule } from 'src/projects/projects.module';
import { ProfileModule } from 'src/profile/profile.module';
import { SchoolModule } from 'src/school/school.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Users.name, schema: usersSchema }]),
    JwtModule,
    forwardRef(() => ProfileModule),
    ProjectsModule,
    SchoolModule
  ],
  controllers: [UsersController],
  providers: [UsersService, AccessTokenStrategy],
  exports: [UsersService]
})
export class UsersModule {}
