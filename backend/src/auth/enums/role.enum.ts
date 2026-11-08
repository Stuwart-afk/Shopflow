export enum Role {
  ADMIN = 'admin',
  SERVICE_ADVISOR = 'service_advisor',
  VALIDATOR = 'validator',
  MECHANIC = 'mechanic',
  CUSTOMER = 'customer',
}

export enum JobStatus {
  PENDING = 'PENDING',
  INSPECTING = 'INSPECTING',
  DIAGNOSED = 'DIAGNOSED',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}