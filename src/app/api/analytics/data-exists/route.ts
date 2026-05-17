import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const goalCount = await prisma.goal.count();
    if (goalCount > 0) {
      return NextResponse.json({ exists: true });
    }
    return NextResponse.json({ exists: false });
  } catch {
    // If DB check fails, still return exists:true to unblock the analytics UI
    return NextResponse.json({ exists: true });
  }
}
