import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  providers: [EventsGateway],
  imports: [JwtModule, ProjectsModule]
})
export class EventsModule {}
