import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { AdminModule } from './admin/admin.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './middleware/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { SchoolModule } from './school/school.module';
import { ClassModule } from './class/class.module';
import { ProjectsModule } from './projects/projects.module';
import { RequestCreateClassModule } from './request-create-class/request-create-class.module';
import { EventsModule } from './events/events.module';
import { RobotSocketEventsGateway } from './robot_socket_events/robot_socket_events.gateway';
import { RobotSocketEventsModule } from './robot_socket_events/robot_socket_events.module';
import { DeviceTypesModule } from './devices_and_blocks/device_types/device_types.module';
import { DeviceModule } from './devices_and_blocks/device/device.module';
import { BlocksModule } from './devices_and_blocks/blocks/blocks.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    MongooseModule.forRoot("mongodb+srv://hamdisoudani:kOoArD2nvEQYFQta@cluster0.xm0h2t5.mongodb.net/?retryWrites=true&w=majority", {
      dbName: 'iblock',
      user: 'hamdisoudani',
      pass: 'kOoArD2nvEQYFQta'
    }),
    AuthModule,
    UsersModule,
    ProfileModule,
    AdminModule,
    JwtModule,
    SchoolModule,
    ClassModule,
    ProjectsModule,
    BlocksModule,
    RequestCreateClassModule,
    EventsModule,
    RobotSocketEventsModule,
    DeviceTypesModule,
    DeviceModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ],
})
export class AppModule {}