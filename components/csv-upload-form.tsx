'use client'

import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { addDays } from 'date-fns'

interface Product {
  id: string
  nickname: string
  productCode: string
}

export default function CSVUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [estimatedArrival, setEstimatedArrival] = useState<string>('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<Array<{ orderName: string; tracking: string }>>([])

  useEffect(() => {
    // Set default date to today + 21 days
    const defaultDate = addDays(new Date(), 21)
    setEstimatedArrival(defaultDate.toISOString().split('T')[0])

    // Fetch products
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError('')
    setPreview([])

    try {
      const data = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<Record<string, unknown>>

      // Validate headers
      if (jsonData.length === 0) {
        setError('File is empty')
        return
      }

      const firstRow = jsonData[0]
      const hasOrderName = 'OrderName' in firstRow
      const hasTracking = 'Tracking' in firstRow

      if (!hasOrderName || !hasTracking) {
        setError('File must contain OrderName and Tracking columns')
        return
      }

      // Parse and preview data
      const parsed = jsonData
        .filter(row => row.OrderName && row.Tracking)
        .map(row => ({
          orderName: String(row.OrderName).trim(),
          tracking: String(row.Tracking).trim(),
        }))

      setPreview(parsed)
    } catch (err) {
      setError('Failed to parse file')
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file || !selectedProduct || preview.length === 0) {
      setError('Please select a file, product, and ensure data is valid')
      return
    }

    setLoading(true)
    setError('')

    try {
      const orders = preview.map(row => ({
        orderName: row.orderName,
        trackingNumber: row.tracking,
        products: [{ productId: selectedProduct, quantity: 1 }],
      }))

      const res = await fetch('/api/generate-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orders,
          estimatedArrivalDate: estimatedArrival,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to generate CSV')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pn-filing-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Reset form
      setFile(null)
      setPreview([])
      const fileInput = document.getElementById('csv-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err) {
      setError('Failed to generate CSV')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload CSV/Excel File</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-2">
            Upload File (CSV or Excel)
          </label>
          <input
            id="csv-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            File must contain OrderName and Tracking columns
          </p>
        </div>

        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
            Select Product
          </label>
          <select
            id="product"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            required
          >
            <option value="">Choose a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nickname} ({product.productCode})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="eta" className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Date of Arrival
          </label>
          <input
            id="eta"
            type="date"
            value={estimatedArrival}
            onChange={(e) => setEstimatedArrival(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            required
          />
        </div>

        {preview.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Preview ({preview.length} orders)
            </h3>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left py-1 px-2">Order Name</th>
                    <th className="text-left py-1 px-2">Tracking</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      <td className="py-1 px-2">{row.orderName}</td>
                      <td className="py-1 px-2">{row.tracking}</td>
                    </tr>
                  ))}
                  {preview.length > 10 && (
                    <tr>
                      <td colSpan={2} className="py-1 px-2 text-gray-500 italic">
                        ... and {preview.length - 10} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !file || !selectedProduct || preview.length === 0}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate CSV'}
        </button>
      </form>
    </div>
  )
}
