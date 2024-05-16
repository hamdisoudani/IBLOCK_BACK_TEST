import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';


@WebSocketGateway({
  namespace: 'robot',
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})
export class RobotSocketEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() server: Server;

  async handleConnection(client: any) {
    client.join('robot'); // Join the project's room
    client.emit('user_joined', "new user joined");  // Notify everyone in the project
  }

  async handleDisconnect(client: any) {
    // remove user from the room
    client.leave('robot');
    client.emit('user_left', "user left the room"); 
  }
  
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): void {
    client.to('robot').emit('messageData', { message: 'Hello from the server' });
  } 

  @SubscribeMessage('robot')
  handleRobot(client: any, payload: any): void {
    client.broadcast.to('robot').emit('robotData', payload);
  }
}
