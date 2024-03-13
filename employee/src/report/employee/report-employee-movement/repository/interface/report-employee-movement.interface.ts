export interface IReportEmployeeMovementRepository {
  newEmployeeCount(): Promise<number>;
  resignEmployeeCount(currentDate: Date, inputDate?: Date): Promise<number>;
}
