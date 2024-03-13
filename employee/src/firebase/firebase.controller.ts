import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FirebaseService } from './firebase.service';
import { SubscribeDto } from './dto/firebase-payload.dto';

@ApiTags('firebase')
@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Get()
  subscribeToTopic(@Query() payload: SubscribeDto) {
    return this.firebaseService.subscribeToTopic(payload);
  }
}
