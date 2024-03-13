import { FindOptionsSelect } from 'typeorm';
import { CodeValue } from '../../key-value/entity';

export const CODE_VALUE_SELECTED_FIELDS = {
  id: true,
  value: true
} as FindOptionsSelect<CodeValue>;
