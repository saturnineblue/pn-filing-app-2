'use client'

import { useState, useEffect } from 'react'
import { addDays } from 'date-fns'

interface Product {
  id: string
  nickname: string
  productCode: string
}

interface ManualOrder {
  orderName: string
  trackingNumber: string
  products: Array<{
    productId: string
    quantity: number
  }>
}

interface ManualEntryFormProps {
  addLog: (level: 'info' | 'success' | 'error' | 'warning', message: string) => void
  startLogging: () => void
  stopLogging: () => void
}

export default function ManualEntryForm({ addLog, startLogging, stopLogging }: ManualEntryFormProps) {
  const [orders, setOrders] = useState<ManualOrder[]>([
    { orderName: '', trackingNumber: '', products: [{ productId: '', quantity: 1 }] }
  ])
  const [estimatedArrival, setEstimatedArrival] = useState<string>('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitMode, setSubmitMode] = useState<'csv' | 'api'>('csv')

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

  const addOrder = () => {
    setOrders([...orders, { orderName: '', trackingNumber: '', products: [{ productId: '', quantity: 1 }] }])
  }

  const removeOrder = (orderIndex: number) => {
    setOrders(orders.filter((_, i) => i !== orderIndex))
  }

  const updateOrder = (orderIndex: number, field: 'orderName' | 'trackingNumber', value: string) => {
    const newOrders = [...orders]
    newOrders[orderIndex][field] = value
    setOrders(newOrders)
  }

  const addProduct = (orderIndex: number) => {
    const newOrders = [...orders]
    newOrders[orderIndex].products.push({ productId: '', quantity: 1 })
    setOrders(newOrders)
  }

  const removeProduct = (orderIndex: number, productIndex: number) => {
    const newOrders = [...orders]
    newOrders[orderIndex].products = newOrders[orderIndex].products.filter((_, i) => i !== productIndex)
    setOrders(newOrders)
  }

  const updateProduct = (orderIndex: number, productIndex: number, field: 'productId' | 'quantity', value: string | number) => {
    const newOrders = [...orders]
    if (field === 'productId') {
      newOrders[orderIndex].products[productIndex].productId = value as string
    } else {
      newOrders[orderIndex].products[productIndex].quantity = Number(value)
    }
    setOrders(newOrders)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const validOrders = orders.filter(order => 
      order.orderName && 
      order.trackingNumber && 
      order.products.some(p => p.productId && p.quantity > 0)
    )

    if (validOrders.length === 0) {
      setError('Please add at least one valid order with products')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (submitMode === 'api') {
        // Start logging
        startLogging()
        addLog('info', '========================================')
        addLog('info', `Starting CustomsCity submission for ${validOrders.length} order(s)...`)
        
        // Log each order being processed
        validOrders.forEach((order, index) => {
          const productCount = order.products.filter(p => p.productId && p.quantity > 0).length
          addLog('info', `Order ${index + 1}/${validOrders.length}: ${order.orderName} (${productCount} product(s))`)
        })
        
        addLog('info', 'Preparing FDA PN documents...')
        
        // Log the payload that will be sent
        addLog('info', '========================================')
        addLog('info', 'API Request Details:')
        addLog('info', `URL: https://api.customscity.com/documents`)
        addLog('info', 'Method: POST')
        addLog('info', 'Headers: Content-Type: application/json, Authorization: Bearer [API_KEY]')
        addLog('info', 'Request Body:')
        addLog('info', JSON.stringify({ orders: validOrders, estimatedArrivalDate: estimatedArrival }, null, 2))
        addLog('info', '========================================')
        
        // Submit to CustomsCity API
        const res = await fetch('/api/submit-customscity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orders: validOrders,
            estimatedArrivalDate: estimatedArrival,
          }),
        })

        const data = await res.json()

        if (!res.ok || !data.success) {
          addLog('error', `Submission failed: ${data.error || data.message || 'Unknown error'}`)
          if (data.results) {
            data.results.forEach((result: any, index: number) => {
              if (!result.success) {
                addLog('error', `Order ${index + 1}: ${result.message || 'Failed'}`)
              }
            })
          }
          stopLogging()
          throw new Error(data.error || data.message || 'Failed to submit to CustomsCity')
        }

        // Log the actual API payload that was constructed
        if (data.apiPayload) {
          addLog('info', '========================================')
          addLog('info', 'Constructed CustomsCity API Payload:')
          addLog('info', JSON.stringify(data.apiPayload, null, 2))
          addLog('info', '========================================')
        }

        // Log successful submissions
        if (data.results) {
          data.results.forEach((result: any, index: number) => {
            if (result.success) {
              addLog('success', `Order ${index + 1} submitted successfully${result.documentId ? ` (Doc ID: ${result.documentId})` : ''}`)
            }
          })
        }
        
        addLog('info', '========================================')
        addLog('success', `Submission complete: ${data.successful}/${data.total} successful`)
        addLog('info', 'PNC numbers will be generated by CustomsCity')
        addLog('info', 'Check PNC History page to retrieve them when ready')
        stopLogging()

        setSuccess(`Successfully submitted ${data.successful} of ${data.total} documents. Visit PNC History to check status.`)
        
        // Reset form on success
        setOrders([{ orderName: '', trackingNumber: '', products: [{ productId: '', quantity: 1 }] }])
      } else {
        // Generate CSV
        const res = await fetch('/api/generate-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orders: validOrders,
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
        setOrders([{ orderName: '', trackingNumber: '', products: [{ productId: '', quantity: 1 }] }])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Entry</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="manual-eta" className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Date of Arrival
          </label>
          <input
            id="manual-eta"
            type="date"
            value={estimatedArrival}
            onChange={(e) => setEstimatedArrival(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Submission Method
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="submitMode"
                value="csv"
                checked={submitMode === 'csv'}
                onChange={(e) => setSubmitMode(e.target.value as 'csv' | 'api')}
                className="mr-2"
              />
              <span className="text-sm">Download CSV</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="submitMode"
                value="api"
                checked={submitMode === 'api'}
                onChange={(e) => setSubmitMode(e.target.value as 'csv' | 'api')}
                className="mr-2"
              />
              <span className="text-sm">Submit to CustomsCity</span>
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {submitMode === 'csv' 
              ? 'Generate CSV file for manual upload to CustomsCity'
              : 'Submit directly to CustomsCity API (requires API key)'}
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order, orderIndex) => (
            <div key={orderIndex} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">Order {orderIndex + 1}</h3>
                {orders.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOrder(orderIndex)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Order
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Order Name
                  </label>
                  <input
                    type="text"
                    value={order.orderName}
                    onChange={(e) => updateOrder(orderIndex, 'orderName', e.target.value)}
                    placeholder="e.g., #1001"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={order.trackingNumber}
                    onChange={(e) => updateOrder(orderIndex, 'trackingNumber', e.target.value)}
                    placeholder="e.g., 1Z999AA10123456784"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">Products</label>
                {order.products.map((product, productIndex) => (
                  <div key={productIndex} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <select
                        value={product.productId}
                        onChange={(e) => updateProduct(orderIndex, productIndex, 'productId', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
                        required
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nickname} ({p.productCode})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => updateProduct(orderIndex, productIndex, 'quantity', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
                        placeholder="Qty"
                        required
                      />
                    </div>
                    {order.products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(orderIndex, productIndex)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addProduct(orderIndex)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Product
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addOrder}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Another Order
        </button>

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded">{success}</div>
        )}

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading 
            ? (submitMode === 'api' ? 'Submitting to CustomsCity...' : 'Generating CSV...') 
            : (submitMode === 'api' ? 'Submit to CustomsCity' : 'Generate CSV')}
        </button>
      </form>
    </div>
  )
}
