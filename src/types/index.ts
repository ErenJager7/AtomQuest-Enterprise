export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN'
}

export enum GoalStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REWORK_REQUIRED = 'REWORK_REQUIRED'
}

export enum QuarterStatus {
  NOT_STARTED = 'NOT_STARTED',
  ON_TRACK = 'ON_TRACK',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  AT_RISK = 'AT_RISK'
}

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  jobTitle: string;
  departmentId: string;
  managerId: string | null;
  createdAt: Date;
};

export type Department = {
  id: string;
  name: string;
};

export type GoalCycle = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  thrustArea: string;
  uom: string;
  targetValue: number;
  currentValue: number;
  weightage: number;
  deadline: Date;
  status: GoalStatus;
  isShared: boolean;
  cycleId: string;
  employeeId: string;
  departmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type QuarterlyCheckIn = {
  id: string;
  goalId: string;
  quarter: number;
  status: QuarterStatus;
  notes: string;
  achievement: number;
  feedback: string | null;
  reviewedBy: string | null;
  updatedAt: Date;
};

export type Comment = {
  id: string;
  goalId: string;
  authorId: string;
  text: string;
  createdAt: Date;
};

export type AuditLog = {
  id: string;
  userId: string;
  action: string;
  oldValue: any | null;
  newValue: any | null;
  ipAddress: string | null;
  timestamp: Date;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

export type PopulatedGoal = Goal & {
  employee?: User;
  cycle?: GoalCycle;
  checkIns?: QuarterlyCheckIn[];
  department?: Department;
  comments?: PopulatedComment[];
};

export type PopulatedComment = Comment & {
  author?: User;
};

export type PopulatedUser = User & {
  department?: Department;
  manager?: User;
  employees?: User[];
  goals?: PopulatedGoal[];
};
