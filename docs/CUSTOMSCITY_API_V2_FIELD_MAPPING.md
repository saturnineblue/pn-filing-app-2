# CustomsCity API v2 Field Mapping for PN Submissions

**Document Purpose:** This workfile maps CSV submission fields to CustomsCity API v2 endpoint fields for PN (Prior Notice) version 2 submissions. This is a preparation document for implementing API-based submissions alongside the existing CSV mechanism.

**Status:** DRAFT - For internal reference only. Do NOT implement yet.

**Date Created:** 2025-11-27

---

## API Endpoint Information

### Base URL
- Production: `https://app.customscity.com/api`
- Endpoint: `/pn-v2/submissions` (based on documentation review)

### Authentication
- Method: Bearer Token (API Key required)
- Header: `Authorization: Bearer {API_KEY}`

### Request Method
- POST for creating new PN v2 submissions

---

## Field Mappings: CSV to API v2

### 1. Shipment Header Information

| CSV Field Name | API Field Name | Data Type | Required | Notes |
|---------------|----------------|-----------|----------|-------|
| Entry Type | `entryType` | string | Yes | Default: "11" |
| Reference Qualifier | `referenceQualifier` | string | Yes | Default: "EXB" |
| Reference Number | `referenceNumber` | string | Conditional | Can be tracking number or custom reference |
| Mode of Transport | `modeOfTransport` | string | Yes | Default: "50" (Postal) |
| I dont have a Tracking Number | `hasTrackingNumber` | boolean | Yes | Inverse of CSV value (CSV: "N" = API: true) |
| Bill Type | `billType` | string | Yes | Default: "T" |
| MBOL/TRIP Number | `mbolTripNumber` | string | Yes | Order name from Shopify |
| HBOL/ Shipment Control Number | `hbolShipmentControlNumber` | string | Yes | Tracking number |

### 2. Arrival Information

| CSV Field Name | API Field Name | Data Type | Required | Notes |
|---------------|----------------|-----------|----------|-------|
| Estimate Date of Arrival | `estimatedArrivalDate` | string (YYYY-MM-DD) | Yes | Format conversion from MM/DD/YYYY |
| Time of Arrival | `arrivalTime` | string (HH:MM) | Yes | Default: "11:30" |
| US Port of Arrival | `usPortOfArrival` | string | Yes | Port code, Default: "4701" |

### 3. Equipment Information

| CSV Field Name | API Field Name | Data Type | Required | Notes |
|---------------|----------------|-----------|----------|-------|
| Equipment Number | `equipmentNumber` | string | No | Optional field |
| Rail Car Number | `railCarNumber` | string | No | Optional field |

### 4. Shipper Information

| CSV Field Name | API Field Name | Data Type | Required | Notes |
|---------------|----------------|-----------|----------|-------|
| Shipper Name | `shipper.name` | string | Yes | From settings |
| Shipper Address | `shipper.address` | string | Yes | From settings |
| Shipper City | `shipper.city` | string | Yes | From settings |
| Shipper Country | `shipper.country` | string | Yes | From settings |

### 5. Consignee Information

| CSV Field Name | API Field Name | Data Type | Required | Notes |
|---------------|----------------|-----------|----------|-------|
| Consignee Name | `consignee.name` | string | Yes | From Shopify order |
| Consignee Address | `consignee.address` | string | Yes | From Shopify order |
| Consignee City | `consignee.city` | string | Yes | From Shopify order |
| Consignee State or Province | `consignee.state` | string | Yes | From Shopify order |
| Consignee Postal Code | `consignee.postalCode` | string | Yes | From Shopify order |
| Consignee Country | `consignee.country` | string | Yes | From Shopify order |

### 6. Product Information

| CSV Field Name | API Field Name | Data Type | Required | Notes |
|---------------|----------------|-----------|----------|-------|
| OI Description | `orderItemDescription` | string | No | Optional description |
| Product ID | `products[].productId` | string | Yes | Product code from database |
| PGA Product Base UOM | `products[].baseUom` | string | Yes | Unit of measure |
| PGA Product Base Quantity | `products[].baseQuantity` | number | Yes | Quantity ordered |
| PGA Product Packaging UOM 1 | `products[].packagingUom1` | string | No | Optional packaging unit 1 |
| PGA Product Quantity 1 | `products[].packagingQuantity1` | number | No | Optional quantity 1 |
| PGA Product Base UOM 2 | `products[].packagingUom2` | string | No | Optional packaging unit 2 |
| PGA Product Base Quantity 2 | `products[].packagingQuantity2` | number | No | Optional quantity 2 |
| PGA Product Packaging UOM 3 | `products[].packagingUom3` | string | No | Optional packaging unit 3 |
| PGA Product Quantity 3 | `products[].packagingQuantity3` | number | No | Optional quantity 3 |
| PGA Product Packaging UOM 4 | `products[].packagingUom4` | string | No | Optional packaging unit 4 |
| PGA Product Quantity 4 | `products[].packagingQuantity4` | number | No | Optional quantity 4 |
| PGA Product Packaging UOM 5 | `products[].packagingUom5` | string | No | Optional packaging unit 5 |
| PGA Product Quantity 5 | `products[].packagingQuantity5` | number | No | Optional quantity 5 |

### 7. Carrier Information

| CSV Field Name | API Field Name | Data Type | Required | Notes |
|---------------|----------------|-----------|----------|-------|
| Carrier Name | `carrier.name` | string | Yes | Default: "POST" |
| Vessel Name | `carrier.vesselName` | string | No | Optional |
| Voyage Trip Flight Number | `carrier.voyageTripFlightNumber` | string | No | Usually tracking number |

---

## API Request Structure (Draft)

```json
{
  "entryType": "11",
  "referenceQualifier": "EXB",
  "referenceNumber": "tracking_number_or_custom",
  "modeOfTransport": "50",
  "hasTrackingNumber": true,
  "billType": "T",
  "mbolTripNumber": "ORDER_NAME",
  "hbolShipmentControlNumber": "TRACKING_NUMBER",
  "estimatedArrivalDate": "2025-12-01",
  "arrivalTime": "11:30",
  "usPortOfArrival": "4701",
  "equipmentNumber": "",
  "shipper": {
    "name": "Shipper Company Name",
    "address": "123 Shipper St",
    "city": "Shipper City",
    "country": "US"
  },
  "consignee": {
    "name": "Customer Name",
    "address": "456 Customer Ave",
    "city": "Customer City",
    "state": "CA",
    "postalCode": "12345",
    "country": "US"
  },
  "orderItemDescription": "Optional description",
  "products": [
    {
      "productId": "PRODUCT_CODE",
      "baseUom": "EA",
      "baseQuantity": 2,
      "packagingUom1": "",
      "packagingQuantity1": 0
    }
  ],
  "carrier": {
    "name": "POST",
    "vesselName": "",
    "voyageTripFlightNumber": "TRACKING_NUMBER"
  }
}
```

---

## Implementation Notes

### Data Transformations Required

1. **Date Format Conversion**
   - CSV: MM/DD/YYYY → API: YYYY-MM-DD
   - Use date-fns or similar library

2. **Boolean Inversions**
   - CSV "I dont have a Tracking Number": "N" → API hasTrackingNumber: true
   - CSV "Y" → API: false

3. **Nested Object Structure**
   - CSV flat structure → API nested objects for shipper, consignee, carrier
   - Products array structure in API vs. flat CSV rows

4. **Multiple Products per Order**
   - CSV: One row per product
   - API: Array of products in single request
   - Need to aggregate products by order before sending

### Current CSV Data Sources

- **Settings table**: Shipper info, default values, port codes
- **Shopify API**: Consignee information from order
- **Products table**: Product codes
- **Input parameters**: Order names, tracking numbers, quantities, arrival date

### API Implementation Considerations

1. **Error Handling**
   - API may return different error codes than CSV upload
   - Need to map API errors to user-friendly messages
   - Implement retry logic for transient failures

2. **Rate Limiting**
   - Check if API has rate limits
   - Implement queuing if needed for bulk submissions

3. **Response Handling**
   - API likely returns submission ID or confirmation number
   - Store API response for tracking/verification

4. **Validation**
   - API may have stricter validation than CSV
   - Pre-validate data before submission
   - Handle validation errors gracefully

### Security Considerations

1. **API Key Storage**
   - Store API key in environment variables
   - Never commit API key to version control
   - Use same security practices as Shopify API key

2. **Request Signing**
   - Check if API requires request signing
   - Implement if necessary

---

## Current Implementation Status & Issues

### Existing Code Analysis

The codebase already has API integration implemented in:
- `lib/customscity-api.ts` - API client with submission functions
- `app/api/submit-customscity/route.ts` - API route that handles submissions
- Database schema includes `Submission` model for tracking

### Critical Issues Identified

❌ **Issue 1: Incorrect API Base URL**
- Current: `https://api.customscity.com`
- Should be: `https://app.customscity.com/api` (per documentation)
- Location: `lib/customscity-api.ts` line 6

❌ **Issue 2: Wrong API Endpoints**
- Current: `/api/abi/documents` and `/api/abi/send`
- Should be: `/pn-v2/submissions` (single endpoint for PN v2)
- The current two-step process (create then send) may not be needed

❌ **Issue 3: Incorrect Date Format**
- Current: Sends date as `MM/dd/yyyy` (e.g., "12/01/2025")
- Should be: `YYYY-MM-DD` (e.g., "2025-12-01")
- Location: `app/api/submit-customscity/route.ts` line 59

❌ **Issue 4: Field Name Mismatches**
- Current interface uses CSV-style field names (e.g., `estimatedDateOfArrival`, `pgaProductBaseUOM`)
- API expects different field names based on documentation (e.g., `estimatedArrivalDate`, `baseUom`)
- Location: `lib/customscity-api.ts` interface definitions

❌ **Issue 5: Document Type May Be Incorrect**
- Current: `documentType: 'FDA_PN'`
- For PN v2, this may need to be different or may not be needed at all
- Need to verify correct document type from API documentation

❌ **Issue 6: Missing or Incorrect API Key**
- Environment variable `CUSTOMSCITY_API_KEY` must be set in `.env.local`
- Need to obtain correct API key from CustomsCity for PN v2 access

---

## Fix Steps (DO NOT IMPLEMENT CODE CHANGES YET)

### Step 1: Verify API Credentials and Access
- [ ] Contact CustomsCity to obtain PN v2 API credentials
- [ ] Confirm the exact API endpoint URL for PN v2 submissions
- [ ] Confirm if sandbox/test environment is available
- [ ] Get documentation for exact request/response format

### Step 2: Update Environment Variables
File: `.env.local`
- [ ] Add or update: `CUSTOMSCITY_API_KEY=your_actual_api_key_here`
- [ ] Restart development server after updating

### Step 3: Fix API Base URL
File: `lib/customscity-api.ts` (Line 6)
```typescript
// CHANGE FROM:
const CUSTOMSCITY_API_BASE_URL = 'https://api.customscity.com'

// CHANGE TO:
const CUSTOMSCITY_API_BASE_URL = 'https://app.customscity.com/api'
```

### Step 4: Fix TypeScript Interface Field Names
File: `lib/customscity-api.ts` (Lines 8-56)

Update interface to match API v2 field names:
```typescript
interface CustomsCityDocument {
  entryType: string
  referenceQualifier: string
  referenceNumber: string
  modeOfTransport: string
  hasTrackingNumber: boolean  // CHANGED: was noTrackingNumber: string
  billType: string
  mbolTripNumber: string
  hbolShipmentControlNumber: string
  estimatedArrivalDate: string  // CHANGED: was estimatedDateOfArrival
  arrivalTime: string  // CHANGED: was timeOfArrival
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
    state: string  // CHANGED: was stateOrProvince
    postalCode: string
    country: string
  }
  orderItemDescription?: string  // ADDED: was missing
  products: Array<{
    productId: string
    baseUom: string  // CHANGED: was pgaProductBaseUOM
    baseQuantity: number  // CHANGED: was pgaProductBaseQuantity (and should be number)
    packagingUom1?: string  // CHANGED: was pgaProductPackagingUOM1
    packagingQuantity1?: number  // CHANGED: was pgaProductQuantity1 (and should be number)
    packagingUom2?: string  // CHANGED: was pgaProductBaseUOM2
    packagingQuantity2?: number  // CHANGED: was pgaProductBaseQuantity2 (and should be number)
    packagingUom3?: string  // CHANGED: was pgaProductPackagingUOM3
    packagingQuantity3?: number  // CHANGED: was pgaProductQuantity3 (and should be number)
    packagingUom4?: string  // CHANGED: was pgaProductPackagingUOM4
    packagingQuantity4?: number  // CHANGED: was pgaProductQuantity4 (and should be number)
    packagingUom5?: string  // CHANGED: was pgaProductPackagingUOM5
    packagingQuantity5?: number  // CHANGED: was pgaProductQuantity5 (and should be number)
  }>
  carrier: {
    name: string
    vesselName?: string  // CHANGED: make optional
    voyageTripFlightNumber?: string  // CHANGED: make optional
    railCarNumber?: string  // CHANGED: make optional
  }
}
```

### Step 5: Fix API Endpoint and Submission Logic
File: `lib/customscity-api.ts` (Lines 67-135)

**Replace the two-step process** (create + send) with **single POST** to correct endpoint:

```typescript
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
      body: JSON.stringify(document),  // Send document directly, not wrapped
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
```

### Step 6: Fix Date Format
File: `app/api/submit-customscity/route.ts` (Line 59)

```typescript
// CHANGE FROM:
const formattedDate = format(new Date(estimatedArrivalDate), 'MM/dd/yyyy')

// CHANGE TO:
const formattedDate = format(new Date(estimatedArrivalDate), 'yyyy-MM-dd')
```

### Step 7: Fix Field Names in Document Builder
File: `app/api/submit-customscity/route.ts` (Lines 79-106)

Update all field names to match new interface:
```typescript
// Build products array with corrected field names
orderProducts.push({
  productId: product.productCode,
  baseUom: settings.csv_pgaProductBaseUOM || '',  // CHANGED field name
  baseQuantity: productEntry.quantity,  // CHANGED: now number, not string
  packagingUom1: settings.csv_pgaProductPackagingUOM1 || undefined,  // CHANGED field name
  packagingQuantity1: settings.csv_pgaProductQuantity1 ? parseInt(settings.csv_pgaProductQuantity1) : undefined,  // CHANGED: now number
  // ... continue for all packaging fields
})

// In document creation (lines 113-148):
documents.push({
  entryType: settings.csv_entryType || '11',
  referenceQualifier: settings.csv_referenceQualifier || 'EXB',
  referenceNumber: settings.csv_referenceNumber === 'tracking' ? order.trackingNumber : (settings.csv_referenceNumber || ''),
  modeOfTransport: settings.csv_modeOfTransport || '50',
  hasTrackingNumber: (settings.csv_noTrackingNumber || 'N') === 'N',  // CHANGED: boolean conversion
  billType: settings.csv_billType || 'T',
  mbolTripNumber: order.orderName,
  hbolShipmentControlNumber: order.trackingNumber,
  estimatedArrivalDate: formattedDate,  // CHANGED field name
  arrivalTime: settings.csv_timeOfArrival || '11:30',  // CHANGED field name
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
    state: shippingInfo.consigneeState,  // CHANGED field name
    postalCode: shippingInfo.consigneePostalCode,
    country: shippingInfo.consigneeCountry,
  },
  orderItemDescription: settings.csv_description || undefined,  // ADDED field
  products: orderProducts,
  carrier: {
    name: settings.csv_carrierName || 'POST',
    vesselName: settings.csv_vesselName || undefined,  // CHANGED to undefined
    voyageTripFlightNumber: order.trackingNumber,
    railCarNumber: settings.csv_railCarNumber || undefined,  // CHANGED to undefined
  },
})
```

### Step 8: Testing Checklist

After implementing ALL the above fixes:

- [ ] Verify API key is set in `.env.local`
- [ ] Test with a single order first
- [ ] Check network tab in browser DevTools for actual API request/response
- [ ] Verify date format in request is YYYY-MM-DD
- [ ] Verify all field names match API v2 documentation
- [ ] Check response for documentId/submissionId
- [ ] Test error handling with invalid data
- [ ] Test with multiple orders
- [ ] Verify submissions are saved to database correctly
- [ ] Check that PNC numbers can be retrieved

### Step 9: Common Error Messages and Solutions

**"CustomsCity API key is not configured"**
- Solution: Add `CUSTOMSCITY_API_KEY=your_key` to `.env.local`

**"404 Not Found"**
- Solution: Verify API base URL and endpoint path are correct

**"401 Unauthorized"**
- Solution: Verify API key is valid and has PN v2 permissions

**"400 Bad Request - Invalid field: X"**
- Solution: Check field name matches API v2 documentation exactly

**"422 Unprocessable Entity"**
- Solution: Check data types and required fields are correct

---

## Summary of Changes Needed

1. **Environment**: Add correct API key to `.env.local`
2. **API Base URL**: Change from `api.customscity.com` to `app.customscity.com/api`
3. **API Endpoint**: Change from `/api/abi/documents` to `/pn-v2/submissions`
4. **Date Format**: Change from `MM/dd/yyyy` to `yyyy-MM-dd`
5. **Field Names**: Update 15+ field names to match API v2 spec
6. **Data Types**: Convert several string fields to numbers/booleans
7. **API Flow**: Simplify from two-step to single-step submission

**Estimated effort**: 2-3 hours for implementation + testing
**Risk level**: Medium (affects live submissions, needs thorough testing)

---

## Questions for Clarification

1. What is the exact API endpoint URL for PN v2 submissions?
2. How do we obtain the API key?
3. Are there rate limits on the API?
4. What is the exact error response format?
5. Is there a sandbox/testing environment?
6. Are there any webhook callbacks for submission status updates?
7. What is the maximum payload size?
8. Can multiple orders be submitted in a single API call?

---

## References

- CustomsCity API Documentation: https://app.customscity.com/api-documentation
- Current CSV Generator: lib/csv-generator.ts
- Current CSV Upload: app/api/submit-customscity/route.ts

---

**IMPORTANT:** This is a PREPARATION document only. Do NOT implement API calls until explicitly requested to do so. The CSV submission mechanism must remain unchanged.
