import { IsInt, Min } from 'class-validator';

export class AttachPermissionToRoleDto {
  @IsInt()
  @Min(1)
  roleId: number;

  @IsInt()
  @Min(1)
  permissionId: number;
}
