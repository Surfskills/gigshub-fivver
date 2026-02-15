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
    console.error('Payout detail API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save payout details' },
      { status: 500 }
    );
  }
}
