import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SchoolModule } from 'src/school/school.module';

@Module({
  imports: [
    SchoolModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
