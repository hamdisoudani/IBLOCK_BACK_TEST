import { JwtService } from '@nestjs/jwt';
import { BadRequestException, forwardRef, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { profile } from 'console';
import { Profile } from 'src/users/schemas/users.schema';
import { UsersService } from 'src/users/users.service';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { UserProfile } from 'src/utils/types/profile.type';
import { ACCESS_TOKEN_SECRET_PASS } from 'src/utils/constant/security.constant';
import { SwitchProfileDto } from './dto/switch_profile.dto';

@Injectable()
export class ProfileService {
    constructor(
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService, 
        private readonly jwtService: JwtService
    ) {}

    async getUserProfiles(userToken: accessTokenType): Promise<{'selectedProfile': Profile, 'availableProfiles': Profile[]}> {
        try {
            const user = await this.usersService.findUserByEmail(userToken.email);
            if(!user) throw new UnauthorizedException();

            const currentProfile = user.profiles.find(profile => (profile as UserProfile)._id == userToken.activeProfileId)
            const otherProfiles = user.profiles.filter(profile => (profile as UserProfile)._id != userToken.activeProfileId)
            return {
                'selectedProfile': currentProfile,
                'availableProfiles': otherProfiles
            }
        } catch (error) {
            throw new HttpException(`error : ${error}`, HttpStatus.FORBIDDEN);
        }
    }

    async switchProfile(userToken: accessTokenType, body: SwitchProfileDto): Promise<{'accessToken' : string}> {
        try {
            if(userToken.activeProfileId == body.profileId) throw new BadRequestException();


            const {availableProfiles} = await this.getUserProfiles(userToken);

            const isProfileAvailable = availableProfiles.find(profile => (profile as UserProfile)._id == body.profileId);
            
            if(!isProfileAvailable) throw new UnauthorizedException();

            userToken.activeProfileId = body.profileId;

            const newToken = this.jwtService.sign(userToken, {
                secret: ACCESS_TOKEN_SECRET_PASS
            });

            return {
                'accessToken': newToken
            };
        } catch (error) {
            if(error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException();
        }
    }

    
}
