import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { AuthWsMiddleware } from 'src/middleware/ws.guard';
import { ProjectsService } from 'src/projects/projects.service';
import { accessTokenType } from 'src/utils/types/access_token.type';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly jwtService: JwtService, private readonly projectService: ProjectsService) {}
  connectedUsers: Map<string, accessTokenType[]> = new Map();
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
    
    const roomUsers = this.getConnectedUsersInProject(projectId);
    client.broadcast.to(`project-${projectId}`).emit('user_joined', user);  // Notify everyone in the project
  }

  async handleDisconnect(client: any) {
    const projectId = client.projectID as string; 
    const user = client.user as accessTokenType; // User is set in the middleware
    // Find which rooms the socket belonged to (likely just one)
    const rooms = Array.from(client.rooms);
    // Find the room and unsubscribe the user

    const roomUsers = this.getConnectedUsersInProject(projectId);
    client.broadcast.to(`project-${projectId}`).emit('user_left', user); 
  }

  getConnectedUsersInProject(projectId: string): accessTokenType[] {
      return this.connectedUsers.get(projectId) || [];
  }


  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): { "Hello": any } {
    console.log("client", client.user)
    return {"Hello": "data"};
  }

  @SubscribeMessage('cursor_updates')
  handleCursorChange(client: any, payload: any): Observable<WsResponse<any>> | any {
    const projectId = client.projectID as string;
    const data = {
      payload,
      user: client.user as accessTokenType
    }
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
}
