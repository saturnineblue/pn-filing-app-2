import { NextResponse } from 'next/server'
import { generateCSVRows, convertToCSVString, type OrderInput } from '@/lib/csv-generator'

export async function POST(request: Request) {
  try {
    const { orders, estimatedArrivalDate } = await request.json() as {
      orders: OrderInput[]
      estimatedArrivalDate: string
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'No orders provided' }, { status: 400 })
    }

    if (!estimatedArrivalDate) {
      return NextResponse.json({ error: 'Estimated arrival date is required' }, { status: 400 })
    }

    const arrivalDate = new Date(estimatedArrivalDate)
    const rows = await generateCSVRows(orders, arrivalDate)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid rows generated' }, { status: 400 })
    }

    const csvContent = convertToCSVString(rows)

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="pn-filing.csv"',
      },
    })
  } catch (error) {
    console.error('Failed to generate CSV:', error)
    return NextResponse.json({ error: 'Failed to generate CSV' }, { status: 500 })
  }
}
