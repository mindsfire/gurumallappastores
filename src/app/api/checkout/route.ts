import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate a random short ID like GMS-XXXX
function generateShortId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `GMS-${randomNum}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items, totalAmount, utrNumber } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!customer.name || !customer.phone || !customer.address || !customer.city || !customer.pincode) {
      return NextResponse.json({ error: 'Missing customer details' }, { status: 400 });
    }

    if (!customer.pincode.match(/^57[01][0-9]{3}$/)) {
      return NextResponse.json({ error: 'Delivery is strictly restricted to Mysuru district pincodes (570xxx or 571xxx)' }, { status: 400 });
    }

    if (!utrNumber || utrNumber.length < 12) {
      return NextResponse.json({ error: 'Valid 12-digit UTR is required' }, { status: 400 });
    }

    // Reject if this UTR was already used for another order
    const existingOrder = await prisma.order.findUnique({ where: { utrNumber } });
    if (existingOrder) {
      return NextResponse.json(
        { error: `This UTR number is already linked to order ${existingOrder.shortId}. If you believe this is an error, please contact us.` },
        { status: 409 }
      );
    }

    // Upsert customer by phone — keeps one record per customer so tracking always uses current pincode
    const customerData = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || null,
      address: customer.address,
      city: customer.city,
      pincode: customer.pincode,
    };
    const existingCustomer = await prisma.customer.findFirst({
      where: { phone: customer.phone },
      orderBy: { createdAt: 'desc' },
    });
    const savedCustomer = existingCustomer
      ? await prisma.customer.update({ where: { id: existingCustomer.id }, data: customerData })
      : await prisma.customer.create({ data: customerData });

    // Retry up to 5 times on shortId collision (P2002 unique constraint)
    let newOrder;
    for (let attempt = 1; attempt <= 5; attempt++) {
      const shortId = generateShortId();
      try {
        newOrder = await prisma.order.create({
          data: {
            shortId,
            customerId: savedCustomer.id,
            totalAmount,
            utrNumber,
            status: 'PENDING_VERIFICATION',
            items: {
              create: items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          }
        });
        break; // success — exit retry loop
      } catch (err: any) {
        if (err.code === 'P2002' && err.meta?.target?.includes('shortId') && attempt < 5) {
          continue; // shortId collision — retry with a new ID
        }
        throw err; // any other error, or exhausted retries
      }
    }

    return NextResponse.json({ success: true, orderId: newOrder!.shortId });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
