/**
 * CustomsCity API Client for FDA Prior Notice Submissions
 * Documentation: https://api.customscity.com/api-documentation
 */

const CUSTOMSCITY_API_BASE_URL = 'https://api.customscity.com/api'
const CUSTOMSCITY_API_KEY = process.env.CUSTOMSCITY_API_KEY

interface CustomsCityPNItem {
  pgaLineNumber: number
  productCode: string
  productDescription?: string
  countryOfShipment?: string
  ultimateConsigneeName: string
  ultimateConsigneeFeiOrDunsCode?: string | null
  ultimateConsigneeFeiOrDuns?: string | null
  ultimateConsigneeAddress: string
  ultimateConsigneeAddress2?: string | null
  ultimateConsigneeUnitNumber?: string | null
  ultimateConsigneeCountry: string
  ultimateConsigneeStateOrProvince: string
  ultimateConsigneeCity: string
  ultimateConsigneeZipPostalCode: string
  shipperName: string
  shipperFeiOrDunsCode?: string | null
  shipperFeiOrDuns?: string | null
  shipperAddress: string
  shipperAddress2?: string | null
  shipperUnitNumber?: string | null
  shipperCountry: string
  shipperStateOrProvince?: string | null
  shipperCity: string
  shipperZipPostalCode?: string | null
  packaging: Array<{
    quantity: number
    unitOfMeasure: string
  }>
  itemDescription?: string
}

interface CustomsCityPNBody {
  pncNumber?: string | null
  entryType: string
  referenceQualifier: string
  modeOfTransport: string
  referenceNumber?: string | null
  entryNumber?: string | null
  ftzAdmission?: string | null
  inbondNumber?: string | null
  billType: string
  MBOLNumber: string
  HBOLNumber: string
  trip?: string | null
  scnBol?: string | null
  consolidationId?: string | null
  expressCarrierTrackingNumber?: string | null
  importingCarrier?: string | null
  dateOfArrival: string
  timeOfArrival: string
  portOfArrival: string
  equipmentNumber?: string | null
  oiDescription?: string
  carrierName: string
  vesselName?: string | null
  voyageNumber?: string | null
  railCarNumber?: string | null
  items: CustomsCityPNItem[]
}

interface CustomsCityDocument {
  type: 'fda-pn'
  send: boolean
  sendAs: 'add' | 'replace' | 'delete'
  body: CustomsCityPNBody[]
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

    // Single POST to documents endpoint
    const response = await fetch(`${CUSTOMSCITY_API_BASE_URL}/documents`, {
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
