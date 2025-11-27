import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const CUSTOMSCITY_API_BASE_URL = 'https://app.customscity.com/api'
const CUSTOMSCITY_API_KEY = process.env.CUSTOMSCITY_API_KEY

export async function POST(request: Request) {
  try {
    const { status = 'submitted', limit = 50 } = await request.json() as {
      status?: string
      limit?: number
    }

    if (!CUSTOMSCITY_API_KEY) {
      return NextResponse.json(
        { error: 'CustomsCity API key not configured' },
        { status: 500 }
      )
    }

    // Fetch submissions that need PNC checking
    const submissions = await prisma.submission.findMany({
      where: {
        status: status, // Default to 'submitted' status
        documentId: { not: null },
        pncNumber: null, // Only those without PNC yet
      },
      orderBy: { submittedAt: 'asc' }, // Oldest first
      take: limit,
    })

    if (submissions.length === 0) {
      return NextResponse.json({
        message: 'No submissions found that need PNC checking',
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        results: [],
      })
    }

    const results = []
    let successful = 0
    let failed = 0

    // Process submissions in batches to avoid overwhelming the API
    const batchSize = 5
    for (let i = 0; i < submissions.length; i += batchSize) {
      const batch = submissions.slice(i, i + batchSize)

      // Process batch concurrently
      const batchPromises = batch.map(async (submission) => {
        try {
          // Query CustomsCity for document status using PN v2 endpoint
          const response = await fetch(
            `${CUSTOMSCITY_API_BASE_URL}/pn-v2/submissions/${submission.documentId}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${CUSTOMSCITY_API_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          )

          const text = await response.text()
          let data
          try {
            data = JSON.parse(text)
          } catch (e) {
            data = { message: text }
          }

          if (response.ok && data.pncNumber) {
            // Update submission with PNC number
            await prisma.submission.update({
              where: { id: submission.id },
              data: {
                pncNumber: data.pncNumber,
                status: 'pnc_received',
                pncRetrievedAt: new Date(),
              },
            })

            successful++
            return {
              submissionId: submission.id,
              orderName: submission.orderName,
              trackingNumber: submission.trackingNumber,
              pncNumber: data.pncNumber,
              success: true,
            }
          } else if (!response.ok) {
            // API error
            failed++
            return {
              submissionId: submission.id,
              orderName: submission.orderName,
              trackingNumber: submission.trackingNumber,
              success: false,
              message: data.message || `API error: ${response.status}`,
            }
          } else {
            // PNC not yet available
            failed++
            return {
              submissionId: submission.id,
              orderName: submission.orderName,
              trackingNumber: submission.trackingNumber,
              success: false,
              message: 'PNC not yet available',
            }
          }
        } catch (error) {
          failed++
          return {
            submissionId: submission.id,
            orderName: submission.orderName,
            trackingNumber: submission.trackingNumber,
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      })

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Small delay between batches to be respectful to the API
      if (i + batchSize < submissions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} submissions`,
      total: submissions.length,
      processed: results.length,
      successful,
      failed,
      results,
    })

  } catch (error) {
    console.error('Bulk check PNC error:', error)
    return NextResponse.json(
      { error: 'Failed to bulk check PNC status' },
      { status: 500 }
    )
  }
}
