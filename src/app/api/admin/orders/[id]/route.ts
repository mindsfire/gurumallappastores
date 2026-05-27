import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, utrNumber, resetUtr } = body;

    const data: Record<string, any> = {};

    if (resetUtr) {
      // Clear UTR and revert to PENDING_UTR so customer can resubmit
      data.utrNumber = null;
      data.status = 'PENDING_UTR';
    } else {
      if (status) data.status = status;
      if (utrNumber !== undefined) {
        const utr = String(utrNumber).trim();
        if (utr.length > 0 && utr.length < 12) {
          return NextResponse.json({ error: 'UTR must be at least 12 digits' }, { status: 400 });
        }
        data.utrNumber = utr.length === 0 ? null : utr;
        // If admin enters a UTR on a PENDING_UTR order, auto-advance status
        const current = await prisma.order.findUnique({ where: { id }, select: { status: true } });
        if (current?.status === 'PENDING_UTR' && data.utrNumber) {
          data.status = 'PENDING_VERIFICATION';
        }
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    try {
      const updatedOrder = await prisma.order.update({ where: { id }, data });
      return NextResponse.json({ success: true, order: updatedOrder });
    } catch (err: any) {
      if (err.code === 'P2002' && err.meta?.target?.includes('utrNumber')) {
        return NextResponse.json({ error: 'This UTR is already linked to another order' }, { status: 409 });
      }
      throw err;
    }
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
