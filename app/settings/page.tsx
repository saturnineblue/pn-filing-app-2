'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar'

interface CSVField {
  name: string
  key: string
  type: 'static' | 'dynamic'
  dynamicSource?: string
}

const csvFields: CSVField[] = [
  { name: 'Entry Type', key: 'csv_entryType', type: 'static' },
  { name: 'Reference Qualifier', key: 'csv_referenceQualifier', type: 'static' },
  { name: 'Reference Number', key: 'csv_referenceNumber', type: 'static' },
  { name: 'Mode of Transport', key: 'csv_modeOfTransport', type: 'static' },
  { name: 'I dont have a Tracking Number', key: 'csv_noTrackingNumber', type: 'static' },
  { name: 'Bill Type', key: 'csv_billType', type: 'static' },
  { name: 'MBOL/TRIP Number', key: '', type: 'dynamic', dynamicSource: 'Order Name from Shopify' },
  { name: 'HBOL/ Shipment Control Number', key: '', type: 'dynamic', dynamicSource: 'Tracking Number from CSV/Input' },
  { name: 'Estimate Date of Arrival', key: '', type: 'dynamic', dynamicSource: 'User-selected ETA date (MM/DD/YYYY)' },
  { name: 'Time of Arrival', key: 'csv_timeOfArrival', type: 'static' },
  { name: 'US Port of Arrival', key: 'csv_usPortOfArrival', type: 'static' },
  { name: 'Equipment Number', key: 'csv_equipmentNumber', type: 'static' },
  { name: 'Shipper Name', key: 'csv_shipperName', type: 'static' },
  { name: 'Shipper Address', key: 'csv_shipperAddress', type: 'static' },
  { name: 'Shipper City', key: 'csv_shipperCity', type: 'static' },
  { name: 'Shipper Country', key: 'csv_shipperCountry', type: 'static' },
  { name: 'Consignee Name', key: '', type: 'dynamic', dynamicSource: 'Shipping name from Shopify order' },
  { name: 'Consignee Address', key: '', type: 'dynamic', dynamicSource: 'Shipping address from Shopify order' },
  { name: 'Consignee City', key: '', type: 'dynamic', dynamicSource: 'Shipping city from Shopify order' },
  { name: 'Consignee State or Province', key: '', type: 'dynamic', dynamicSource: 'Shipping state from Shopify order' },
  { name: 'Consignee Postal Code', key: '', type: 'dynamic', dynamicSource: 'Shipping postal code from Shopify order' },
  { name: 'Consignee Country', key: '', type: 'dynamic', dynamicSource: 'Shipping country (2-letter ISO) from Shopify order' },
  { name: 'Description', key: 'csv_description', type: 'static' },
  { name: 'Product ID', key: '', type: 'dynamic', dynamicSource: 'Product Code from database' },
  { name: 'PGA Product Base UOM', key: 'csv_pgaProductBaseUOM', type: 'static' },
  { name: 'PGA Product Base Quantity', key: '', type: 'dynamic', dynamicSource: 'Product quantity from user input' },
  { name: 'PGA Product Packaging UOM 1', key: 'csv_pgaProductPackagingUOM1', type: 'static' },
  { name: 'PGA Product Quantity 1', key: 'csv_pgaProductQuantity1', type: 'static' },
  { name: 'PGA Product Base UOM 2', key: 'csv_pgaProductBaseUOM2', type: 'static' },
  { name: 'PGA Product Base Quantity 2', key: 'csv_pgaProductBaseQuantity2', type: 'static' },
  { name: 'PGA Product Packaging UOM 3', key: 'csv_pgaProductPackagingUOM3', type: 'static' },
  { name: 'PGA Product Quantity 3', key: 'csv_pgaProductQuantity3', type: 'static' },
  { name: 'PGA Product Packaging UOM 4', key: 'csv_pgaProductPackagingUOM4', type: 'static' },
  { name: 'PGA Product Quantity 4', key: 'csv_pgaProductQuantity4', type: 'static' },
  { name: 'PGA Product Packaging UOM 5', key: 'csv_pgaProductPackagingUOM5', type: 'static' },
  { name: 'PGA Product Quantity 5', key: 'csv_pgaProductQuantity5', type: 'static' },
  { name: 'Carrier Name', key: 'csv_carrierName', type: 'static' },
  { name: 'Vessel Name', key: 'csv_vesselName', type: 'static' },
  { name: 'Voyage Trip Flight Number', key: '', type: 'dynamic', dynamicSource: 'Tracking Number from CSV/Input' },
  { name: 'Rail Car Number', key: 'csv_railCarNumber', type: 'static' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        setMessage('Settings saved successfully')
      } else {
        setMessage('Failed to save settings')
      }
    } catch (err) {
      setMessage('Failed to save settings')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">Loading...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

          <form onSubmit={handleSave} className="space-y-8">
            {/* Sticker Size Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sticker Size</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (mm)
                  </label>
                  <input
                    type="number"
                    value={settings.stickerHeight || ''}
                    onChange={(e) => updateSetting('stickerHeight', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (mm)
                  </label>
                  <input
                    type="number"
                    value={settings.stickerWidth || ''}
                    onChange={(e) => updateSetting('stickerWidth', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>
              </div>
            </div>

            {/* CSV Field Mapping */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">CSV Field Mapping</h2>
              <p className="text-sm text-gray-600 mb-4">
                Static fields can be edited. Dynamic fields are automatically populated from Shopify or user input.
              </p>
              
              <div className="space-y-3">
                {csvFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-4 py-2 border-b last:border-b-0">
                    <div className="w-1/3">
                      <span className="text-sm font-medium text-gray-700">{field.name}</span>
                    </div>
                    <div className="w-2/3">
                      {field.type === 'static' ? (
                        <input
                          type="text"
                          value={settings[field.key] || ''}
                          onChange={(e) => updateSetting(field.key, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
                          placeholder="Default value"
                        />
                      ) : (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 italic">
                            Dynamic: {field.dynamicSource}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-md ${
                message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
