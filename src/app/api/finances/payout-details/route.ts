import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { accountId, paymentGateway, mobileNumber } = body;

    if (!accountId || !paymentGateway) {
      return NextResponse.json(
        { error: 'accountId and paymentGateway are required' },
        { status: 400 }
      );
    }

    const validGateways = ['bank', 'paypal', 'payoneer'];
    if (!validGateways.includes(paymentGateway)) {
      return NextResponse.json(
        { error: 'Invalid paymentGateway' },
        { status: 400 }
      );
    }

    const payoutDetail = await db.payoutDetail.upsert({
      where: { accountId },
      create: {
        accountId,
        paymentGateway,
        mobileNumber: mobileNumber?.toString().trim() || null,
      },
      update: {
        paymentGateway,
        mobileNumber: mobileNumber?.toString().trim() || null,
      },
    });

    return NextResponse.json(payoutDetail);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save payout details';
    if (msg === 'Unauthorized') {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    if (msg === 'Forbidden') {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    console.error('Payout detail API error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
