import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { itemName, typeOfExpenditure, cost, transactionId } = body;

    if (!itemName?.trim() || !typeOfExpenditure || cost == null) {
      return NextResponse.json(
        { error: 'itemName, typeOfExpenditure, and cost are required' },
        { status: 400 }
      );
    }

    const validTypes = ['internet', 'rent', 'proxy', 'electricity', 'water', 'meals', 'office_furniture', 'electronics'];
    if (!validTypes.includes(typeOfExpenditure)) {
      return NextResponse.json(
        { error: 'Invalid typeOfExpenditure' },
        { status: 400 }
      );
    }

    const numCost = Number(cost);
    if (Number.isNaN(numCost) || numCost < 0) {
      return NextResponse.json(
        { error: 'cost must be a non-negative number' },
        { status: 400 }
      );
    }

    const expenditure = await db.expenditure.create({
      data: {
        itemName: itemName.trim(),
        typeOfExpenditure,
        cost: numCost,
        transactionId: transactionId?.toString().trim() || null,
      },
    });

    return NextResponse.json(expenditure);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to add expenditure';
    if (msg === 'Unauthorized') {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    if (msg === 'Forbidden') {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    console.error('Expenditure API error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
