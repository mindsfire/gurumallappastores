import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fetch all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// Update product stock
export async function PATCH(request: Request) {
  try {
    const { id, isAvailable } = await request.json();
    
    if (typeof isAvailable !== 'boolean') {
      return NextResponse.json({ error: 'isAvailable boolean is required' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isAvailable }
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Update stock error:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
