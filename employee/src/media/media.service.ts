import { join } from 'path';
import * as fsPromise from 'fs/promises';
import { Express } from 'express';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityTarget, Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { GrpcService } from '../grpc/grpc.service';
import { ResourceConflictException } from '../shared-resources/exception/conflict-resource.exception';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { MissionRequest } from '../leave/mission-request/entities/mission-request.entity';
import { LeaveRequest } from '../leave/leave-request/entities/leave-request.entity';
import { Media } from './entities/media.entity';
import { FileExtensionValidationPipe } from './common/validators/file-extension.validator';
import { FILE_PATH } from './common/ts/constants/file-path.constant';
import { CreateMediaDto } from './dto/create-media.dto';
import { IFile } from './common/ts/interfaces/file.interface';
import { PaginationMediaDto } from './dto/pagination-media.dto';
import { MediaEntityTypeEnum } from './common/ts/enums/entity-type.enum';

@Injectable()
export class MediaService {
  private readonly MEDIA = 'media';

  private readonly FILE_SIZE = 'limit-upload-media-size';

  private readonly filePath: string = 'public/images';

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly dataSource: DataSource,
    private readonly grpcService: GrpcService,
    private readonly validateFileService: FileExtensionValidationPipe
  ) {}

  createFilePath(filename: string, filePath = FILE_PATH): string {
    return join(__dirname, `../../../../../public/${filePath}/${filename}`);
  }

  createFileName(): string {
    const id = nanoid();
    return id;
  }

  createNewFileNameWithExtension(
    filename: string,
    originalName: string
  ): string {
    const filenameArray = originalName.split('.');
    const extension = filenameArray.pop();
    return `${filename + '.' + extension}`;
  }

  async validateFileSize(fileSize: number) {
    const globalConfiguration =
      await this.grpcService.getGlobalConfigurationByName({
        name: this.FILE_SIZE
      });

    let defaultSize = Number(globalConfiguration.value);
    defaultSize = defaultSize * 1048576;

    if (fileSize > defaultSize) {
      throw new ResourceConflictException(
        'file size',
        'file size reached the limit!'
      );
    }
    return fileSize;
  }

  async create(
    createMediaDto: CreateMediaDto,
    file: Express.Multer.File
  ): Promise<Media> {
    const imagePaths: string[] = [];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Remove previous company logo when user upload new logo.
    await this.deletePreviousCompanyLogo(createMediaDto.entityType);

    try {
      if (!file) {
        throw new ResourceNotFoundException(
          `Please add your attachment file(s)`
        );
      }
      await this.validateFileSize(file.size);

      await this.validateFileService.transform(file.originalname);
      const extension = file.originalname.split('.').pop();

      const fileName = this.createFileName();

      const image: IFile = {
        name: this.createNewFileNameWithExtension(fileName, file.originalname),
        buffer: file.buffer,
        size: file.size,
        originalName: file.originalname
      };

      if (createMediaDto.entityId) {
        await this.checkTypeOfEntity(
          Number(createMediaDto.entityId),
          createMediaDto.entityType
        );
      }

      const media = queryRunner.manager.create(Media, {
        entityId: createMediaDto.entityId
          ? Number(createMediaDto.entityId)
          : null,
        entityType: createMediaDto.entityType
          ? createMediaDto.entityType
          : null,
        name: fileName + '.' + extension,
        size: file.size,
        mimeType: file.mimetype,
        filename: file.originalname
      });

      const filePath = this.createFilePath(image.name);
      await fsPromise.writeFile(filePath, image.buffer, 'binary');
      imagePaths.push(filePath);

      const mediaResult = await this.mediaRepository.save(media);
      await queryRunner.commitTransaction();
      return mediaResult;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      for (const imagePath of imagePaths) {
        await fsPromise.unlink(imagePath);
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async download(name: string): Promise<string> {
    try {
      const media = await this.mediaRepository.findOne({
        where: {
          name
        }
      });

      const fileContent = await fsPromise.readFile(
        join(this.filePath, name),
        'base64'
      );

      return `data:${media.mimeType};base64${fileContent}`;
    } catch (error) {
      throw new ResourceNotFoundException('file', name);
    }
  }

  async findOne(id: number): Promise<Media> {
    const media = await this.checkMedia(id);
    return media;
  }

  async findAll(
    pagination: PaginationMediaDto
  ): Promise<PaginationResponse<Media>> {
    return GetPagination(this.mediaRepository, pagination, [], {
      where: {
        entityId: pagination.entityId ?? null,
        entityType: pagination.entityType ?? null
      }
    });
  }

  async findByEntityIdAndType(
    entityId: number,
    entityType: MediaEntityTypeEnum
  ): Promise<Media[]> {
    return await this.mediaRepository.find({
      where: {
        entityId,
        entityType
      }
    });
  }

  async checkMedia(id: number, isValidate = true): Promise<Media> {
    const media = await this.mediaRepository.findOneBy({ id });
    if (isValidate) {
      if (!media) {
        throw new ResourceNotFoundException(this.MEDIA, id);
      }
    }
    return media;
  }

  async deleteFile(id: number, isValidate = true): Promise<void> {
    const file = await this.checkMedia(id, isValidate);
    if (file) {
      await this.mediaRepository.delete(id);
      await fsPromise.unlink(this.createFilePath(file.name));
    }
  }

  async deleteMultipleFiles(documentIds: number[]) {
    return await Promise.all(
      documentIds.map(async (documentId) => {
        await this.deleteFile(documentId, false);
      })
    );
  }

  async update(id: number, file: Express.Multer.File) {
    const media = await this.checkMedia(id);
    await this.validateFileSize(file.size);
    await this.validateFileService.transform(file.originalname);
    const newName = this.createNewFileNameWithExtension(
      media.name,
      media.filename
    );
    await this.mediaRepository.delete(id);
    await fsPromise.unlink(this.createFilePath(newName));

    const fileName = this.createFileName();

    const image: IFile = {
      name: this.createNewFileNameWithExtension(fileName, file.originalname),
      buffer: file.buffer,
      size: file.size,
      originalName: file.originalname
    };

    const newMedia = this.mediaRepository.create({
      name: fileName,
      size: file.size,
      mimeType: file.mimetype,
      filename: file.originalname
    });

    const mediaResult = await this.mediaRepository.save(
      Object.assign(media, newMedia)
    );

    const filePath = this.createFilePath(image.name);
    await fsPromise.writeFile(filePath, image.buffer, 'binary');

    return mediaResult;
  }

  checkTypeOfEntity = async (entityId: number, type: MediaEntityTypeEnum) => {
    let data: any;
    switch (type) {
      case MediaEntityTypeEnum.MISSION_REQUEST: {
        data = await this.validateEntity(entityId, MissionRequest);
        break;
      }
      case MediaEntityTypeEnum.LEAVE_REQUEST: {
        data = await this.validateEntity(entityId, LeaveRequest);
      }
    }
    return data;
  };

  validateEntity = async (entityId: number, target: EntityTarget<any>) => {
    const data = await this.dataSource
      .getRepository(target)
      .findOne({ where: { id: entityId } });
    if (!data) {
      throw new ResourceNotFoundException(
        `Resource of entityId ${entityId} not found`
      );
    }
    return data;
  };

  // ======================= [Private block function] =======================

  private async deletePreviousCompanyLogo(
    entityType: MediaEntityTypeEnum
  ): Promise<void> {
    if (entityType === MediaEntityTypeEnum.COMPANY_LOGO) {
      const companyLogo: Media | null = await this.mediaRepository.findOne({
        where: {
          entityType: MediaEntityTypeEnum.COMPANY_LOGO
        }
      });

      if (companyLogo) {
        await this.deleteFile(companyLogo.id); //remove file
        await this.mediaRepository.delete(companyLogo.id);
      }
    }
  }
}
