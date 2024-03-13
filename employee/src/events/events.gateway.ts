import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationMessage } from './dto/notification-message.dto';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleDisconnect(client: any) {
    Logger.log(`${client.id} disconnected`);
  }

  handleConnection(client: Socket) {
    Logger.log(`${client.id} connected successfully`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: any): void {
    const { roomId } = JSON.parse(room);
    client.join(roomId);
    this.sendingNotification(`${client.id} has joined`, roomId);
  }

  sendingNotification(
    @MessageBody() payload: NotificationMessage | any,
    roomId: string
  ): void {
    this.server.to(roomId).emit('notification', payload);
  }
}
