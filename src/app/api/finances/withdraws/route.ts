import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();

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
    const msg = err instanceof Error ? err.message : 'Failed to add withdrawal';
    if (msg === 'Unauthorized') {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    if (msg === 'Forbidden') {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    console.error('Withdraw API error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
