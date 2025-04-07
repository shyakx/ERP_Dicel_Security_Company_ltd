// Define export fields for each report type
export const attendanceExportFields = [
  'id',
  'employee.user.firstName',
  'employee.user.lastName',
  'project.name',
  'project.client.name',
  'checkIn',
  'checkOut',
  'status'
];

export const leaveExportFields = [
  'id',
  'employee.user.firstName',
  'employee.user.lastName',
  'startDate',
  'endDate',
  'reason',
  'status',
  'approvedBy.user.firstName',
  'approvedBy.user.lastName'
];

export const payrollExportFields = [
  'id',
  'employee.user.firstName',
  'employee.user.lastName',
  'month',
  'year',
  'basicSalary',
  'allowances',
  'deductions',
  'netSalary',
  'status'
];

export const incidentExportFields = [
  'id',
  'project.name',
  'project.client.name',
  'reportedBy.user.firstName',
  'reportedBy.user.lastName',
  'assignedTo.user.firstName',
  'assignedTo.user.lastName',
  'title',
  'description',
  'severity',
  'status',
  'createdAt'
];

export const equipmentExportFields = [
  'id',
  'name',
  'type',
  'serialNumber',
  'status',
  'assignments.employee.user.firstName',
  'assignments.employee.user.lastName',
  'assignments.startDate',
  'assignments.endDate'
];

export const projectExportFields = [
  'id',
  'name',
  'description',
  'client.name',
  'startDate',
  'endDate',
  'status',
  'numberOfGuards',
  'budget',
  'assignments.employee.user.firstName',
  'assignments.employee.user.lastName',
  'assignments.startDate',
  'assignments.endDate'
]; 