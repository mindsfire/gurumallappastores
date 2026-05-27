import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ shortId: string }> }) {
  try {
    const { shortId } = await params;
    const { utrNumber } = await request.json();

    if (!utrNumber || utrNumber.length < 12) {
      return NextResponse.json({ error: 'Please enter a valid 12-digit UTR number.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { shortId } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.status !== 'PENDING_UTR') {
      return NextResponse.json({ error: 'UTR has already been submitted for this order.' }, { status: 409 });
    }

    // Check if this UTR is already used on another order
    const duplicate = await prisma.order.findFirst({ where: { utrNumber, NOT: { shortId } } });
    if (duplicate) {
      return NextResponse.json(
        { error: `This UTR is already linked to order ${duplicate.shortId}. If you believe this is an error, please contact us.` },
        { status: 409 }
      );
    }

    await prisma.order.update({
      where: { shortId },
      data: { utrNumber, status: 'PENDING_VERIFICATION' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('UTR submission error:', error);
    return NextResponse.json({ error: 'Failed to submit UTR.' }, { status: 500 });
  }
}
