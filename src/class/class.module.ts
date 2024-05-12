import { Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Class, classSchema } from './schemas/class.schema';
import { ProfileModule } from 'src/profile/profile.module';
import { SchoolModule } from 'src/school/school.module';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Class.name, schema: classSchema }]),
    ProfileModule,
    SchoolModule,
    ProjectsModule
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService]
})
export class ClassModule {}
