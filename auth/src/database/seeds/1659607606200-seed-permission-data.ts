import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedPermissionData1659607606200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
   INSERT INTO public."permission" (id, "version", "name", mpath, parent_id, updated_by, created_by, created_at, updated_at, deleted_at) 
VALUES(78, 2, 'SPECIAL_MODULE', '78.', NULL, NULL, NULL, NOW(), NOW(), NULL),
(79, 2, 'ALL_FUNCTION', '78.79.', 78, NULL, NULL, NOW(), 'NOW()', NULL),
(80, 2, 'READ_ALL_FUNCTION', '78.80.', 78, NULL, NULL, 'NOW()', 'NOW()', NULL),
(81, 2, 'AUTHENTICATION_MODULE', '81.', NULL, NULL, NULL, 'NOW()', 'NOW()', NULL),
(82, 2, 'PERMISSION', '81.82.', 81, NULL, NULL, 'NOW()', 'NOW()', NULL),
(84, 2, 'CREATE_PERMISSION', '81.82.84.', 82, NULL, NULL, 'NOW()', 'NOW()', NULL),
(85, 2, 'DELETE_PERMISSION', '81.82.85.', 82, NULL, NULL, 'NOW()', 'NOW()', NULL),
(86, 2, 'UPDATE_PERMISSION', '81.82.86.', 82, NULL, NULL, 'NOW()', 'NOW()', NULL),
(87, 2, 'USER', '81.87.', 81, NULL, NULL, 'NOW()', 'NOW()', NULL),
(88, 2, 'READ_USER', '81.87.88.', 87, NULL, NULL, 'NOW()', 'NOW()', NULL),
(89, 2, 'UPDATE_USER', '81.87.89.', 87, NULL, NULL, 'NOW()', 'NOW()', NULL),
(90, 2, 'DELETE_USER', '81.87.90.', 87, NULL, NULL, 'NOW()', 'NOW()', NULL),
(91, 2, 'CREATE_USER', '81.87.91.', 87, NULL, NULL, 'NOW()', 'NOW()', NULL),
(92, 2, 'ROLE', '81.92.', 81, NULL, NULL, 'NOW()', 'NOW()', NULL),
(93, 2, 'READ_ROLE', '81.92.93.', 92, NULL, NULL, 'NOW()', 'NOW()', NULL),
(94, 2, 'UPDATE_ROLE', '81.92.94.', 92, NULL, NULL, 'NOW()', 'NOW()', NULL),
(95, 2, 'CREATE_ROLE', '81.92.95.', 92, NULL, NULL, 'NOW()', 'NOW()', NULL),
(96, 2, 'DELETE_ROLE', '81.92.96.', 92, NULL, NULL, 'NOW()', 'NOW()', NULL),
(97, 2, 'ROLE_PERMISSION', '81.97.', 81, NULL, NULL, 'NOW()', 'NOW()', NULL),
(98, 2, 'READ_ROLE_PERMISSION', '81.97.98.', 97, NULL, NULL, 'NOW()', 'NOW()', NULL),
(99, 2, 'UPDATE_ROLE_PERMISSION', '81.97.99.', 97, NULL, NULL, 'NOW()', 'NOW()', NULL),
(100, 2, 'DELETE_ROLE_PERMISSION', '81.97.100.', 97, NULL, NULL, 'NOW()', 'NOW()', NULL),
(101, 2, 'CREATE_ROLE_PERMISSION', '81.97.101.', 97, NULL, NULL, 'NOW()', 'NOW()', NULL),
(102, 2, 'AUTHENTICATION', '81.102.', 81, NULL, NULL, 'NOW()', 'NOW()', NULL),
(103, 2, 'READ_AUTEHNTICATION', '81.102.103.', 102, NULL, NULL, 'NOW()', 'NOW()', NULL),
(104, 2, 'CREATE_AUTHENTICATION', '81.102.104.', 102, NULL, NULL, 'NOW()', 'NOW()', NULL),
(105, 2, 'UPDATE_AUTHENTICATION', '81.102.105.', 102, NULL, NULL, 'NOW()', 'NOW()', NULL),
(106, 2, 'DELETE_AUTHENTICATION', '81.102.106.', 102, NULL, NULL, 'NOW()', 'NOW()', NULL),
(107, 2, 'EMPLOYEE_MODULE', '107.', NULL, NULL, NULL, 'NOW()', 'NOW()', NULL),
(108, 2, 'EMPLOYEE_MASTER_INFORMATION', '107.108.', 107, NULL, NULL, 'NOW()', 'NOW()', NULL),
(109, 2, 'READ_EMPLOYEE_MASTER_INFORMATION', '107.108.109.', 108, NULL, NULL, 'NOW()', 'NOW()', NULL),
(110, 2, 'CREATE_EMPLOYEE_MASTER_INFORMATION', '107.108.110.', 108, NULL, NULL, 'NOW()', 'NOW()', NULL),
(111, 2, 'UPDATE_EMPLOYEE_MASTER_INFORMATION', '107.108.111.', 108, NULL, NULL, 'NOW()', 'NOW()', NULL),
(112, 2, 'DELETE_EMPLOYEE_MASTER_INFORMATION', '107.108.112.', 108, NULL, NULL, 'NOW()', 'NOW()', NULL),
(113, 2, 'EMPLOYEE_MOVEMENT', '107.113.', 107, NULL, NULL, 'NOW()', 'NOW()', NULL),
(114, 2, 'READ_EMPLOYEE_MOVEMENT', '107.113.114.', 113, NULL, NULL, 'NOW()', 'NOW()', NULL),
(115, 2, 'CREATE_EMPLOYEE_MOVEMENT', '107.113.115.', 113, NULL, NULL, 'NOW()', 'NOW()', NULL),
(116, 2, 'UPDATE_EMPLOYEE_MOVEMENT', '107.113.116.', 113, NULL, NULL, 'NOW()', 'NOW()', NULL),
(117, 2, 'DELETE_EMPLOYEE_MOVEMENT', '107.113.117.', 113, NULL, NULL, 'NOW()', 'NOW()', NULL),
(118, 2, 'EMPLOYEE_RESIGNATION', '107.118.', 107, NULL, NULL, 'NOW()', 'NOW()', NULL),
(119, 2, 'READ_EMPLOYEE_RESIGNATION', '107.118.119.', 118, NULL, NULL, 'NOW()', 'NOW()', NULL),
(120, 2, 'CREATE_EMPLOYEE_RESIGNATION', '107.118.120.', 118, NULL, NULL, 'NOW()', 'NOW()', NULL),
(121, 2, 'UPDATE_EMPLOYEE_RESIGNATION', '107.118.121.', 118, NULL, NULL, 'NOW()', 'NOW()', NULL),
(122, 2, 'DELETE_EMPLOYEE_RESIGNATION', '107.118.122.', 118, NULL, NULL, 'NOW()', 'NOW()', NULL),
(123, 2, 'EMPLOYEE_STATUS', '107.123.', 107, NULL, NULL, 'NOW()', 'NOW()', NULL),
(124, 2, 'READ_EMPLOYEE_STATUS', '107.123.124.', 123, NULL, NULL, 'NOW()', 'NOW()', NULL),
(125, 2, 'CREATE_EMPLOYEE_STATUS', '107.123.125.', 123, NULL, NULL, 'NOW()', 'NOW()', NULL),
(126, 2, 'UPDATE_EMPLOYEE_STATUS', '107.123.126.', 123, NULL, NULL, 'NOW()', 'NOW()', NULL),
(127, 2, 'DELETE_EMPLOYEE_STATUS', '107.123.127.', 123, NULL, NULL, 'NOW()', 'NOW()', NULL),
(128, 2, 'EMPLOYEE_WARNING', '107.128.', 107, NULL, NULL, 'NOW()', 'NOW()', NULL),
(129, 2, 'READ_EMPLOYEE_WARNING', '107.128.129.', 128, NULL, NULL, 'NOW()', 'NOW()', NULL),
(130, 2, 'CREATE_EMPLOYEE_WARNING', '107.128.130.', 128, NULL, NULL, 'NOW()', 'NOW()', NULL),
(131, 2, 'UPDATE_EMPLOYEE_WARNING', '107.128.131.', 128, NULL, NULL, 'NOW()', 'NOW()', NULL),
(132, 2, 'DELETE_EMPLOYEE_WARNING', '107.128.132.', 128, NULL, NULL, 'NOW()', 'NOW()', NULL),
(133, 2, 'JOB_TITLE', '107.133.', 107, NULL, NULL, 'NOW()', 'NOW()', NULL),
(134, 2, 'READ_JOB_TITLE', '107.133.134.', 133, NULL, NULL, 'NOW()', 'NOW()', NULL),
(135, 2, 'CREATE_JOB_TITLE', '107.133.135.', 133, NULL, NULL, 'NOW()', 'NOW()', NULL),
(136, 2, 'UPDATE_JOB_TITLE', '107.133.136.', 133, NULL, NULL, 'NOW()', 'NOW()', NULL),
(137, 2, 'DELETE_JOB_TITLE', '107.133.137.', 133, NULL, NULL, 'NOW()', 'NOW()', NULL),
(138, 2, 'KEY_VALUE', '107.138.', 107, NULL, NULL, 'NOW()', 'NOW()', NULL),
(139, 2, 'READ_KEY_VALUE', '107.138.139.', 138, NULL, NULL, 'NOW()', 'NOW()', NULL),
(140, 2, 'CREATE_KEY_VALUE', '107.138.140.', 138, NULL, NULL, 'NOW()', 'NOW()', NULL),
(141, 2, 'UPDATE_KEY_VALUE', '107.138.141.', 138, NULL, NULL, 'NOW()', 'NOW()', NULL),
(142, 2, 'DELETE_KEY_VALUE', '107.138.142.', 138, NULL, NULL, 'NOW()', 'NOW()', NULL),
(143, 2, 'PAY_GRADE', '107.143.', 107, NULL, NULL, 'NOW()', 'NOW()', NULL),
(144, 2, 'READ_PAY_GRADE', '107.143.144.', 143, NULL, NULL, 'NOW()', 'NOW()', NULL),
(145, 2, 'CREATE_PAY_GRADE', '107.143.145.', 143, NULL, NULL, 'NOW()', 'NOW()', NULL),
(146, 2, 'UPDATE_PAY_GRADE', '107.143.146.', 143, NULL, NULL, 'NOW()', 'NOW()', NULL),
(147, 2, 'DELETE_PAY_GRADE', '107.143.147.', 143, NULL, NULL, 'NOW()', 'NOW()', NULL),
(148, 2, 'QUALIFICATION', '107.148.', 107, NULL, NULL, 'NOW()', 'NOW()', NULL),
(149, 2, 'READ_QUALIFICATION', '107.148.149.', 148, NULL, NULL, 'NOW()', 'NOW()', NULL),
(150, 2, 'CREATE_QUALIFICATION', '107.148.150.', 148, NULL, NULL, 'NOW()', 'NOW()', NULL),
(151, 2, 'UPDATE_QUALIFICATION', '107.148.151.', 148, NULL, NULL, 'NOW()', 'NOW()', NULL),
(152, 2, 'DELETE_QUALIFICATION', '107.148.152.', 148, NULL, NULL, 'NOW()', 'NOW()', NULL),
(153, 2, 'COMPANY_STRUCTURE_PERMISSION', '107.153.', 107, NULL, NULL, 'NOW()', 'NOW()', NULL),
(154, 2, 'READ_COMPANY_STURCTURE_PERMISSION', '107.153.154.', 153, NULL, NULL, 'NOW()', 'NOW()', NULL),
(155, 2, 'CREATE_COMPANY_STURCTURE_PERMISSION', '107.153.155.', 153, NULL, NULL, 'NOW()', 'NOW()', NULL),
(156, 2, 'UPDATE_COMPANY_STURCTURE_PERMISSION', '107.153.156.', 153, NULL, NULL, 'NOW()', 'NOW()', NULL),
(157, 2, 'DELETE_COMPANY_STURCTURE_PERMISSION', '107.153.157.', 153, NULL, NULL, 'NOW()', 'NOW()', NULL) ON CONFLICT DO NOTHING;
`);
  }

  public async down(): Promise<void> {
    return;
  }
}
