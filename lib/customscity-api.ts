/**
 * CustomsCity API Client
 * Documentation: https://app.customscity.com/api-documentation
 */

const CUSTOMSCITY_API_BASE_URL = 'https://app.customscity.com/api'
const CUSTOMSCITY_API_KEY = process.env.CUSTOMSCITY_API_KEY

interface CustomsCityDocument {
  entryType: string
  referenceQualifier: string
  referenceNumber: string
  modeOfTransport: string
  hasTrackingNumber: boolean
  billType: string
  mbolTripNumber: string
  hbolShipmentControlNumber: string
  estimatedArrivalDate: string
  arrivalTime: string
  usPortOfArrival: string
  equipmentNumber: string
  shipper: {
    name: string
    address: string
    city: string
    country: string
  }
  consignee: {
    name: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  orderItemDescription?: string
  products: Array<{
    productId: string
    baseUom: string
    baseQuantity: number
    packagingUom1?: string
    packagingQuantity1?: number
    packagingUom2?: string
    packagingQuantity2?: number
    packagingUom3?: string
    packagingQuantity3?: number
    packagingUom4?: string
    packagingQuantity4?: number
    packagingUom5?: string
    packagingQuantity5?: number
  }>
  carrier: {
    name: string
    vesselName?: string
    voyageTripFlightNumber?: string
    railCarNumber?: string
  }
}

interface CustomsCityResponse {
  success: boolean
  documentId?: string
  message?: string
  errors?: Array<{ field: string; message: string }>
}

export async function submitToCustomsCity(
  document: CustomsCityDocument
): Promise<CustomsCityResponse> {
  try {
    if (!CUSTOMSCITY_API_KEY) {
      throw new Error('CustomsCity API key is not configured')
    }

    // Single POST to PN v2 endpoint
    const response = await fetch(`${CUSTOMSCITY_API_BASE_URL}/pn-v2/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CUSTOMSCITY_API_KEY}`,
      },
      body: JSON.stringify(document),
    })

    const responseText = await response.text()
    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      result = { message: responseText }
    }

    if (!response.ok) {
      throw new Error(
        result.message || `CustomsCity API error: ${response.status}`
      )
    }

    return {
      success: true,
      documentId: result.documentId || result.id || result.submissionId,
      message: result.message || 'Document submitted successfully to CustomsCity',
    }
  } catch (error) {
    console.error('CustomsCity API error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      errors: [
        {
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      ],
    }
  }
}

export async function submitMultipleToCustomsCity(
  documents: CustomsCityDocument[]
): Promise<{ total: number; successful: number; failed: number; results: CustomsCityResponse[] }> {
  const results: CustomsCityResponse[] = []
  let successful = 0
  let failed = 0

  for (const document of documents) {
    const result = await submitToCustomsCity(document)
    results.push(result)
    
    if (result.success) {
      successful++
    } else {
      failed++
    }

    // Small delay between submissions to avoid rate limiting
    if (documents.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return {
    total: documents.length,
    successful,
    failed,
    results,
  }
}
