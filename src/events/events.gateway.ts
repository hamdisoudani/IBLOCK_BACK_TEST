import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { AuthWsMiddleware } from 'src/middleware/ws.guard';
import { ProjectsService } from 'src/projects/projects.service';
import { accessTokenType } from 'src/utils/types/access_token.type';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly jwtService: JwtService, private readonly projectService: ProjectsService) {}
  connectedUsers: Map<string, Set<accessTokenType>> = new Map();
  @WebSocketServer() server: Server;
  
  async afterInit(@ConnectedSocket() socket: Socket) {
    socket.use(
      AuthWsMiddleware(
        this.jwtService,
        this.projectService
      ) as any
    );
  }



  async handleConnection(client: any) {
    const projectId = client.projectID as string; 
    const user = client.user as accessTokenType; // User is set in the middleware
    client.join(`project-${projectId}`); // Join the project's room
    
    if(!this.connectedUsers.has(projectId)) {
      this.connectedUsers.set(projectId, new Set());
    }
    this.connectedUsers.get(projectId).add(user); // Add the user to the project's connected users
    const connectedUsers = Array.from(this.connectedUsers.get(projectId) || []);
    client.broadcast.to(`project-${projectId}`).emit('user_joined', {
      user,
      connectedUsers: connectedUsers
    
    });  // Notify everyone in the project
  }

  async handleDisconnect(client: any) {
    const projectId = client.projectID as string; 
    const user = client.user as accessTokenType; // User is set in the middleware
    if (this.connectedUsers.has(projectId)) {
      this.connectedUsers.get(projectId).delete(user);
    }
  
    const updatedUsers = Array.from(this.connectedUsers.get(projectId) || []);
    client.broadcast.to(`project-${projectId}`).emit('user_left', {
      user,
      connectedUsers: updatedUsers
    
    }); 
  }

  getConnectedUsersInProject(projectId: string) {
      return this.connectedUsers.get(projectId) || [];
  }

  @SubscribeMessage('get_connected_users')
  handleGetConnectedUsers(client: any, payload: any): Observable<WsResponse<any>> | any {
    const projectId = client.projectID as string;
    const data = {
      payload,
      user: client.user as accessTokenType
    }
    const updatedUsers = Array.from(this.connectedUsers.get(projectId) || []);
    client.emit('connected_users', {connectedUsers: updatedUsers});
  }

  @SubscribeMessage('cursor_updates')
  handleCursorChange(client: any, payload: any): Observable<WsResponse<any>> | any {
    const projectId = client.projectID as string;
    const data = {
      payload,
      user: client.user as accessTokenType
    }
    console.log("payload", payload)
    return client.broadcast.to(`project-${projectId}`).emit('cursor_changes', data);
  }
  

  @SubscribeMessage('block_created')
  handleBlockCreated(client: any, payload: any): Observable<WsResponse<any>> | any {
    const projectId = client.projectID as string;
    const data = {
      payload,
      user: client.user as accessTokenType
    }
    console.log("payload", payload)
    return client.broadcast.to(`project-${projectId}`).emit('newBlockByUser', data);
  }

  @SubscribeMessage('block_moved')
  handleBlockMoved(client: any, payload: any): Observable<WsResponse<any>> | any {
    const projectId = client.projectID as string;
    const data = {
      payload,
      user: client.user as accessTokenType
    }
    return client.broadcast.to(`project-${projectId}`).emit('blockMovedByUser', data);
  }

  @SubscribeMessage('block_connected_to_new_parent')
  handleConnectToNewParent(client: any, payload: any): Observable<WsResponse<any>> | any {
    const projectId = client.projectID as string;
    const data = {
      payload,
      user: client.user as accessTokenType
    }
    return client.broadcast.to(`project-${projectId}`).emit('blockConnectedToNewParent', data);
  }

  @SubscribeMessage('block_deleted')
  handleDeletedBlock(client: any, payload: any): Observable<WsResponse<any>> | any {
    const projectId = client.projectID as string;
    const data = {
      payload,
      user: client.user as accessTokenType
    }
    return client.broadcast.to(`project-${projectId}`).emit('blockDeletedByUser', data);
  }

  @SubscribeMessage('block_disconnected_from_old_parent')
  handleDisconnectFromOldParent(client: any, payload: any): Observable<WsResponse<any>> | any {
    const projectId = client.projectID as string;
    const data = {
      payload,
      user: client.user as accessTokenType
    }
    return client.broadcast.to(`project-${projectId}`).emit('blockDisconnectedFromOldParent', data);
  }

  @SubscribeMessage('block_clicked')
  handleBlockClickEvent(client: any, payload: any): Observable<WsResponse<any>> | any {
    const projectId = client.projectID as string;
    const data = {
      payload,
      user: client.user as accessTokenType
    }
    return client.broadcast.to(`project-${projectId}`).emit('blockClickedByUser', data);
  }

  // This event is triggered when a user is not selected any block
  @SubscribeMessage('free_selected_block')
  handleFreeUserPreviousSelectedBlocks(client: any, payload: any): Observable<WsResponse<any>> | any {
    const projectId = client.projectID as string;
    const data = {
      payload,
      user: client.user as accessTokenType
    }
    return client.broadcast.to(`project-${projectId}`).emit('freeBlock', data);
  }

  @SubscribeMessage('workSpaceCopyData')
  async handleWorkspaceUpdates(client: any, payload: any) {
    try {
      const projectId = client.projectID as string;
      const payloadData = {
        workCopy: payload,
        projectId
      };
      const user = client.user as accessTokenType;
      const {message} = await this.projectService.storeCopyOfTheCurrentUserWork(payloadData, user);
      console.log("message", payload)
    } catch (error) {
      console.log("error", error)
    }
    //return client.broadcast.to(`project-${projectId}`).emit('newWorkSpaceXmlData', data);
  }
}
