/**
 * CustomsCity API Client
 * Documentation: https://app.customscity.com/api-documentation
 */

const CUSTOMSCITY_API_BASE_URL = 'https://api.customscity.com'
const CUSTOMSCITY_API_KEY = process.env.CUSTOMSCITY_API_KEY

interface CustomsCityDocument {
  entryType: string
  referenceQualifier: string
  referenceNumber: string
  modeOfTransport: string
  noTrackingNumber: string
  billType: string
  mbolTripNumber: string
  hbolShipmentControlNumber: string
  estimatedDateOfArrival: string
  timeOfArrival: string
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
    stateOrProvince: string
    postalCode: string
    country: string
  }
  products: Array<{
    description: string
    productId: string
    pgaProductBaseUOM: string
    pgaProductBaseQuantity: string
    pgaProductPackagingUOM1?: string
    pgaProductQuantity1?: string
    pgaProductBaseUOM2?: string
    pgaProductBaseQuantity2?: string
    pgaProductPackagingUOM3?: string
    pgaProductQuantity3?: string
    pgaProductPackagingUOM4?: string
    pgaProductQuantity4?: string
    pgaProductPackagingUOM5?: string
    pgaProductQuantity5?: string
  }>
  carrier: {
    name: string
    vesselName: string
    voyageTripFlightNumber: string
    railCarNumber: string
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

    // Create the document
    const createResponse = await fetch(`${CUSTOMSCITY_API_BASE_URL}/api/abi/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CUSTOMSCITY_API_KEY}`,
      },
      body: JSON.stringify({
        documentType: 'FDA_PN',
        data: document,
      }),
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}))
      throw new Error(
        errorData.message || `CustomsCity API error: ${createResponse.status}`
      )
    }

    const createResult = await createResponse.json()
    const documentId = createResult.documentId || createResult.id

    if (!documentId) {
      throw new Error('Document created but no ID returned')
    }

    // Send the document
    const sendResponse = await fetch(`${CUSTOMSCITY_API_BASE_URL}/api/abi/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CUSTOMSCITY_API_KEY}`,
      },
      body: JSON.stringify({
        documentId,
      }),
    })

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json().catch(() => ({}))
      throw new Error(
        errorData.message || `Failed to send document: ${sendResponse.status}`
      )
    }

    return {
      success: true,
      documentId,
      message: 'Document submitted successfully to CustomsCity',
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
