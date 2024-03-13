import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entity/employee.entity';
import { EmployeeModule } from '../employee/employee.module';
import { PaymentMethod } from '../payment-method/entities/payment-method.entity';
import { EmployeePaymentMethodAccount } from './entities/employee-payment-method-account.entity';
import { EmployeePaymentMethodAccountController } from './employee-payment-method-account.controller';
import { EmployeePaymentMethodAccountService } from './employee-payment-method-account.service';

@Module({
  controllers: [EmployeePaymentMethodAccountController],
  providers: [EmployeePaymentMethodAccountService],
  imports: [
    TypeOrmModule.forFeature([
      EmployeePaymentMethodAccount,
      Employee,
      PaymentMethod
    ]),
    EmployeeModule
  ]
})
export class EmployeePaymentMethodAccountModule {}
