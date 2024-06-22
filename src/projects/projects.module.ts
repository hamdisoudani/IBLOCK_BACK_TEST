import { Module, forwardRef } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import { ProfileModule } from 'src/profile/profile.module';
import { ClassModule } from 'src/class/class.module';
import { ProjectWorkHistory, ProjectWorkHistorySchema } from './schemas/work_history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }, { name: ProjectWorkHistory.name, schema: ProjectWorkHistorySchema }]),
    ProfileModule,
    // forwardRef(() => ClassModule)
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService]
})
export class ProjectsModule {}
