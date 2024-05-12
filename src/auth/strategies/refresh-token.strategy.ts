// import { Injectable } from "@nestjs/common";
// import { PassportStrategy } from "@nestjs/passport";
// import { Request } from "express";
// import { ExtractJwt, Strategy } from "passport-jwt";

// @Injectable()
// export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
//     constructor() {
//         super({
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//             passReqToCallback: true,
//             secretOrKey: 'Intellect-Refresh-Token-Secret'
//         })
//     }

//     validate(payload: any, req: Request) {
//         const refreshToken = req.get('authorization').replace("Bearer", "").trim();
//         return {
//             ...payload,
//             refreshToken
//         };
//     }
// }