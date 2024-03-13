import { ResourceNotFoundException } from '../exception';
import { ResourceConflictException } from '../exception/conflict-resource.exception';
import { ResourceForbiddenException } from '../exception/forbidden.exception';

export const checkDefaultPosition = (
  positions: Partial<{
    isDefaultPosition: boolean;
    employeePositionId: number;
  }>[]
) => {
  const duplicateDefaultPosition: boolean[] = [];

  positions.forEach((position) => {
    if (position.isDefaultPosition === true) {
      duplicateDefaultPosition.push(position.isDefaultPosition);
    }
    if (duplicateDefaultPosition.length >= 2) {
      throw new ResourceForbiddenException(
        'isDefaultPosition',
        'Duplicate default position'
      );
    }
  });

  const duplicationPosition = positions.map(
    (position) => position.employeePositionId
  );

  const uniqueEmployeePositionId = new Set(duplicationPosition);
  const filteredEmployeePosition = duplicationPosition.filter(
    (employeePosition): any => {
      if (uniqueEmployeePositionId.has(employeePosition)) {
        uniqueEmployeePositionId.delete(employeePosition);
      } else {
        return employeePosition;
      }
    }
  );
  if (filteredEmployeePosition.length) {
    throw new ResourceConflictException('isDeftaultPosition');
  }

  const defaultPosition = positions.find((data) => data.isDefaultPosition);

  if (!defaultPosition) {
    throw new ResourceNotFoundException(
      'isDeftaultPosition',
      'default position is required'
    );
  }
};
