interface ShopifyOrder {
  id: string
  name: string
  shippingAddress: {
    firstName: string | null
    lastName: string | null
    address1: string | null
    address2: string | null
    city: string | null
    province: string | null
    zip: string | null
    countryCodeV2: string | null
  } | null
}

interface ShopifyResponse {
  data?: {
    orders?: {
      edges: Array<{
        node: ShopifyOrder
      }>
    }
  }
  errors?: Array<{ message: string }>
}

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

async function shopifyFetch(query: string, variables?: Record<string, unknown>, retries = 3): Promise<ShopifyResponse> {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json`

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN || '',
        },
        body: JSON.stringify({ query, variables }),
      })

      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10)
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
        continue
      }

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (i === retries - 1) throw error
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }

  throw new Error('Failed to fetch from Shopify after retries')
}

export async function getOrderByName(orderName: string): Promise<ShopifyOrder | null> {
  const query = `
    query getOrder($query: String!) {
      orders(first: 1, query: $query) {
        edges {
          node {
            id
            name
            shippingAddress {
              firstName
              lastName
              address1
              address2
              city
              province
              zip
              countryCodeV2
            }
          }
        }
      }
    }
  `

  const variables = {
    query: `name:${orderName}`,
  }

  const response = await shopifyFetch(query, variables)

  if (response.errors) {
    console.error('Shopify API errors:', response.errors)
    return null
  }

  const orders = response.data?.orders?.edges || []
  return orders.length > 0 ? orders[0].node : null
}

export async function getOrdersByNames(orderNames: string[]): Promise<Map<string, ShopifyOrder>> {
  const orderMap = new Map<string, ShopifyOrder>()
  
  // Process in batches to avoid overwhelming the API
  const batchSize = 10
  for (let i = 0; i < orderNames.length; i += batchSize) {
    const batch = orderNames.slice(i, i + batchSize)
    const promises = batch.map(name => getOrderByName(name))
    
    const results = await Promise.all(promises)
    
    results.forEach((order, index) => {
      if (order) {
        orderMap.set(batch[index], order)
      }
    })
    
    // Small delay between batches
    if (i + batchSize < orderNames.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  return orderMap
}

export function formatShippingAddress(order: ShopifyOrder): {
  consigneeName: string
  consigneeAddress: string
  consigneeCity: string
  consigneeState: string
  consigneePostalCode: string
  consigneeCountry: string
} {
  const addr = order.shippingAddress

  return {
    consigneeName: addr
      ? `${addr.firstName || ''} ${addr.lastName || ''}`.trim()
      : '',
    consigneeAddress: addr
      ? [addr.address1, addr.address2].filter(Boolean).join(' ')
      : '',
    consigneeCity: addr?.city || '',
    consigneeState: addr?.province || '',
    consigneePostalCode: addr?.zip || '',
    consigneeCountry: addr?.countryCodeV2 || '',
  }
}
