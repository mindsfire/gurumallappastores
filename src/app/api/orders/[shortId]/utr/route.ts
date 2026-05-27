import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const normalizePhone = (p: string) => p.replace(/\D/g, '').slice(-10);

export async function PATCH(request: Request, { params }: { params: Promise<{ shortId: string }> }) {
  try {
    const { shortId } = await params;
    const { utrNumber, phone } = await request.json();

    if (!phone || normalizePhone(phone).length !== 10) {
      return NextResponse.json({ error: 'Please verify your mobile number to continue.' }, { status: 400 });
    }

    if (!utrNumber || utrNumber.length < 12) {
      return NextResponse.json({ error: 'Please enter a valid 12-digit UTR number.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { shortId },
      include: { customer: { select: { phone: true } } },
    });
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Phone-match check — prevents strangers from submitting UTRs on a guessed shortId
    if (normalizePhone(order.customer.phone) !== normalizePhone(phone)) {
      return NextResponse.json({ error: 'Mobile number does not match this order.' }, { status: 403 });
    }

    if (order.status !== 'PENDING_UTR') {
      return NextResponse.json({ error: 'UTR has already been submitted for this order.' }, { status: 409 });
    }

    try {
      await prisma.order.update({
        where: { shortId },
        data: { utrNumber, status: 'PENDING_VERIFICATION' },
      });
    } catch (err: any) {
      // Unique-constraint race: this UTR is on another order
      if (err.code === 'P2002' && err.meta?.target?.includes('utrNumber')) {
        return NextResponse.json(
          { error: 'This UTR is already linked to another order. If you believe this is an error, please contact us.' },
          { status: 409 }
        );
      }
      throw err;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('UTR submission error:', error);
    return NextResponse.json({ error: 'Failed to submit UTR.' }, { status: 500 });
  }
}
