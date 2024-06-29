import { Module } from '@nestjs/common';
import { SchoolAdminService } from './school_admin.service';
import { SchoolAdminController } from './school_admin.controller';
import { UsersModule } from 'src/users/users.module';
import { SchoolModule } from 'src/school/school.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { MetaProjectsModule } from 'src/meta_projects/meta_projects.module';

@Module({
  controllers: [SchoolAdminController],
  providers: [SchoolAdminService],
  imports: [
    UsersModule,
    SchoolModule,
    ProjectsModule,
    MetaProjectsModule
  ]
})
export class SchoolAdminModule {}
