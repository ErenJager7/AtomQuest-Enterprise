import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const goals = await prisma.goal.findMany({
      where: { employeeId: userId },
      include: { checkIns: true }
    });

    const metrics = {
      totalGoals: goals.length,
      onTrack: goals.filter(g => g.checkIns?.[0]?.status === 'ON_TRACK').length,
      delayed: goals.filter(g => g.checkIns?.[0]?.status === 'DELAYED').length,
      atRisk: goals.filter(g => g.checkIns?.[0]?.status === 'AT_RISK').length,
      completed: goals.filter(g => g.checkIns?.[0]?.status === 'COMPLETED').length,
      pendingApproval: goals.filter(g => g.status === 'PENDING_APPROVAL').length,
      overallProgress: Math.round(
        goals.reduce((acc, g) => {
          const progress = Math.min((g.currentValue / g.targetValue) * 100, 100);
          return acc + progress * (g.weightage / 100);
        }, 0)
      ) || 0
    };

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
