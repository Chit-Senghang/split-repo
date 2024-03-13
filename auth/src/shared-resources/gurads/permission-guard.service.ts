import { ResourceForbiddenException } from '../exception/forbidden.exception';
import { SPECIAL_PERMISSION } from '../ts/enum/permission';

const validatePermission = (
  permissionCode: string,
  userPermissions: string[]
): boolean => {
  let allowForPermissions: string[] = [
    SPECIAL_PERMISSION.ALL_FUNCTION,
    permissionCode
  ];

  if (permissionCode.startsWith('READ_')) {
    allowForPermissions = [
      SPECIAL_PERMISSION.ALL_FUNCTION,
      SPECIAL_PERMISSION.READ_ALL_FUNCTION,
      permissionCode
    ];
  }

  const isIncludePermisison = allowForPermissions.some((allowForPermission) =>
    userPermissions.includes(allowForPermission)
  );

  if (isIncludePermisison) {
    return true;
  } else {
    throw new ResourceForbiddenException(
      `You don't have permission of ${permissionCode}`
    );
  }
};

export { validatePermission };
