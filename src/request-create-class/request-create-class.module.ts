import { Module } from '@nestjs/common';
import { RequestCreateClassService } from './request-create-class.service';
import { RequestCreateClassController } from './request-create-class.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { requestCreateClassSchema } from './schema/request-create-class.schema';
import { ProfileModule } from 'src/profile/profile.module';
import { ClassModule } from 'src/class/class.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'RequestCreateClass', schema: requestCreateClassSchema }]), ProfileModule, ClassModule],
  controllers: [RequestCreateClassController],
  providers: [RequestCreateClassService],
})
export class RequestCreateClassModule {}
