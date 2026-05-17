import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const departmentId = searchParams.get('departmentId');
  const managerId = searchParams.get('managerId');

  const where: any = {};
  if (role) where.role = role;
  if (departmentId) where.departmentId = departmentId;
  if (managerId) where.managerId = managerId;

  const users = await prisma.user.findMany({
    where,
    include: { department: true }
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, role, jobTitle, departmentId, managerId } = body;

    if (!email || !name || !jobTitle || !departmentId) {
      return NextResponse.json({ error: 'Email, name, jobTitle, and departmentId are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role || 'EMPLOYEE',
        jobTitle,
        departmentId,
        managerId: managerId || null,
      },
      include: { department: true }
    });

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'USER_CREATED', newValue: `New employee "${name}" added` }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
