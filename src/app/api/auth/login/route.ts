import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Attempt Supabase login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      // If Supabase fails but we are testing locally without real keys, we can fallback to Prisma ONLY if it's the demo accounts
      // To strictly adhere to "Remove default users" and "Production ready", we should NOT fallback.
      return NextResponse.json({ error: authError?.message || 'Invalid email or password' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { department: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User record not found in database' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Login endpoint is operational' });
}
