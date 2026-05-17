import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({ include: { checkIns: true } });

    const byThrustAreaMap: Record<string, number> = {};
    const byUoMMap: Record<string, number> = {};
    const byStatusMap: Record<string, number> = {};

    goals.forEach(g => {
      const area = g.thrustArea || 'General';
      byThrustAreaMap[area] = (byThrustAreaMap[area] || 0) + 1;
      byUoMMap[g.uom] = (byUoMMap[g.uom] || 0) + 1;
      byStatusMap[g.status] = (byStatusMap[g.status] || 0) + 1;
    });

    const byThrustArea = Object.entries(byThrustAreaMap).map(([area, count]) => ({ area, count }));
    const byUoM = Object.entries(byUoMMap).map(([type, count]) => ({ type, count }));
    const byStatus = Object.entries(byStatusMap).map(([status, count]) => ({ status, count }));

    return NextResponse.json({ byThrustArea, byUoM, byStatus });
  } catch {
    return NextResponse.json({ byThrustArea: [], byUoM: [], byStatus: [] });
  }
}
