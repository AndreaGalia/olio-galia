// app/api/products/base/route.ts
import { NextResponse } from 'next/server';
import baseProductsData from '@/data/products/base.json';

export async function GET() {
  try {
    return NextResponse.json(baseProductsData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load base products' },
      { status: 500 }
    );
  }
}

