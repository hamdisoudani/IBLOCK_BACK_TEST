import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";
import { ProjectsService } from "src/projects/projects.service";
import { ACCESS_TOKEN_SECRET_PASS } from "src/utils/constant/security.constant";
import { accessTokenType } from "src/utils/types/access_token.type";

type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

export const AuthWsMiddleware = (
  jwtService: JwtService,
  projectService: ProjectsService
): SocketMiddleware => {
  return async (socket: Socket, next) => {
    
    try {
      const token = socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new Error('Authorization token is missing');
      }

      let payload: accessTokenType | null = null;

      try {
        payload = await jwtService.verifyAsync(token, {
            secret: ACCESS_TOKEN_SECRET_PASS
          });
      } catch (error) {
        throw new Error('Authorization token is invalid');
      }

      if (!payload) {
        throw new Error('User does not exist');
      }
      
      // CCheck if the user_id is available in the request
      const projectId: string = socket.handshake.query.projectId as string;
      if (!projectId) {
        throw new Error('Project ID is missing');
      }
      
      const isUserHassAccessToProject = await projectService.checkUserPermissionToAccessProject(projectId, payload);
      if(!isUserHassAccessToProject) throw new Error('User does not have access to this project');

      socket = Object.assign(socket, {
        user: payload!,
        projectID: projectId
      });
      next();
    } catch (error) {
        next(new Error('Unauthorized'));
    }
  };
};