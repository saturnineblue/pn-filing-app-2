import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Default CSV field settings
  const defaultSettings = [
    { key: 'stickerHeight', value: '100' },
    { key: 'stickerWidth', value: '150' },
    { key: 'csv_entryType', value: '11' },
    { key: 'csv_referenceQualifier', value: 'EXB' },
    { key: 'csv_referenceNumber', value: '' },
    { key: 'csv_modeOfTransport', value: '50' },
    { key: 'csv_noTrackingNumber', value: 'N' },
    { key: 'csv_billType', value: 'T' },
    { key: 'csv_timeOfArrival', value: '11:30' },
    { key: 'csv_usPortOfArrival', value: '4701' },
    { key: 'csv_equipmentNumber', value: '' },
    { key: 'csv_shipperName', value: '' },
    { key: 'csv_shipperAddress', value: '' },
    { key: 'csv_shipperCity', value: '' },
    { key: 'csv_shipperCountry', value: '' },
    { key: 'csv_description', value: '' },
    { key: 'csv_pgaProductBaseUOM', value: '' },
    { key: 'csv_pgaProductPackagingUOM1', value: '' },
    { key: 'csv_pgaProductQuantity1', value: '' },
    { key: 'csv_pgaProductBaseUOM2', value: '' },
    { key: 'csv_pgaProductBaseQuantity2', value: '' },
    { key: 'csv_pgaProductPackagingUOM3', value: '' },
    { key: 'csv_pgaProductQuantity3', value: '' },
    { key: 'csv_pgaProductPackagingUOM4', value: '' },
    { key: 'csv_pgaProductQuantity4', value: '' },
    { key: 'csv_pgaProductPackagingUOM5', value: '' },
    { key: 'csv_pgaProductQuantity5', value: '' },
    { key: 'csv_carrierName', value: 'POST' },
    { key: 'csv_vesselName', value: '' },
    { key: 'csv_railCarNumber', value: '' },
  ]

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
