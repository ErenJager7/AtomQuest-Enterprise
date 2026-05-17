import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, departmentName, jobTitle } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create or find department
    let department = await prisma.department.findUnique({ where: { name: departmentName || 'General' } });
    if (!department) {
      department = await prisma.department.create({ data: { name: departmentName || 'General' } });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role || 'EMPLOYEE',
        jobTitle: jobTitle || 'Team Member',
        departmentId: department.id
      },
      include: { department: true }
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
