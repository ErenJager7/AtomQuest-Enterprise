import { store } from '@/lib/store';
import { NextResponse } from 'next/server';
import { GoalStatus, QuarterStatus, Role } from '@/lib/store';

export async function POST() {
  const existingGoals = store.getGoals();
  if (existingGoals.length > 50) {
    return NextResponse.json({ message: 'Already seeded' });
  }

  // 1. Ensure 5 Departments
  const deptNames = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations'];
  const depts = deptNames.map(n => store.addDepartment(n));

  // 2. Create 5 Managers (1 per dept)
  const managers = depts.map((d, i) => store.addUser({
    email: `manager${i}@atomquest.inc`,
    password: 'password',
    name: `Manager ${d.name}`,
    role: Role.MANAGER,
    jobTitle: `Director of ${d.name}`,
    departmentId: d.id,
    managerId: null
  }));

  // 3. Create 45 Employees (9 per manager)
  const employees: any[] = [];
  managers.forEach(m => {
    for (let i = 0; i < 9; i++) {
      employees.push(store.addUser({
        email: `emp${m.id}_${i}@atomquest.inc`,
        password: 'password',
        name: `Emp ${i} ${m.name.split(' ')[1]}`,
        role: Role.EMPLOYEE,
        jobTitle: `Specialist`,
        departmentId: m.departmentId,
        managerId: m.id
      }));
    }
  });

  const allStaff = [...managers, ...employees];
  const apiKey = process.env.GEMINI_API_KEY;

  let generatedGoals = [];
  const defaultGoals = [
    { title: 'Increase system reliability', thrustArea: 'Engineering Excellence', uom: 'Percentage', targetValue: 99.9, weightage: 25, status: GoalStatus.APPROVED },
    { title: 'Close 10 enterprise deals', thrustArea: 'Growth', uom: 'Count', targetValue: 10, weightage: 30, status: GoalStatus.APPROVED },
    { title: 'Launch Q3 Marketing Campaign', thrustArea: 'Innovation', uom: 'Percentage', targetValue: 100, weightage: 20, status: GoalStatus.APPROVED },
    { title: 'Reduce hiring time by 15 days', thrustArea: 'Efficiency', uom: 'Days', targetValue: 30, weightage: 25, status: GoalStatus.APPROVED }
  ];

  if (apiKey) {
    try {
      const prompt = `Generate 200 realistic employee goals for a tech company. Include varied departments. Return strict JSON array ONLY with properties: { "title": "string", "description": "string", "thrustArea": "string", "uom": "string", "targetValue": number, "weightage": number }. Just give me around 20 varied examples that I can loop over.`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          generatedGoals = JSON.parse(text);
        }
      }
    } catch (e) {
      console.error('AI seed failed, using fallback', e);
    }
  }

  if (!generatedGoals || generatedGoals.length === 0) {
    generatedGoals = defaultGoals;
  }

  // 4. Assign goals to employees
  const cycles = store.getCycles();
  const activeCycleId = cycles.find(c => c.isActive)?.id || 'c1';

  allStaff.forEach(emp => {
    // Give each person 4 goals (200 goals total for 50 people)
    let currentWeightage = 0;
    for (let i = 0; i < 4; i++) {
      const template = generatedGoals[Math.floor(Math.random() * generatedGoals.length)];
      const weight = i === 3 ? 100 - currentWeightage : 25;
      currentWeightage += weight;

      const g = store.addGoal({
        title: `${template.title} - ${emp.name.split(' ')[0]}`,
        description: template.description || 'Auto-generated description',
        thrustArea: template.thrustArea || 'Growth',
        uom: template.uom || 'Percentage',
        targetValue: template.targetValue || 100,
        weightage: weight,
        deadline: new Date('2024-12-31'),
        status: GoalStatus.APPROVED,
        isShared: false,
        cycleId: activeCycleId,
        employeeId: emp.id,
        departmentId: emp.departmentId
      });

      // 5. Generate Check-in data for Q1, Q2, Q3
      for (let q = 1; q <= 3; q++) {
        const baseAchieve = 78; // Mean
        const variance = (Math.random() * 24) - 12; // +/- 12
        const achievement = Math.min(100, Math.max(0, Math.round(baseAchieve + variance)));
        
        let qStatus = QuarterStatus.ON_TRACK;
        if (achievement < 60) qStatus = QuarterStatus.AT_RISK;
        else if (achievement < 75) qStatus = QuarterStatus.DELAYED;
        else if (achievement > 95) qStatus = QuarterStatus.COMPLETED;

        store.addCheckIn({
          goalId: g.id,
          quarter: q,
          status: qStatus,
          notes: `Check-in for Q${q}`,
          achievement,
          feedback: 'Good progress',
          reviewedBy: emp.managerId
        });
      }
    }
  });

  return NextResponse.json({ success: true, message: `Seeded ${allStaff.length} employees and ~${allStaff.length * 4} goals.` });
}
