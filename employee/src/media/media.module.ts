import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { FileExtensionValidationPipe } from './common/validators/file-extension.validator';
import { Media } from './entities/media.entity';
import { MediaRepository } from './repository/media.repository';

@Module({
  controllers: [MediaController],
  providers: [MediaService, FileExtensionValidationPipe, MediaRepository],
  imports: [TypeOrmModule.forFeature([Media])],
  exports: [MediaService, MediaRepository]
})
export class MediaModule {}
