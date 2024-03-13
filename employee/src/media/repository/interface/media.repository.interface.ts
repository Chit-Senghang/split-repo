import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { MediaEntityTypeEnum } from '../../common/ts/enums/entity-type.enum';
import { Media } from '../../entities/media.entity';

export interface IMediaRepository extends IRepositoryBase<Media> {
  findAllDeletedMediaId(
    entityId: number,
    entityType: MediaEntityTypeEnum,
    documentIds?: number[]
  ): Promise<Media[]>;
  deleteMediaByDocumentIds(documentIds: number[]);
  findAllUpdatedMediaId(documentIds: number[]): Promise<Media[]>;
  findOneIfExist(documentId: number): Promise<Media>;
}
