import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ shortId: string }> }) {
  try {
    const { shortId } = await params;
    const order = await prisma.order.findUnique({ where: { shortId }, select: { status: true } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ status: order.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order status' }, { status: 500 });
  }
}
