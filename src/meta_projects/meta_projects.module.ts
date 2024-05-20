import { Module } from '@nestjs/common';
import { MetaProjectsService } from './meta_projects.service';
import { MetaProjectsController } from './meta_projects.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MetaProject, MetaProjectSchema } from './schema/meta_project.schema';
import { ProfileModule } from 'src/profile/profile.module';
import { MetaProjectCodes, MetaProjectCodesSchema } from './schema/meta_project_codes.schema';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  controllers: [MetaProjectsController],
  providers: [MetaProjectsService],
  imports: [
    MongooseModule.forFeature([{ name: MetaProject.name, schema: MetaProjectSchema }]),
    MongooseModule.forFeature([{ name: MetaProjectCodes.name, schema: MetaProjectCodesSchema }]),
    ProfileModule,
    ProjectsModule
  ],
  exports: [MetaProjectsService]
})
export class MetaProjectsModule {}
