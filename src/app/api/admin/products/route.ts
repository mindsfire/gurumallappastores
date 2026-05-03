import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fetch all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ name: 'asc' }, { price: 'asc' }]
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// Create new product
export async function POST(request: Request) {
  try {
    const { name, unitSize, price, description } = await request.json();

    if (!name || !unitSize || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Name, unitSize, and a valid price are required' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        unitSize,
        price,
        description: description || null,
        isAvailable: true
      }
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// Update product (availability, price, name, unitSize)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Build update data - only include fields that were sent
    const data: any = {};
    if (typeof updates.isAvailable === 'boolean') data.isAvailable = updates.isAvailable;
    if (typeof updates.price === 'number' && updates.price > 0) data.price = updates.price;
    if (typeof updates.name === 'string' && updates.name.trim()) data.name = updates.name.trim();
    if (typeof updates.unitSize === 'string' && updates.unitSize.trim()) data.unitSize = updates.unitSize.trim();
    if (typeof updates.description === 'string') data.description = updates.description.trim() || null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// Delete product
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Check if product has any order items
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id }
    });

    if (orderItemCount > 0) {
      // Soft delete - mark as unavailable instead of deleting
      await prisma.product.update({
        where: { id },
        data: { isAvailable: false }
      });
      return NextResponse.json({ 
        success: true, 
        softDeleted: true,
        message: `Product has ${orderItemCount} past orders. Marked as unavailable instead of deleting.`
      });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
