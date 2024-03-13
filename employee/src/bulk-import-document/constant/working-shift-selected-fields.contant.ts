import { FindOptionsSelect } from 'typeorm';
import { WorkingShift } from '../../workshift-type/entities/working-shift.entity';

export const WORKING_SHIFT_SELECTED_FIELDS = {
  id: true,
  name: true,
  startWorkingTime: true,
  breakTime: true,
  scanType: true,
  workingHour: true,
  workOnWeekend: true,
  endWorkingTime: true,
  workshiftType: {
    name: true
  }
} as FindOptionsSelect<WorkingShift>;
