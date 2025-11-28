# CustomsCity FDA Prior Notice API Documentation

**Status:** ACTIVE - This is the correct API structure for FDA PN submissions

**Last Updated:** 2025-11-28

---

## API Endpoint Information

### Base URL
- Production: `https://api.customscity.com/api`

### Endpoint
- `/documents` - POST endpoint for FDA Prior Notice submissions

### Authentication
- Method: Bearer Token (API Key required)
- Header: `Authorization: Bearer {API_KEY}`
- Environment Variable: `CUSTOMSCITY_API_KEY`

### Request Method
- POST with JSON body

---

## Request Structure

### Top-Level Document

```json
{
  "type": "fda-pn",
  "send": false,
  "sendAs": "add",
  "body": [
    {
      // PN Body object - see below
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Must be "fda-pn" for FDA Prior Notice |
| send | boolean | Yes | Whether to send immediately (use false to save as draft) |
| sendAs | string | Yes | Action type: "add", "replace", or "delete" |
| body | array | Yes | Array of PN Body objects (typically one per shipment) |

---

## PN Body Structure

### Shipment Header Fields

| Field | Type | Required | Example | Source | Notes |
|-------|------|----------|---------|--------|-------|
| pncNumber | string/null | No | null | - | Leave null for new submissions |
| entryType | string | Yes | "86" | Settings: csv_entryType | Entry type code |
| referenceQualifier | string | Yes | "AWB" | Settings: csv_referenceQualifier | Reference qualifier |
| modeOfTransport | string | Yes | "40" | Settings: csv_modeOfTransport | Mode of transport code |
| referenceNumber | string/null | No | null | Settings/Tracking | Optional reference |
| entryNumber | string/null | No | null | - | Entry number if applicable |
| ftzAdmission | string/null | No | null | - | FTZ admission number |
| inbondNumber | string/null | No | null | - | In-bond number |
| billType | string | Yes | "M" | Settings: csv_billType | Bill type code |
| MBOLNumber | string | Yes | "66693022301" | Order Name | Master BOL number |
| HBOLNumber | string | Yes | "TEST000005" | Tracking Number | House BOL number |
| trip | string/null | No | null | - | Trip number |
| scnBol | string/null | No | null | - | SCN BOL |
| consolidationId | string/null | No | null | - | Consolidation ID |
| expressCarrierTrackingNumber | string/null | No | null | - | Express carrier tracking |
| importingCarrier | string/null | No | null | - | Importing carrier |
| dateOfArrival | string | Yes | "20230221" | User Input | Format: YYYYMMDD |
| timeOfArrival | string | Yes | "15:00" | Settings: csv_timeOfArrival | Format: HH:MM |
| portOfArrival | string | Yes | "2721" | Settings: csv_usPortOfArrival | Port code |
| equipmentNumber | string/null | No | null | Settings: csv_equipmentNumber | Equipment number |
| oiDescription | string | No | "HAMTEST" | Settings: csv_description | Order item description |
| carrierName | string | Yes | "Y4" | Settings: csv_carrierName | Carrier code |
| vesselName | string/null | No | null | Settings: csv_vesselName | Vessel name |
| voyageNumber | string/null | No | null | Tracking Number | Voyage/flight number |
| railCarNumber | string/null | No | null | Settings: csv_railCarNumber | Rail car number |
| items | array | Yes | [...] | - | Array of item objects (see below) |

---

## Item Structure

Each product in the order becomes an item in the items array.

### Item Fields

| Field | Type | Required | Example | Source | Notes |
|-------|------|----------|---------|--------|-------|
| pgaLineNumber | number | Yes | 1 | Auto-increment | Line number starting from 1 |
| productCode | string | Yes | "CHO1234" | Database: Product.productCode | FDA product code |
| productDescription | string | No | "chocolate" | Settings: csv_description | Product description |
| countryOfShipment | string | No | "IT" | Settings: csv_shipperCountry | Country code |

### Ultimate Consignee (from Shopify Order)

| Field | Type | Required | Example | Source |
|-------|------|----------|---------|--------|
| ultimateConsigneeName | string | Yes | "CONSIGNEE NAME 1" | Shopify: shipping address name |
| ultimateConsigneeFeiOrDunsCode | string/null | No | null | - |
| ultimateConsigneeFeiOrDuns | string/null | No | null | - |
| ultimateConsigneeAddress | string | Yes | "AIR STREET 123" | Shopify: address1 |
| ultimateConsigneeAddress2 | string/null | No | null | Shopify: address2 |
| ultimateConsigneeUnitNumber | string/null | No | null | - |
| ultimateConsigneeCountry | string | Yes | "US" | Shopify: country_code |
| ultimateConsigneeStateOrProvince | string | Yes | "CA" | Shopify: province_code |
| ultimateConsigneeCity | string | Yes | "LOS ANGELES" | Shopify: city |
| ultimateConsigneeZipPostalCode | string | Yes | "98210" | Shopify: zip |

### Shipper (from Settings)

| Field | Type | Required | Example | Source |
|-------|------|----------|---------|--------|
| shipperName | string | Yes | "PAOLA M" | Settings: csv_shipperName |
| shipperFeiOrDunsCode | string/null | No | null | - |
| shipperFeiOrDuns | string/null | No | null | - |
| shipperAddress | string | Yes | "TEST 1" | Settings: csv_shipperAddress |
| shipperAddress2 | string/null | No | null | - |
| shipperUnitNumber | string/null | No | null | - |
| shipperCountry | string | Yes | "MX" | Settings: csv_shipperCountry |
| shipperStateOrProvince | string/null | No | null | - |
| shipperCity | string | Yes | "TEST" | Settings: csv_shipperCity |
| shipperZipPostalCode | string/null | No | null | - |

### Packaging

| Field | Type | Required | Example | Source | Notes |
|-------|------|----------|---------|--------|-------|
| packaging | array | Yes | [...] | Settings | Array of packaging objects |
| packaging[].quantity | number | Yes | 50 | Settings/Order quantity | Quantity in this unit |
| packaging[].unitOfMeasure | string | Yes | "G" | Settings: csv_pgaProductBaseUOM, etc. | Unit of measure code |

The packaging array is built from multiple settings:
- csv_pgaProductBaseUOM + order quantity
- csv_pgaProductPackagingUOM1 + csv_pgaProductQuantity1
- csv_pgaProductBaseUOM2 + csv_pgaProductBaseQuantity2
- csv_pgaProductPackagingUOM3 + csv_pgaProductQuantity3
- csv_pgaProductPackagingUOM4 + csv_pgaProductQuantity4
- csv_pgaProductPackagingUOM5 + csv_pgaProductQuantity5

### Item Description

| Field | Type | Required | Example | Source |
|-------|------|----------|---------|--------|
| itemDescription | string | No | "HAM" | Settings: csv_description |

---

## Complete Example Request

```json
{
  "type": "fda-pn",
  "send": false,
  "sendAs": "add",
  "body": [
    {
      "pncNumber": null,
      "entryType": "86",
      "referenceQualifier": "AWB",
      "modeOfTransport": "40",
      "referenceNumber": null,
      "entryNumber": null,
      "ftzAdmission": null,
      "inbondNumber": null,
      "billType": "M",
      "MBOLNumber": "66693022301",
      "HBOLNumber": "TEST000005",
      "trip": null,
      "scnBol": null,
      "consolidationId": null,
      "expressCarrierTrackingNumber": null,
      "importingCarrier": null,
      "dateOfArrival": "20230221",
      "timeOfArrival": "15:00",
      "portOfArrival": "2721",
      "equipmentNumber": null,
      "oiDescription": "HAMTEST",
      "carrierName": "Y4",
      "vesselName": null,
      "voyageNumber": "12345",
      "railCarNumber": null,
      "items": [
        {
          "pgaLineNumber": 1,
          "productCode": "CHO1234",
          "productDescription": "chocolate",
          "countryOfShipment": "IT",
          "ultimateConsigneeName": "CONSIGNEE NAME 1",
          "ultimateConsigneeFeiOrDunsCode": null,
          "ultimateConsigneeFeiOrDuns": null,
          "ultimateConsigneeAddress": "AIR STREET 123",
          "ultimateConsigneeAddress2": null,
          "ultimateConsigneeUnitNumber": null,
          "ultimateConsigneeCountry": "US",
          "ultimateConsigneeStateOrProvince": "CA",
          "ultimateConsigneeCity": "LOS ANGELES",
          "ultimateConsigneeZipPostalCode": "98210",
          "shipperName": "PAOLA M",
          "shipperFeiOrDunsCode": null,
          "shipperFeiOrDuns": null,
          "shipperAddress": "TEST 1",
          "shipperAddress2": null,
          "shipperUnitNumber": null,
          "shipperCountry": "MX",
          "shipperStateOrProvince": null,
          "shipperCity": "TEST",
          "shipperZipPostalCode": null,
          "packaging": [
            {
              "quantity": 50,
              "unitOfMeasure": "G"
            }
          ],
          "itemDescription": "HAM"
        }
      ]
    }
  ]
}
```

---

## Data Transformations

### Date Format
- Input: User provides date in YYYY-MM-DD format (e.g., "2023-02-21")
- Output: Convert to YYYYMMDD format (e.g., "20230221")
- Use: `format(new Date(estimatedArrivalDate), 'yyyyMMdd')`

### Multiple Products
- Each product in an order becomes a separate item in the items array
- pgaLineNumber increments starting from 1
- All items share the same shipment header information

### Packaging Array
- Built from settings configuration
- Each packaging entry has quantity (number) and unitOfMeasure (string)
- Multiple packaging units can be specified per item

---

## Settings Keys Reference

### Shipment Settings
- `csv_entryType` - Entry type code (default: "86")
- `csv_referenceQualifier` - Reference qualifier (default: "AWB")
- `csv_modeOfTransport` - Mode of transport (default: "40")
- `csv_referenceNumber` - Reference number pattern
- `csv_billType` - Bill type (default: "M")
- `csv_timeOfArrival` - Time of arrival (default: "11:30")
- `csv_usPortOfArrival` - US port code (default: "2721")
- `csv_equipmentNumber` - Equipment number
- `csv_description` - Item/order description
- `csv_carrierName` - Carrier code (default: "POST")
- `csv_vesselName` - Vessel name
- `csv_railCarNumber` - Rail car number

### Shipper Settings
- `csv_shipperName` - Shipper name
- `csv_shipperAddress` - Shipper address
- `csv_shipperCity` - Shipper city
- `csv_shipperCountry` - Shipper country code

### Product/Packaging Settings
- `csv_pgaProductBaseUOM` - Base unit of measure
- `csv_pgaProductPackagingUOM1` - Packaging UOM 1
- `csv_pgaProductQuantity1` - Packaging quantity 1
- `csv_pgaProductBaseUOM2` - Packaging UOM 2
- `csv_pgaProductBaseQuantity2` - Packaging quantity 2
- `csv_pgaProductPackagingUOM3` - Packaging UOM 3
- `csv_pgaProductQuantity3` - Packaging quantity 3
- `csv_pgaProductPackagingUOM4` - Packaging UOM 4
- `csv_pgaProductQuantity4` - Packaging quantity 4
- `csv_pgaProductPackagingUOM5` - Packaging UOM 5
- `csv_pgaProductQuantity5` - Packaging quantity 5

---

## Implementation Notes

### Response Handling
The API returns a response with:
- `documentId` or `id` or `submissionId` - Document identifier
- `message` - Status message
- Status code 200 for success, 4xx/5xx for errors

### Error Handling
- Validate all required fields before submission
- Handle API errors gracefully
- Store submission status in database for tracking

### Database Storage
After submission, store in Submission model:
- orderName
- trackingNumber  
- documentId (from API response)
- status ('submitted' or 'failed')
- errorMessage (if failed)

---

## Testing Checklist

- [ ] Verify API key is set in environment variables
- [ ] Test with single order
- [ ] Test with multiple products per order
- [ ] Verify date format (YYYYMMDD)
- [ ] Check all packaging units are included
- [ ] Verify Shopify data is correctly mapped
- [ ] Test error handling
- [ ] Verify submissions are stored in database
- [ ] Check PNC number retrieval workflow
