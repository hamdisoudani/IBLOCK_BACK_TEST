import { forwardRef, Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SchoolModule } from 'src/school/school.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    SchoolModule,
    UsersModule,
    forwardRef(() => ProjectsModule)
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
