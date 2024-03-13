import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditBaseEntity } from '../../shared-resources/entity/audit-base.entity';
import { TypeEnum } from '../common/ts/enum/type.enum';
import { PositionLevel } from '../../position-level/entities/position-level.entity';
import { CompanyStructure } from '../../company-structure/entities/company-structure.entity';
import { RequestApprovalWorkflow } from './request-approval-workflow.entity';

@Entity()
export class RequestApprovalWorkflowLevel extends AuditBaseEntity {
  @ManyToOne(
    () => RequestApprovalWorkflow,
    (requestApprovalWorkflow) => requestApprovalWorkflow.requestWorkflowLevel
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_request_approval_workflow_level_id_request_approval_workflow_id',
    name: 'request_approval_workflow_id'
  })
  requestApprovalWorkflow: RequestApprovalWorkflow;

  @ManyToOne(() => PositionLevel, (positionLevel) => positionLevel.id, {
    eager: true
  })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_position_level_id_position_level_id',
    name: 'position_level_id'
  })
  positionLevel: PositionLevel;

  @Column(Object.values(TypeEnum))
  type: TypeEnum;

  @ManyToOne(
    () => CompanyStructure,
    (companyStructure) => companyStructure.id,
    { eager: true }
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_company_structure_department_id_company_structure_department_id'
  })
  companyStructureDepartment: CompanyStructure;

  @ManyToOne(
    () => CompanyStructure,
    (companyStructure) => companyStructure.id,
    { eager: true }
  )
  @JoinColumn({
    foreignKeyConstraintName:
      'fk_company_structure_team_id_company_structure_team_id',
    name: 'company_structure_team_id'
  })
  companyStructureTeam: CompanyStructure;
}
