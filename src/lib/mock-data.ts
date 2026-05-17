// @ts-nocheck
import { GoalStatus, QuarterStatus, Role } from '@/lib/store';
import { PopulatedGoal, PopulatedUser, Department, GoalCycle, Notification, QuarterlyCheckIn } from '@/types';

// DEPARTMENTS
export const mockDepartments: Department[] = [
  { id: 'd1', name: 'Engineering' },
  { id: 'd2', name: 'Marketing' },
  { id: 'd3', name: 'Sales' },
  { id: 'd4', name: 'Support' },
];

// CYCLES
export const mockCycles: GoalCycle[] = [
  { id: 'c1', name: 'FY24 Q3', startDate: new Date('2024-07-01'), endDate: new Date('2024-09-30'), isActive: true },
  { id: 'c2', name: 'FY24 Q4', startDate: new Date('2024-10-01'), endDate: new Date('2024-12-31'), isActive: false },
];

// USERS
export const mockUsers: PopulatedUser[] = [
  {
    id: 'u1', email: 'jordan.k@atomquest.inc', name: 'Jordan K.', role: Role.ADMIN, jobTitle: 'CEO', departmentId: 'd1', managerId: null, createdAt: new Date(),
    department: { id: 'd1', name: 'Engineering' },
  },
  {
    id: 'u2', email: 'alex.r@atomquest.inc', name: 'Alex R.', role: Role.MANAGER, jobTitle: 'VP Engineering', departmentId: 'd1', managerId: 'u1', createdAt: new Date(),
    department: { id: 'd1', name: 'Engineering' },
  },
  {
    id: 'u3', email: 'sarah.j@atomquest.inc', name: 'Sarah J.', role: Role.EMPLOYEE, jobTitle: 'Senior Frontend Engineer', departmentId: 'd1', managerId: 'u2', createdAt: new Date(),
    department: { id: 'd1', name: 'Engineering' },
  },
  {
    id: 'u4', email: 'marin.p@atomquest.inc', name: 'Marin P.', role: Role.EMPLOYEE, jobTitle: 'Backend Engineer', departmentId: 'd1', managerId: 'u2', createdAt: new Date(),
    department: { id: 'd1', name: 'Engineering' },
  },
  {
    id: 'u5', email: 'lisa.c@atomquest.inc', name: 'Lisa C.', role: Role.EMPLOYEE, jobTitle: 'Marketing Lead', departmentId: 'd2', managerId: 'u2', createdAt: new Date(),
    department: { id: 'd2', name: 'Marketing' },
  },
  {
    id: 'u6', email: 'tom.h@atomquest.inc', name: 'Tom H.', role: Role.EMPLOYEE, jobTitle: 'Sales Executive', departmentId: 'd3', managerId: 'u2', createdAt: new Date(),
    department: { id: 'd3', name: 'Sales' },
  },
];

// Link Managers to Users
mockUsers[1].manager = mockUsers[0];
mockUsers[2].manager = mockUsers[1];
mockUsers[3].manager = mockUsers[1];
mockUsers[4].manager = mockUsers[1];
mockUsers[5].manager = mockUsers[1];

// GOALS — 7 goals for Sarah J., plus goals for others
export const mockGoals: PopulatedGoal[] = [
  {
    id: 'g1', title: 'Reduce average ticket response time by 25%', description: 'Optimize routing, implement AI pre-screening, and expand support knowledge base to hit the new ambitious target of 4.5 hours.', thrustArea: 'Customer Success', uom: 'Hours', targetValue: 4.5, currentValue: 3.8, weightage: 20, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: false, cycleId: 'c1', employeeId: 'u3', departmentId: null, createdAt: new Date('2024-07-02'), updatedAt: new Date('2024-08-15'),
    cycle: mockCycles[0], employee: mockUsers[2],
    checkIns: [
      { id: 'chk1', goalId: 'g1', quarter: 3, status: QuarterStatus.ON_TRACK, notes: 'Deploy new ticketing system - Done. Train support team - Done.', achievement: 84, feedback: 'Great progress, keep the momentum up for the final stretch.', reviewedBy: 'u2', updatedAt: new Date('2024-08-20') }
    ]
  },
  {
    id: 'g2', title: 'Migrate to Next.js App Router', description: 'Move all 40+ legacy pages to the new Next.js 14 App Router architecture to improve performance, SEO, and developer experience.', thrustArea: 'Engineering Excellence', uom: 'Percentage', targetValue: 100, currentValue: 68, weightage: 15, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: false, cycleId: 'c1', employeeId: 'u3', departmentId: null, createdAt: new Date('2024-07-05'), updatedAt: new Date('2024-09-01'),
    cycle: mockCycles[0], employee: mockUsers[2],
    checkIns: [
      { id: 'chk2', goalId: 'g2', quarter: 3, status: QuarterStatus.DELAYED, notes: 'Hit some blockers with the new caching strategies. 27 of 40 pages migrated.', achievement: 68, feedback: null, reviewedBy: null, updatedAt: new Date('2024-08-22') }
    ]
  },
  {
    id: 'g3', title: 'Launch customer feedback portal v2', description: 'Design and ship the new customer feedback collection portal with sentiment analysis and prioritization engine.', thrustArea: 'Customer Success', uom: 'Percentage', targetValue: 100, currentValue: 95, weightage: 15, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: false, cycleId: 'c1', employeeId: 'u3', departmentId: null, createdAt: new Date('2024-07-03'), updatedAt: new Date('2024-09-10'),
    cycle: mockCycles[0], employee: mockUsers[2],
    checkIns: [
      { id: 'chk3', goalId: 'g3', quarter: 3, status: QuarterStatus.ON_TRACK, notes: 'Shipped beta to 500 users. Collecting feedback before GA.', achievement: 95, feedback: 'Excellent execution. On track for early completion.', reviewedBy: 'u2', updatedAt: new Date('2024-09-10') }
    ]
  },
  {
    id: 'g4', title: 'Reduce frontend bundle size by 30%', description: 'Audit and optimize webpack output, implement code splitting, tree shaking, and lazy loading across the main application.', thrustArea: 'Engineering Excellence', uom: 'Percentage', targetValue: 30, currentValue: 22, weightage: 10, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: false, cycleId: 'c1', employeeId: 'u3', departmentId: null, createdAt: new Date('2024-07-10'), updatedAt: new Date('2024-08-28'),
    cycle: mockCycles[0], employee: mockUsers[2],
    checkIns: [
      { id: 'chk4', goalId: 'g4', quarter: 3, status: QuarterStatus.ON_TRACK, notes: 'Achieved 22% reduction. Dynamic imports applied to 80% of routes.', achievement: 73, feedback: null, reviewedBy: null, updatedAt: new Date('2024-08-28') }
    ]
  },
  {
    id: 'g5', title: 'Implement design system component library', description: 'Build a shared, documented component library with Storybook, covering all core UI primitives used across the platform.', thrustArea: 'Engineering Excellence', uom: 'Components', targetValue: 50, currentValue: 42, weightage: 15, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: true, cycleId: 'c1', employeeId: 'u3', departmentId: 'd1', createdAt: new Date('2024-07-01'), updatedAt: new Date('2024-09-05'),
    cycle: mockCycles[0], employee: mockUsers[2], department: mockDepartments[0],
    checkIns: [
      { id: 'chk5', goalId: 'g5', quarter: 3, status: QuarterStatus.ON_TRACK, notes: '42 of 50 components built and documented in Storybook.', achievement: 84, feedback: 'Component quality is excellent. Team adoption is strong.', reviewedBy: 'u2', updatedAt: new Date('2024-09-05') }
    ]
  },
  {
    id: 'g6', title: 'Achieve 95% unit test coverage for core modules', description: 'Write comprehensive unit tests using Jest and React Testing Library for all critical business logic and UI components.', thrustArea: 'Quality Assurance', uom: 'Percentage', targetValue: 95, currentValue: 78, weightage: 10, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: false, cycleId: 'c1', employeeId: 'u3', departmentId: null, createdAt: new Date('2024-07-08'), updatedAt: new Date('2024-09-02'),
    cycle: mockCycles[0], employee: mockUsers[2],
    checkIns: [
      { id: 'chk6', goalId: 'g6', quarter: 3, status: QuarterStatus.AT_RISK, notes: 'Coverage at 78%. Need to add tests for 12 more modules before deadline.', achievement: 82, feedback: 'Needs acceleration. Consider pairing with Marin on remaining modules.', reviewedBy: 'u2', updatedAt: new Date('2024-09-02') }
    ]
  },
  {
    id: 'g7', title: 'Mentor 2 junior developers through onboarding', description: 'Guide new team members through codebase orientation, code review processes, and first production deployments.', thrustArea: 'Team Growth', uom: 'People', targetValue: 2, currentValue: 2, weightage: 15, deadline: new Date('2024-09-30'), status: GoalStatus.APPROVED, isShared: false, cycleId: 'c1', employeeId: 'u3', departmentId: null, createdAt: new Date('2024-07-01'), updatedAt: new Date('2024-08-15'),
    cycle: mockCycles[0], employee: mockUsers[2],
    checkIns: [
      { id: 'chk7', goalId: 'g7', quarter: 3, status: QuarterStatus.COMPLETED, notes: 'Both mentees have completed onboarding and shipped their first PRs.', achievement: 100, feedback: 'Outstanding mentorship. Both juniors are now productive team members.', reviewedBy: 'u2', updatedAt: new Date('2024-08-15') }
    ]
  },
  // Goals for Marin P.
  {
    id: 'g8', title: 'Achieve 99.99% API Uptime', description: 'Refactor microservices and implement fallback DB clusters for high availability.', thrustArea: 'Infrastructure', uom: 'Percentage', targetValue: 99.99, currentValue: 99.95, weightage: 25, deadline: new Date('2024-09-30'), status: GoalStatus.PENDING_APPROVAL, isShared: true, cycleId: 'c1', employeeId: 'u4', departmentId: 'd1', createdAt: new Date('2024-07-01'), updatedAt: new Date('2024-08-10'),
    cycle: mockCycles[0], employee: mockUsers[3], department: mockDepartments[0],
    checkIns: []
  },
  // Goal for Lisa C.
  {
    id: 'g9', title: 'Increase organic traffic by 40%', description: 'Implement content marketing strategy, SEO optimization, and social media campaigns to drive sustainable organic growth.', thrustArea: 'Growth', uom: 'Percentage', targetValue: 40, currentValue: 28, weightage: 30, deadline: new Date('2024-09-30'), status: GoalStatus.PENDING_APPROVAL, isShared: false, cycleId: 'c1', employeeId: 'u5', departmentId: null, createdAt: new Date('2024-07-05'), updatedAt: new Date('2024-08-20'),
    cycle: mockCycles[0], employee: mockUsers[4],
    checkIns: [
      { id: 'chk9', goalId: 'g9', quarter: 3, status: QuarterStatus.ON_TRACK, notes: 'Blog traffic up 28%. SEO audit completed.', achievement: 70, feedback: null, reviewedBy: null, updatedAt: new Date('2024-08-20') }
    ]
  },
];

// Attach Goals to Users
mockUsers[2].goals = mockGoals.filter(g => g.employeeId === 'u3');
mockUsers[3].goals = mockGoals.filter(g => g.employeeId === 'u4');
mockUsers[4].goals = mockGoals.filter(g => g.employeeId === 'u5');

// NOTIFICATIONS
export const mockNotifications: Notification[] = [
  { id: 'n1', userId: 'u3', title: 'Manager Approved Goal 3', message: 'Manager approved Goal for Goal 3', isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 2) },
  { id: 'n2', userId: 'u3', title: 'You updated milestone for Goal 1', message: 'You updated milestone for Goal 1', isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 2) },
  { id: 'n3', userId: 'u3', title: 'Admin unlocked Goal Cycle FY24 Q3', message: 'Admin unlocked Goal Cycle FY24 Q3', isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 2) },
];

export const getDashboardMetrics = () => {
  const sarahGoals = mockGoals.filter(g => g.employeeId === 'u3');
  return {
    totalGoals: sarahGoals.length,
    onTrack: sarahGoals.filter(g => g.checkIns?.[0]?.status === QuarterStatus.ON_TRACK).length,
    delayed: sarahGoals.filter(g => g.checkIns?.[0]?.status === QuarterStatus.DELAYED).length,
    atRisk: sarahGoals.filter(g => g.checkIns?.[0]?.status === QuarterStatus.AT_RISK).length,
    completed: sarahGoals.filter(g => g.checkIns?.[0]?.status === QuarterStatus.COMPLETED).length,
    pendingApproval: mockGoals.filter(g => g.status === GoalStatus.PENDING_APPROVAL).length,
    overallProgress: Math.round(
      sarahGoals.reduce((acc, g) => {
        const progress = Math.min((g.currentValue / g.targetValue) * 100, 100);
        return acc + progress * (g.weightage / 100);
      }, 0)
    ) || 0
  };
};
