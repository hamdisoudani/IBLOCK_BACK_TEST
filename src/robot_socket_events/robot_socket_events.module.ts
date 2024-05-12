import { Module } from '@nestjs/common';
import { RobotSocketEventsGateway } from './robot_socket_events.gateway';

@Module({
    providers: [RobotSocketEventsGateway]
})
export class RobotSocketEventsModule {}
