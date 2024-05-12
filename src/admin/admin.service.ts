import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { School, schoolDocument } from '../school/schemas/school.schema';
import { Model } from 'mongoose';
import { AddSchoolDto } from '../school/dto/add_school.dto';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { customAlphabet } from 'nanoid';
import { CUSTOM_INVITATION_CODE_ALPHABET } from 'src/utils/constant/security.constant';

@Injectable()
export class AdminService {
    

    
    
}
