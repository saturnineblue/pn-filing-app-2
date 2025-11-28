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
  let documents: any[] = []
  
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

    // Format the date for API (YYYYMMDD)
    const formattedDate = format(new Date(estimatedArrivalDate), 'yyyyMMdd')
    const formattedTime = settings.csv_timeOfArrival || '11:30'

    // Build CustomsCity documents (FDA PN format)
    documents = []

    for (const order of orders) {
      const shopifyOrder = shopifyOrders.get(order.orderName)
      
      if (!shopifyOrder) {
        console.warn(`Order not found in Shopify: ${order.orderName}`)
        continue
      }

      const shippingInfo = formatShippingAddress(shopifyOrder)

      // Build items array for this order - each product becomes an item
      const items = []
      let lineNumber = 1
      
      for (const productEntry of order.products) {
        const product = productMap.get(productEntry.productId)
        
        if (!product) {
          console.warn(`Product not found: ${productEntry.productId}`)
          continue
        }

        // Build packaging array
        const packaging = []
        if (settings.csv_pgaProductBaseUOM && productEntry.quantity) {
          packaging.push({
            quantity: productEntry.quantity,
            unitOfMeasure: settings.csv_pgaProductBaseUOM
          })
        }
        if (settings.csv_pgaProductPackagingUOM1 && settings.csv_pgaProductQuantity1) {
          packaging.push({
            quantity: parseInt(settings.csv_pgaProductQuantity1),
            unitOfMeasure: settings.csv_pgaProductPackagingUOM1
          })
        }
        if (settings.csv_pgaProductBaseUOM2 && settings.csv_pgaProductBaseQuantity2) {
          packaging.push({
            quantity: parseInt(settings.csv_pgaProductBaseQuantity2),
            unitOfMeasure: settings.csv_pgaProductBaseUOM2
          })
        }
        if (settings.csv_pgaProductPackagingUOM3 && settings.csv_pgaProductQuantity3) {
          packaging.push({
            quantity: parseInt(settings.csv_pgaProductQuantity3),
            unitOfMeasure: settings.csv_pgaProductPackagingUOM3
          })
        }
        if (settings.csv_pgaProductPackagingUOM4 && settings.csv_pgaProductQuantity4) {
          packaging.push({
            quantity: parseInt(settings.csv_pgaProductQuantity4),
            unitOfMeasure: settings.csv_pgaProductPackagingUOM4
          })
        }
        if (settings.csv_pgaProductPackagingUOM5 && settings.csv_pgaProductQuantity5) {
          packaging.push({
            quantity: parseInt(settings.csv_pgaProductQuantity5),
            unitOfMeasure: settings.csv_pgaProductPackagingUOM5
          })
        }

        items.push({
          pgaLineNumber: lineNumber++,
          productCode: product.productCode,
          productDescription: settings.csv_description || undefined,
          countryOfShipment: settings.csv_shipperCountry || undefined,
          ultimateConsigneeName: shippingInfo.consigneeName,
          ultimateConsigneeFeiOrDunsCode: null,
          ultimateConsigneeFeiOrDuns: null,
          ultimateConsigneeAddress: shippingInfo.consigneeAddress,
          ultimateConsigneeAddress2: null,
          ultimateConsigneeUnitNumber: null,
          ultimateConsigneeCountry: shippingInfo.consigneeCountry,
          ultimateConsigneeStateOrProvince: shippingInfo.consigneeState,
          ultimateConsigneeCity: shippingInfo.consigneeCity,
          ultimateConsigneeZipPostalCode: shippingInfo.consigneePostalCode,
          shipperName: settings.csv_shipperName || '',
          shipperFeiOrDunsCode: null,
          shipperFeiOrDuns: null,
          shipperAddress: settings.csv_shipperAddress || '',
          shipperAddress2: null,
          shipperUnitNumber: null,
          shipperCountry: settings.csv_shipperCountry || '',
          shipperStateOrProvince: null,
          shipperCity: settings.csv_shipperCity || '',
          shipperZipPostalCode: null,
          packaging: packaging,
          itemDescription: settings.csv_description || undefined
        })
      }

      if (items.length === 0) {
        continue
      }

      // Create CustomsCity FDA PN document
      documents.push({
        type: 'fda-pn' as const,
        send: false,
        sendAs: 'add' as const,
        body: [{
          pncNumber: null,
          entryType: settings.csv_entryType || '86',
          referenceQualifier: settings.csv_referenceQualifier || 'AWB',
          modeOfTransport: settings.csv_modeOfTransport || '40',
          referenceNumber: settings.csv_referenceNumber === 'tracking' ? order.trackingNumber : null,
          entryNumber: null,
          ftzAdmission: null,
          inbondNumber: null,
          billType: settings.csv_billType || 'M',
          MBOLNumber: order.orderName,
          HBOLNumber: order.trackingNumber,
          trip: null,
          scnBol: null,
          consolidationId: null,
          expressCarrierTrackingNumber: null,
          importingCarrier: null,
          dateOfArrival: formattedDate,
          timeOfArrival: formattedTime,
          portOfArrival: settings.csv_usPortOfArrival || '2721',
          equipmentNumber: settings.csv_equipmentNumber || null,
          oiDescription: settings.csv_description || undefined,
          carrierName: settings.csv_carrierName || 'POST',
          vesselName: settings.csv_vesselName || null,
          voyageNumber: order.trackingNumber,
          railCarNumber: settings.csv_railCarNumber || null,
          items: items
        }]
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

    // Always return the constructed payload for debugging
    return NextResponse.json({
      success: result.failed === 0,
      total: result.total,
      successful: result.successful,
      failed: result.failed,
      results: result.results,
      apiPayload: documents,
      message: `Submitted ${result.successful} of ${result.total} documents. Check PNC History to retrieve PNC numbers.`,
    })

  } catch (error) {
    console.error('Submit to CustomsCity error:', error)
    return NextResponse.json(
      {
        error: 'Failed to submit to CustomsCity',
        details: error instanceof Error ? error.message : 'Unknown error',
        apiPayload: documents.length > 0 ? documents : null,
      },
      { status: 500 }
    )
  }
}
