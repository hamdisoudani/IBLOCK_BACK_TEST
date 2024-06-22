import { forwardRef, Module } from '@nestjs/common';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { School, schoolSchema } from './schemas/school.schema';
import { UsersModule } from 'src/users/users.module';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: School.name, schema: schoolSchema }]),
    forwardRef(() => UsersModule),
    forwardRef(() => ProjectsModule)
  ],
  controllers: [SchoolController],
  providers: [SchoolService],
  exports: [SchoolService]
})
export class SchoolModule {}
