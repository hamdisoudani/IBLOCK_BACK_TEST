import { Test, TestingModule } from '@nestjs/testing';
import { RobotSocketEventsGateway } from './robot_socket_events.gateway';

describe('RobotSocketEventsGateway', () => {
  let gateway: RobotSocketEventsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RobotSocketEventsGateway],
    }).compile();

    gateway = module.get<RobotSocketEventsGateway>(RobotSocketEventsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
