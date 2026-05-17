import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  try {
    const { userId, name, email } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });

    // Create an audit log for the profile update
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PROFILE_UPDATED',
        newValue: `Updated profile for ${name}`,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
