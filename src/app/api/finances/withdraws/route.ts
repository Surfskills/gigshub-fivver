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
    const { accountId, amount, withdrawDate, paymentMeans, notes } = body;

    if (!accountId || amount == null || !withdrawDate) {
      return NextResponse.json(
        { error: 'accountId, amount, and withdrawDate are required' },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number' },
        { status: 400 }
      );
    }

    const withdraw = await db.withdraw.create({
      data: {
        accountId,
        amount: numAmount,
        withdrawDate: new Date(withdrawDate),
        paymentMeans: (paymentMeans ?? 'Other').toString().trim() || 'Other',
        notes: notes?.toString().trim() || null,
      },
    });

    return NextResponse.json(withdraw);
  } catch (err) {
    console.error('Withdraw API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to add withdrawal' },
      { status: 500 }
    );
  }
}
