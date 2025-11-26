import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { nickname: 'asc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { nickname, productCode } = await request.json()

    if (!nickname || !productCode) {
      return NextResponse.json({ error: 'Nickname and product code are required' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: { nickname, productCode }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
