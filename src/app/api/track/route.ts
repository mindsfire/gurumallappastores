import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { phone, pincode } = await request.json();

    if (!phone || !pincode) {
      return NextResponse.json({ error: 'Mobile Number and Pincode are required.' }, { status: 400 });
    }

    // Find all customers with this phone number
    const customersWithPhone = await prisma.customer.findMany({
      where: { phone }
    });

    if (customersWithPhone.length === 0) {
      return NextResponse.json({ error: 'No orders found for this mobile number.' }, { status: 404 });
    }

    // Check if the provided pincode matches any of their delivery pincodes
    const isPincodeValid = customersWithPhone.some(c => c.pincode === pincode);

    if (!isPincodeValid) {
      return NextResponse.json({ error: 'The pincode does not match our records for this mobile number.' }, { status: 401 });
    }

    // If verification passes, get all customer IDs for this phone number
    const customerIds = customersWithPhone.map(c => c.id);

    // Fetch all orders for these customer IDs
    const orders = await prisma.order.findMany({
      where: {
        customerId: {
          in: customerIds
        }
      },
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
    console.error('Tracking error:', error);
    return NextResponse.json({ error: 'Failed to fetch order history' }, { status: 500 });
  }
}
