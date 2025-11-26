import { format } from 'date-fns'
import { prisma } from '@/lib/db'
import { getOrdersByNames, formatShippingAddress } from '@/lib/shopify'

export interface OrderInput {
  orderName: string
  trackingNumber: string
  products: Array<{
    productId: string
    quantity: number
  }>
}

export interface CSVRow {
  'Entry Type': string
  'Reference Qualifier': string
  'Reference Number': string
  'Mode of Transport': string
  'I dont have a Tracking Number': string
  'Bill Type': string
  'MBOL/TRIP Number': string
  'HBOL/ Shipment Control Number': string
  'Estimate Date of Arrival': string
  'Time of Arrival': string
  'US Port of Arrival': string
  'Equipment Number': string
  'Shipper Name': string
  'Shipper Address': string
  'Shipper City': string
  'Shipper Country': string
  'Consignee Name': string
  'Consignee Address': string
  'Consignee City': string
  'Consignee State or Province': string
  'Consignee Postal Code': string
  'Consignee Country': string
  'Description': string
  'Product ID': string
  'PGA Product Base UOM': string
  'PGA Product Base Quantity': string
  'PGA Product Packaging UOM 1': string
  'PGA Product Quantity 1': string
  'PGA Product Base UOM 2': string
  'PGA Product Base Quantity 2': string
  'PGA Product Packaging UOM 3': string
  'PGA Product Quantity 3': string
  'PGA Product Packaging UOM 4': string
  'PGA Product Quantity 4': string
  'PGA Product Packaging UOM 5': string
  'PGA Product Quantity 5': string
  'Carrier Name': string
  'Vessel Name': string
  'Voyage Trip Flight Number': string
  'Rail Car Number': string
}

async function getSettings(): Promise<Record<string, string>> {
  const settings = await prisma.settings.findMany()
  const settingsMap: Record<string, string> = {}
  settings.forEach((s: { key: string; value: string }) => {
    settingsMap[s.key] = s.value
  })
  return settingsMap
}

export async function generateCSVRows(
  orders: OrderInput[],
  estimatedArrivalDate: Date
): Promise<CSVRow[]> {
  const settings = await getSettings()
  const rows: CSVRow[] = []

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
  const formattedDate = format(estimatedArrivalDate, 'MM/dd/yyyy')

  // Process each order
  for (const order of orders) {
    const shopifyOrder = shopifyOrders.get(order.orderName)
    
    if (!shopifyOrder) {
      console.warn(`Order not found in Shopify: ${order.orderName}`)
      continue
    }

    const shippingInfo = formatShippingAddress(shopifyOrder)

    // Generate a row for each product in the order
    for (const productEntry of order.products) {
      const product = productMap.get(productEntry.productId)
      
      if (!product) {
        console.warn(`Product not found: ${productEntry.productId}`)
        continue
      }

      // Type assertion to ensure TypeScript knows the product type
      const typedProduct: { id: string; productCode: string } = product

      const row: CSVRow = {
        'Entry Type': settings.csv_entryType || '11',
        'Reference Qualifier': settings.csv_referenceQualifier || 'EXB',
        'Reference Number': settings.csv_referenceNumber === 'tracking' ? order.trackingNumber : (settings.csv_referenceNumber || ''),
        'Mode of Transport': settings.csv_modeOfTransport || '50',
        'I dont have a Tracking Number': settings.csv_noTrackingNumber || 'N',
        'Bill Type': settings.csv_billType || 'T',
        'MBOL/TRIP Number': order.orderName,
        'HBOL/ Shipment Control Number': order.trackingNumber,
        'Estimate Date of Arrival': formattedDate,
        'Time of Arrival': settings.csv_timeOfArrival || '11:30',
        'US Port of Arrival': settings.csv_usPortOfArrival || '4701',
        'Equipment Number': settings.csv_equipmentNumber || '',
        'Shipper Name': settings.csv_shipperName || '',
        'Shipper Address': settings.csv_shipperAddress || '',
        'Shipper City': settings.csv_shipperCity || '',
        'Shipper Country': settings.csv_shipperCountry || '',
        'Consignee Name': shippingInfo.consigneeName,
        'Consignee Address': shippingInfo.consigneeAddress,
        'Consignee City': shippingInfo.consigneeCity,
        'Consignee State or Province': shippingInfo.consigneeState,
        'Consignee Postal Code': shippingInfo.consigneePostalCode,
        'Consignee Country': shippingInfo.consigneeCountry,
        'Description': settings.csv_description || '',
        'Product ID': typedProduct.productCode,
        'PGA Product Base UOM': settings.csv_pgaProductBaseUOM || '',
        'PGA Product Base Quantity': productEntry.quantity.toString(),
        'PGA Product Packaging UOM 1': settings.csv_pgaProductPackagingUOM1 || '',
        'PGA Product Quantity 1': settings.csv_pgaProductQuantity1 || '',
        'PGA Product Base UOM 2': settings.csv_pgaProductBaseUOM2 || '',
        'PGA Product Base Quantity 2': settings.csv_pgaProductBaseQuantity2 || '',
        'PGA Product Packaging UOM 3': settings.csv_pgaProductPackagingUOM3 || '',
        'PGA Product Quantity 3': settings.csv_pgaProductQuantity3 || '',
        'PGA Product Packaging UOM 4': settings.csv_pgaProductPackagingUOM4 || '',
        'PGA Product Quantity 4': settings.csv_pgaProductQuantity4 || '',
        'PGA Product Packaging UOM 5': settings.csv_pgaProductPackagingUOM5 || '',
        'PGA Product Quantity 5': settings.csv_pgaProductQuantity5 || '',
        'Carrier Name': settings.csv_carrierName || 'POST',
        'Vessel Name': settings.csv_vesselName || '',
        'Voyage Trip Flight Number': order.trackingNumber,
        'Rail Car Number': settings.csv_railCarNumber || '',
      }

      rows.push(row)
    }
  }

  return rows
}

export function convertToCSVString(rows: CSVRow[]): string {
  if (rows.length === 0) {
    return ''
  }

  // Get headers from the first row
  const headers = Object.keys(rows[0]) as Array<keyof CSVRow>
  
  // Create CSV header
  const headerRow = headers.map(h => `"${h}"`).join(',')
  
  // Create data rows
  const dataRows = rows.map(row => {
    return headers.map(header => {
      const value = row[header] || ''
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`
    }).join(',')
  })
  
  return [headerRow, ...dataRows].join('\n')
}
