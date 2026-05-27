import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const normalizePhone = (p: string) => p.replace(/\D/g, '').slice(-10);

export async function GET(request: Request, { params }: { params: Promise<{ shortId: string }> }) {
  try {
    const { shortId } = await params;
    const phone = new URL(request.url).searchParams.get('phone');

    if (!phone || normalizePhone(phone).length !== 10) {
      return NextResponse.json({ error: 'Phone required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { shortId },
      select: { status: true, customer: { select: { phone: true } } },
    });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (normalizePhone(order.customer.phone) !== normalizePhone(phone)) {
      return NextResponse.json({ error: 'Phone mismatch' }, { status: 403 });
    }

    return NextResponse.json({ status: order.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order status' }, { status: 500 });
  }
}
