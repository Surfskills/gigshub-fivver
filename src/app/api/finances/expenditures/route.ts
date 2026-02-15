import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    console.error('Expenditure API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to add expenditure' },
      { status: 500 }
    );
  }
}
