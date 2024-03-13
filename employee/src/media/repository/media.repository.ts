import { DataSource, In, Not } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { Media } from '../entities/media.entity';
import { MediaEntityTypeEnum } from '../common/ts/enums/entity-type.enum';
import { IMediaRepository } from './interface/media.repository.interface';

@Injectable()
export class MediaRepository
  extends RepositoryBase<Media>
  implements IMediaRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(Media));
  }

  async findOneIfExist(documentId: number): Promise<Media> {
    const mediaInfo: Media = await this.repository.findOne({
      where: { id: documentId }
    });
    if (!mediaInfo) {
      throw new ResourceNotFoundException('Document', documentId);
    }
    return mediaInfo;
  }

  async findAllUpdatedMediaId(documentIds: number[]): Promise<Media[]> {
    return await this.repository.find({
      where: {
        entityId: null,
        id: In(documentIds)
      }
    });
  }

  async deleteMediaByDocumentIds(documentIds: number[]) {
    return await this.repository.delete(documentIds);
  }

  async findAllDeletedMediaId(
    entityId: number,
    entityType: MediaEntityTypeEnum,
    documentIds?: number[]
  ): Promise<Media[]> {
    let result: Media[];
    if (documentIds?.length) {
      result = await this.repository.find({
        where: {
          entityId: entityId,
          entityType: entityType,
          id: Not(In(documentIds))
        }
      });
    } else {
      result = await this.repository.find({
        where: {
          entityId: entityId,
          entityType: entityType
        }
      });
    }
    return result;
  }
}
