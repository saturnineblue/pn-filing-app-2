import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getOrdersByNames, formatShippingAddress } from '@/lib/shopify'
import { submitMultipleToCustomsCity } from '@/lib/customscity-api'
import { format } from 'date-fns'

interface OrderInput {
  orderName: string
  trackingNumber: string
  products: Array<{
    productId: string
    quantity: number
  }>
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orders, estimatedArrivalDate } = body as {
      orders: OrderInput[]
      estimatedArrivalDate: string
    }

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: 'Orders array is required' },
        { status: 400 }
      )
    }

    if (!estimatedArrivalDate) {
      return NextResponse.json(
        { error: 'Estimated arrival date is required' },
        { status: 400 }
      )
    }

    // Get settings
    const settingsRecords = await prisma.settings.findMany()
    const settings: Record<string, string> = {}
    settingsRecords.forEach((s: { key: string; value: string }) => {
      settings[s.key] = s.value
    })

    // Fetch all Shopify orders
    const orderNames = orders.map(o => o.orderName)
    const shopifyOrders = await getOrdersByNames(orderNames)

    // Get all products
    const productIds = [...new Set(orders.flatMap(o => o.products.map(p => p.productId)))]
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, productCode: true }
    })
    const productMap = new Map<string, { id: string; productCode: string }>(
      products.map((p: { id: string; productCode: string }) => [p.id, p])
    )

    // Format the date
    const formattedDate = format(new Date(estimatedArrivalDate), 'MM/dd/yyyy')

    // Build CustomsCity documents
    const documents = []

    for (const order of orders) {
      const shopifyOrder = shopifyOrders.get(order.orderName)
      
      if (!shopifyOrder) {
        console.warn(`Order not found in Shopify: ${order.orderName}`)
        continue
      }

      const shippingInfo = formatShippingAddress(shopifyOrder)

      // Build products array for this order
      const orderProducts = []
      for (const productEntry of order.products) {
        const product = productMap.get(productEntry.productId)
        
        if (!product) {
          console.warn(`Product not found: ${productEntry.productId}`)
          continue
        }

        orderProducts.push({
          description: settings.csv_description || '',
          productId: product.productCode,
          pgaProductBaseUOM: settings.csv_pgaProductBaseUOM || '',
          pgaProductBaseQuantity: productEntry.quantity.toString(),
          pgaProductPackagingUOM1: settings.csv_pgaProductPackagingUOM1 || undefined,
          pgaProductQuantity1: settings.csv_pgaProductQuantity1 || undefined,
          pgaProductBaseUOM2: settings.csv_pgaProductBaseUOM2 || undefined,
          pgaProductBaseQuantity2: settings.csv_pgaProductBaseQuantity2 || undefined,
          pgaProductPackagingUOM3: settings.csv_pgaProductPackagingUOM3 || undefined,
          pgaProductQuantity3: settings.csv_pgaProductQuantity3 || undefined,
          pgaProductPackagingUOM4: settings.csv_pgaProductPackagingUOM4 || undefined,
          pgaProductQuantity4: settings.csv_pgaProductQuantity4 || undefined,
          pgaProductPackagingUOM5: settings.csv_pgaProductPackagingUOM5 || undefined,
          pgaProductQuantity5: settings.csv_pgaProductQuantity5 || undefined,
        })
      }

      if (orderProducts.length === 0) {
        continue
      }

      // Create CustomsCity document
      documents.push({
        entryType: settings.csv_entryType || '11',
        referenceQualifier: settings.csv_referenceQualifier || 'EXB',
        referenceNumber: settings.csv_referenceNumber === 'tracking' ? order.trackingNumber : (settings.csv_referenceNumber || ''),
        modeOfTransport: settings.csv_modeOfTransport || '50',
        noTrackingNumber: settings.csv_noTrackingNumber || 'N',
        billType: settings.csv_billType || 'T',
        mbolTripNumber: order.orderName,
        hbolShipmentControlNumber: order.trackingNumber,
        estimatedDateOfArrival: formattedDate,
        timeOfArrival: settings.csv_timeOfArrival || '11:30',
        usPortOfArrival: settings.csv_usPortOfArrival || '4701',
        equipmentNumber: settings.csv_equipmentNumber || '',
        shipper: {
          name: settings.csv_shipperName || '',
          address: settings.csv_shipperAddress || '',
          city: settings.csv_shipperCity || '',
          country: settings.csv_shipperCountry || '',
        },
        consignee: {
          name: shippingInfo.consigneeName,
          address: shippingInfo.consigneeAddress,
          city: shippingInfo.consigneeCity,
          stateOrProvince: shippingInfo.consigneeState,
          postalCode: shippingInfo.consigneePostalCode,
          country: shippingInfo.consigneeCountry,
        },
        products: orderProducts,
        carrier: {
          name: settings.csv_carrierName || 'POST',
          vesselName: settings.csv_vesselName || '',
          voyageTripFlightNumber: order.trackingNumber,
          railCarNumber: settings.csv_railCarNumber || '',
        },
      })
    }

    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'No valid documents to submit' },
        { status: 400 }
      )
    }

    // Submit to CustomsCity and store in database
    const result = await submitMultipleToCustomsCity(documents)
    
    // Store submissions in database
    const submissions = []
    for (let i = 0; i < result.results.length; i++) {
      const resultItem = result.results[i]
      const order = orders[i]
      
      submissions.push({
        orderName: order.orderName,
        trackingNumber: order.trackingNumber,
        documentId: resultItem.documentId || null,
        status: resultItem.success ? 'submitted' : 'failed',
        errorMessage: resultItem.success ? null : resultItem.message,
      })
    }
    
    // Bulk create submissions
    await prisma.submission.createMany({
      data: submissions,
      skipDuplicates: true,
    })

    return NextResponse.json({
      success: result.failed === 0,
      total: result.total,
      successful: result.successful,
      failed: result.failed,
      results: result.results,
      message: `Submitted ${result.successful} of ${result.total} documents. Check PNC History to retrieve PNC numbers.`,
    })

  } catch (error) {
    console.error('Submit to CustomsCity error:', error)
    return NextResponse.json(
      {
        error: 'Failed to submit to CustomsCity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
