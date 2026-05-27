import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This route is protected by the middleware, so we assume the user is authorized.
export async function GET() {
  try {
    // Lazy cleanup: auto-cancel PENDING_UTR orders older than 24h
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.order.updateMany({
      where: { status: 'PENDING_UTR', createdAt: { lt: cutoff } },
      data: { status: 'CANCELLED' },
    });

    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
