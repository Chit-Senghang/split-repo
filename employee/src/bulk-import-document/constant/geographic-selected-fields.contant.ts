import { FindOptionsSelect } from 'typeorm';
import { Geographic } from '../../geographic/entities/geographic.entity';

export const GEOGRAPHIC_SELECTED_FIELDS = {
  id: true,
  nameEn: true,
  nameKh: true,
  parentId: { nameEn: true, nameKh: true }
} as FindOptionsSelect<Geographic>;
