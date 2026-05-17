import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get('employeeId');
  const status = searchParams.get('status');

  const where: any = {};
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;

  const goals = await prisma.goal.findMany({
    where,
    include: {
      employee: true,
      checkIns: true,
      cycle: true,
      department: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, thrustArea, uom, targetValue, weightage, deadline, employeeId, cycleId, isShared, departmentId, status } = body;

    if (!title || !employeeId) {
      return NextResponse.json({ error: 'Title and employeeId are required' }, { status: 400 });
    }

    const existingGoals = await prisma.goal.findMany({ where: { employeeId } });
    const totalWeightage = existingGoals.reduce((sum, g) => sum + g.weightage, 0);
    
    if (totalWeightage + (weightage || 0) > 100) {
      return NextResponse.json({ error: `Total weightage would exceed 100% (current: ${totalWeightage}%)` }, { status: 400 });
    }
    if (existingGoals.length >= 8) {
      return NextResponse.json({ error: 'Maximum 8 goals allowed per employee' }, { status: 400 });
    }

    const cycleIdToUse = cycleId || (await prisma.goalCycle.findFirst({ where: { isActive: true } }))?.id || 'c1';

    const goal = await prisma.goal.create({
      data: {
        title,
        description: description || '',
        thrustArea: thrustArea || '',
        uom: uom || 'Percentage',
        targetValue: targetValue || 100,
        weightage: weightage || 10,
        deadline: new Date(deadline || Date.now()),
        status: status || 'DRAFT',
        isShared: isShared || false,
        cycleId: cycleIdToUse,
        employeeId,
        departmentId: departmentId || null,
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: { userId: employeeId, action: 'GOAL_CREATED', newValue: `Created goal "${title}"` }
    });

    const employee = await prisma.user.findUnique({ where: { id: employeeId } });
    if (employee?.managerId) {
      await prisma.notification.create({
        data: { userId: employee.managerId, title: 'New Goal Submitted', message: `${employee.name} created a new goal: "${title}"` }
      });
    }

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { goalId, action, feedback, currentValue } = body;

    if (!goalId || !action) {
      return NextResponse.json({ error: 'goalId and action are required' }, { status: 400 });
    }

    const goal = await prisma.goal.findUnique({ where: { id: goalId }, include: { employee: true } });
    if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

    const employeeId = goal.employeeId;
    let newStatus = goal.status;

    switch (action) {
      case 'APPROVE':
        newStatus = 'APPROVED';
        await prisma.auditLog.create({ data: { userId: employeeId, action: 'GOAL_APPROVED', newValue: `Goal "${goal.title}" approved` } });
        await prisma.notification.create({ data: { userId: employeeId, title: 'Goal Approved', message: `Your goal "${goal.title}" has been approved.` } });
        break;
      case 'REJECT':
        newStatus = 'REWORK_REQUIRED';
        await prisma.auditLog.create({ data: { userId: employeeId, action: 'GOAL_REJECTED', newValue: `Goal "${goal.title}" sent back for rework` } });
        await prisma.notification.create({ data: { userId: employeeId, title: 'Goal Needs Rework', message: `Your goal "${goal.title}" needs revision. ${feedback || ''}` } });
        if (feedback) await prisma.comment.create({ data: { goalId, authorId: goal.employee.managerId || 'u2', text: feedback } });
        break;
      case 'SUBMIT':
        newStatus = 'PENDING_APPROVAL';
        await prisma.auditLog.create({ data: { userId: employeeId, action: 'GOAL_SUBMITTED', newValue: `Goal "${goal.title}" submitted for approval` } });
        if (goal.employee.managerId) {
          await prisma.notification.create({ data: { userId: goal.employee.managerId, title: 'Pending Approval', message: `${goal.employee.name} submitted "${goal.title}" for approval.` } });
        }
        break;
      case 'UPDATE_PROGRESS':
        if (currentValue !== undefined) {
          await prisma.goal.update({ where: { id: goalId }, data: { currentValue } });
          if (body.comment) {
            await prisma.comment.create({
              data: {
                goalId,
                authorId: employeeId,
                text: body.comment
              }
            });
          }
          await prisma.auditLog.create({ data: { userId: employeeId, action: 'PROGRESS_UPDATED', newValue: `Progress updated on "${goal.title}" to ${currentValue}. Note: ${body.comment || 'No note'}` } });
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (action !== 'UPDATE_PROGRESS') {
      await prisma.goal.update({ where: { id: goalId }, data: { status: newStatus } });
    }

    const updatedGoal = await prisma.goal.findUnique({ where: { id: goalId }, include: { employee: true, checkIns: true, cycle: true } });
    return NextResponse.json(updatedGoal);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
