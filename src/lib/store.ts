// @ts-nocheck
/**
 * In-Memory Data Store — acts as a mutable database.
 * When ready for production, swap these functions with Prisma queries.
 * All API routes read/write through this module.
 */

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum GoalStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REWORK_REQUIRED = 'REWORK_REQUIRED',
  COMPLETED = 'COMPLETED'
}

export enum QuarterStatus {
  NOT_STARTED = 'NOT_STARTED',
  ON_TRACK = 'ON_TRACK',
  DELAYED = 'DELAYED',
  AT_RISK = 'AT_RISK',
  COMPLETED = 'COMPLETED'
}

// ─── Types ───────────────────────────────────────────────────────────────
export type StoreUser = {
  id: string;
  email: string;
  password: string; // hashed in production
  name: string;
  role: Role;
  jobTitle: string;
  departmentId: string;
  managerId: string | null;
  createdAt: Date;
};

export type StoreDepartment = {
  id: string;
  name: string;
};

export type StoreGoalCycle = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

export type StoreGoal = {
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

export type StoreCheckIn = {
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

export type StoreNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

export type StoreAuditLog = {
  id: string;
  userId: string;
  action: string;
  details: string;
  module: string;
  timestamp: Date;
};

export type StoreComment = {
  id: string;
  goalId: string;
  authorId: string;
  text: string;
  createdAt: Date;
};

// ─── ID Generator ────────────────────────────────────────────────────────
let idCounter = 100;
export function generateId(): string {
  return `id_${Date.now()}_${idCounter++}`;
}

// ─── Seed Data ───────────────────────────────────────────────────────────

const departments: StoreDepartment[] = [
  { id: 'd1', name: 'Engineering' },
  { id: 'd2', name: 'Marketing' },
  { id: 'd3', name: 'Sales' },
  { id: 'd4', name: 'Support' },
  { id: 'd5', name: 'Human Resources' },
];

const cycles: StoreGoalCycle[] = [
  { id: 'c1', name: 'FY24 Q3', startDate: new Date('2024-07-01'), endDate: new Date('2024-09-30'), isActive: true },
  { id: 'c2', name: 'FY24 Q4', startDate: new Date('2024-10-01'), endDate: new Date('2024-12-31'), isActive: false },
];

const users: StoreUser[] = [
  { id: 'u1', email: 'jordan@atomquest.inc', password: 'admin123', name: 'Jordan K.', role: Role.ADMIN, jobTitle: 'CEO', departmentId: 'd1', managerId: null, createdAt: new Date() },
  { id: 'u2', email: 'alex@atomquest.inc', password: 'manager123', name: 'Alex R.', role: Role.MANAGER, jobTitle: 'VP Engineering', departmentId: 'd1', managerId: 'u1', createdAt: new Date() },
  { id: 'u3', email: 'sarah@atomquest.inc', password: 'employee123', name: 'Sarah J.', role: Role.EMPLOYEE, jobTitle: 'Senior Frontend Engineer', departmentId: 'd1', managerId: 'u2', createdAt: new Date() },
  { id: 'u4', email: 'marin@atomquest.inc', password: 'employee123', name: 'Marin P.', role: Role.EMPLOYEE, jobTitle: 'Backend Engineer', departmentId: 'd1', managerId: 'u2', createdAt: new Date() },
  { id: 'u5', email: 'lisa@atomquest.inc', password: 'employee123', name: 'Lisa C.', role: Role.EMPLOYEE, jobTitle: 'Marketing Lead', departmentId: 'd2', managerId: 'u2', createdAt: new Date() },
  { id: 'u6', email: 'tom@atomquest.inc', password: 'employee123', name: 'Tom H.', role: Role.EMPLOYEE, jobTitle: 'Sales Executive', departmentId: 'd3', managerId: 'u2', createdAt: new Date() },
];

const goals: StoreGoal[] = [
  { id: 'g1', title: 'Reduce average ticket response time by 25%', description: 'Optimize routing, implement AI pre-screening, and expand support knowledge base to hit the new ambitious target of 4.5 hours.', thrustArea: 'Customer Success', uom: 'Hours', targetValue: 4.5, currentValue: 3.8, weightage: 20, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: false, cycleId: 'c1', employeeId: 'u3', departmentId: null, createdAt: new Date('2024-07-02'), updatedAt: new Date('2024-08-15') },
  { id: 'g2', title: 'Migrate to Next.js App Router', description: 'Move all 40+ legacy pages to the new Next.js 14 App Router architecture.', thrustArea: 'Engineering Excellence', uom: 'Percentage', targetValue: 100, currentValue: 68, weightage: 15, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: false, cycleId: 'c1', employeeId: 'u3', departmentId: null, createdAt: new Date('2024-07-05'), updatedAt: new Date('2024-09-01') },
  { id: 'g3', title: 'Launch customer feedback portal v2', description: 'Design and ship the new customer feedback collection portal with sentiment analysis.', thrustArea: 'Customer Success', uom: 'Percentage', targetValue: 100, currentValue: 95, weightage: 15, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: false, cycleId: 'c1', employeeId: 'u3', departmentId: null, createdAt: new Date('2024-07-03'), updatedAt: new Date('2024-09-10') },
  { id: 'g4', title: 'Reduce frontend bundle size by 30%', description: 'Audit and optimize webpack output, implement code splitting and tree shaking.', thrustArea: 'Engineering Excellence', uom: 'Percentage', targetValue: 30, currentValue: 22, weightage: 10, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: false, cycleId: 'c1', employeeId: 'u3', departmentId: null, createdAt: new Date('2024-07-10'), updatedAt: new Date('2024-08-28') },
  { id: 'g5', title: 'Implement design system component library', description: 'Build a shared component library with Storybook covering all core UI primitives.', thrustArea: 'Engineering Excellence', uom: 'Components', targetValue: 50, currentValue: 42, weightage: 15, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: true, cycleId: 'c1', employeeId: 'u3', departmentId: 'd1', createdAt: new Date('2024-07-01'), updatedAt: new Date('2024-09-05') },
  { id: 'g6', title: 'Achieve 95% unit test coverage', description: 'Write comprehensive unit tests using Jest and React Testing Library.', thrustArea: 'Quality Assurance', uom: 'Percentage', targetValue: 95, currentValue: 78, weightage: 10, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: false, cycleId: 'c1', employeeId: 'u3', departmentId: null, createdAt: new Date('2024-07-08'), updatedAt: new Date('2024-09-02') },
  { id: 'g7', title: 'Mentor 2 junior developers', description: 'Guide new team members through codebase orientation and first deployments.', thrustArea: 'Team Growth', uom: 'People', targetValue: 2, currentValue: 2, weightage: 15, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: false, cycleId: 'c1', employeeId: 'u3', departmentId: null, createdAt: new Date('2024-07-01'), updatedAt: new Date('2024-08-15') },
  // Marin P. goals
  { id: 'g8', title: 'Achieve 99.99% API Uptime', description: 'Refactor microservices and implement fallback DB clusters.', thrustArea: 'Infrastructure', uom: 'Percentage', targetValue: 99.99, currentValue: 99.95, weightage: 30, deadline: new Date('2024-09-30'), status: GoalStatus.PENDING_APPROVAL, isShared: true, cycleId: 'c1', employeeId: 'u4', departmentId: 'd1', createdAt: new Date('2024-07-01'), updatedAt: new Date('2024-08-10') },
  // Lisa C. goals
  { id: 'g9', title: 'Increase organic traffic by 40%', description: 'Content marketing strategy, SEO optimization, and social campaigns.', thrustArea: 'Growth', uom: 'Percentage', targetValue: 40, currentValue: 28, weightage: 30, deadline: new Date('2024-09-30'), status: GoalStatus.PENDING_APPROVAL, isShared: false, cycleId: 'c1', employeeId: 'u5', departmentId: null, createdAt: new Date('2024-07-05'), updatedAt: new Date('2024-08-20') },
  // Alex R. (Manager) personal goals
  { id: 'g10', title: 'Scale engineering team to 50 members', description: 'Hire and onboard 15 new engineers across frontend and backend squads.', thrustArea: 'Team Growth', uom: 'People', targetValue: 50, currentValue: 42, weightage: 50, deadline: new Date('2024-12-31'), status: GoalStatus.APPROVED, isShared: false, cycleId: 'c1', employeeId: 'u2', departmentId: 'd1', createdAt: new Date('2024-07-01'), updatedAt: new Date('2024-09-15') },
  { id: 'g11', title: 'Implement zero-downtime deployment pipeline', description: 'Transition to blue-green deployments using Kubernetes and ArgoCD.', thrustArea: 'Infrastructure', uom: 'Percentage', targetValue: 100, currentValue: 45, weightage: 50, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: true, cycleId: 'c1', employeeId: 'u2', departmentId: 'd1', createdAt: new Date('2024-07-10'), updatedAt: new Date('2024-09-12') },
];

const checkIns: StoreCheckIn[] = [
  { id: 'chk1', goalId: 'g1', quarter: 3, status: QuarterStatus.ON_TRACK, notes: 'Deploy new ticketing system - Done. Train support team - Done.', achievement: 84, feedback: 'Great progress.', reviewedBy: 'u2', updatedAt: new Date('2024-08-20') },
  { id: 'chk2', goalId: 'g2', quarter: 3, status: QuarterStatus.DELAYED, notes: 'Hit blockers with new caching strategies. 27 of 40 pages migrated.', achievement: 68, feedback: null, reviewedBy: null, updatedAt: new Date('2024-08-22') },
  { id: 'chk3', goalId: 'g3', quarter: 3, status: QuarterStatus.ON_TRACK, notes: 'Shipped beta to 500 users. Collecting feedback before GA.', achievement: 95, feedback: 'Excellent execution.', reviewedBy: 'u2', updatedAt: new Date('2024-09-10') },
  { id: 'chk4', goalId: 'g4', quarter: 3, status: QuarterStatus.ON_TRACK, notes: 'Achieved 22% reduction. Dynamic imports applied to 80% of routes.', achievement: 73, feedback: null, reviewedBy: null, updatedAt: new Date('2024-08-28') },
  { id: 'chk5', goalId: 'g5', quarter: 3, status: QuarterStatus.ON_TRACK, notes: '42 of 50 components built and documented in Storybook.', achievement: 84, feedback: 'Component quality is excellent.', reviewedBy: 'u2', updatedAt: new Date('2024-09-05') },
  { id: 'chk6', goalId: 'g6', quarter: 3, status: QuarterStatus.AT_RISK, notes: 'Coverage at 78%. Need to add tests for 12 more modules.', achievement: 82, feedback: 'Needs acceleration.', reviewedBy: 'u2', updatedAt: new Date('2024-09-02') },
  { id: 'chk7', goalId: 'g7', quarter: 3, status: QuarterStatus.COMPLETED, notes: 'Both mentees completed onboarding and shipped first PRs.', achievement: 100, feedback: 'Outstanding mentorship.', reviewedBy: 'u2', updatedAt: new Date('2024-08-15') },
  { id: 'chk8', goalId: 'g9', quarter: 3, status: QuarterStatus.ON_TRACK, notes: 'Blog traffic up 28%. SEO audit completed.', achievement: 70, feedback: null, reviewedBy: null, updatedAt: new Date('2024-08-20') },
  { id: 'chk9', goalId: 'g10', quarter: 3, status: QuarterStatus.ON_TRACK, notes: 'Hired 8 engineers this quarter. Pipeline remains strong.', achievement: 84, feedback: 'Hiring velocity is ahead of schedule.', reviewedBy: 'u1', updatedAt: new Date('2024-09-15') },
];

const notifications: StoreNotification[] = [
  { id: 'n1', userId: 'u3', title: 'Manager Approved Goal 3', message: 'Manager approved Goal for Goal 3', isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 2) },
  { id: 'n2', userId: 'u3', title: 'You updated milestone for Goal 1', message: 'You updated milestone for Goal 1', isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 2) },
  { id: 'n3', userId: 'u3', title: 'Admin unlocked Goal Cycle FY24 Q3', message: 'Admin unlocked Goal Cycle FY24 Q3', isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 2) },
  { id: 'n4', userId: 'u2', title: 'Pending Approval', message: 'Marin P. submitted "Achieve 99.99% API Uptime" for approval.', isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 60) },
  { id: 'n5', userId: 'u2', title: 'Pending Approval', message: 'Lisa C. submitted "Increase organic traffic by 40%" for approval.', isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 120) },
];

const auditLogs: StoreAuditLog[] = [
  { id: 'al1', userId: 'u4', action: 'GOAL_SUBMITTED', details: 'Submitted goal "Achieve 99.99% API Uptime"', module: 'Goals', timestamp: new Date('2024-07-22T14:22:00') },
  { id: 'al2', userId: 'u3', action: 'GOAL_APPROVED', details: 'Manager approved "Launch customer feedback portal"', module: 'Approvals', timestamp: new Date('2024-07-23T09:14:00') },
  { id: 'al3', userId: 'u1', action: 'CYCLE_UNLOCKED', details: 'Admin unlocked FY24 Q3 cycle', module: 'System', timestamp: new Date('2024-07-23T11:45:00') },
];

const comments: StoreComment[] = [];

// ─── Store API ───────────────────────────────────────────────────────────

export const store = {
  // Users
  getUsers: () => [...users],
  getUserById: (id: string) => users.find(u => u.id === id) || null,
  getUserByEmail: (email: string) => users.find(u => u.email === email) || null,
  addUser: (user: Omit<StoreUser, 'id' | 'createdAt'>) => {
    const newUser: StoreUser = { ...user, id: generateId(), createdAt: new Date() };
    users.push(newUser);
    return newUser;
  },
  getUsersByManager: (managerId: string) => users.filter(u => u.managerId === managerId),

  // Departments
  getDepartments: () => [...departments],
  getDepartmentById: (id: string) => departments.find(d => d.id === id) || null,
  addDepartment: (name: string) => {
    const dept: StoreDepartment = { id: generateId(), name };
    departments.push(dept);
    return dept;
  },

  // Cycles
  getCycles: () => [...cycles],
  getActiveCycle: () => cycles.find(c => c.isActive) || null,
  toggleCycleLock: (id: string) => {
    const cycle = cycles.find(c => c.id === id);
    if (cycle) cycle.isActive = !cycle.isActive;
    return cycle;
  },

  // Goals
  getGoals: () => [...goals],
  getGoalById: (id: string) => goals.find(g => g.id === id) || null,
  getGoalsByEmployee: (employeeId: string) => goals.filter(g => g.employeeId === employeeId),
  getGoalsByStatus: (status: GoalStatus) => goals.filter(g => g.status === status),
  addGoal: (goal: Omit<StoreGoal, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>) => {
    const newGoal: StoreGoal = { ...goal, id: generateId(), currentValue: 0, createdAt: new Date(), updatedAt: new Date() };
    goals.push(newGoal);
    return newGoal;
  },
  updateGoalStatus: (id: string, status: GoalStatus) => {
    const goal = goals.find(g => g.id === id);
    if (goal) { goal.status = status; goal.updatedAt = new Date(); }
    return goal;
  },
  updateGoalProgress: (id: string, currentValue: number) => {
    const goal = goals.find(g => g.id === id);
    if (goal) { goal.currentValue = currentValue; goal.updatedAt = new Date(); }
    return goal;
  },

  // Check-ins
  getCheckIns: () => [...checkIns],
  getCheckInsByGoal: (goalId: string) => checkIns.filter(c => c.goalId === goalId),
  addCheckIn: (checkIn: Omit<StoreCheckIn, 'id' | 'updatedAt'>) => {
    const newCheckIn: StoreCheckIn = { ...checkIn, id: generateId(), updatedAt: new Date() };
    checkIns.push(newCheckIn);
    return newCheckIn;
  },

  // Notifications
  getNotifications: () => [...notifications],
  getNotificationsByUser: (userId: string) => notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  addNotification: (notif: Omit<StoreNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: StoreNotification = { ...notif, id: generateId(), isRead: false, createdAt: new Date() };
    notifications.push(newNotif);
    return newNotif;
  },
  markNotificationRead: (id: string) => {
    const notif = notifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
    return notif;
  },
  markAllRead: (userId: string) => {
    notifications.filter(n => n.userId === userId).forEach(n => n.isRead = true);
  },

  // Audit Logs
  getAuditLogs: () => [...auditLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
  addAuditLog: (log: Omit<StoreAuditLog, 'id' | 'timestamp'>) => {
    const newLog: StoreAuditLog = { ...log, id: generateId(), timestamp: new Date() };
    auditLogs.push(newLog);
    return newLog;
  },

  // Comments
  getCommentsByGoal: (goalId: string) => comments.filter(c => c.goalId === goalId),
  addComment: (comment: Omit<StoreComment, 'id' | 'createdAt'>) => {
    const newComment: StoreComment = { ...comment, id: generateId(), createdAt: new Date() };
    comments.push(newComment);
    return newComment;
  },

  // Analytics helpers
  getMetricsForUser: (userId: string) => {
    const userGoals = goals.filter(g => g.employeeId === userId);
    const userCheckIns = userGoals.map(g => checkIns.find(c => c.goalId === g.id)).filter(Boolean);
    return {
      totalGoals: userGoals.length,
      onTrack: userCheckIns.filter(c => c?.status === QuarterStatus.ON_TRACK).length,
      delayed: userCheckIns.filter(c => c?.status === QuarterStatus.DELAYED).length,
      atRisk: userCheckIns.filter(c => c?.status === QuarterStatus.AT_RISK).length,
      completed: userCheckIns.filter(c => c?.status === QuarterStatus.COMPLETED).length,
      pendingApproval: userGoals.filter(g => g.status === GoalStatus.PENDING_APPROVAL).length,
      overallProgress: userGoals.length > 0 ? Math.round(
        userGoals.reduce((acc, g) => {
          const progress = Math.min((g.currentValue / g.targetValue) * 100, 100);
          return acc + progress * (g.weightage / 100);
        }, 0)
      ) : 0,
    };
  },
};
