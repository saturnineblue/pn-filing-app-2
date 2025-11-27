import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const CUSTOMSCITY_API_BASE_URL = 'https://app.customscity.com/api'
const CUSTOMSCITY_API_KEY = process.env.CUSTOMSCITY_API_KEY

export async function POST(request: Request) {
  try {
    const { submissionIds } = await request.json() as { submissionIds: string[] }

    if (!submissionIds || submissionIds.length === 0) {
      return NextResponse.json(
        { error: 'Submission IDs are required' },
        { status: 400 }
      )
    }

    if (!CUSTOMSCITY_API_KEY) {
      return NextResponse.json(
        { error: 'CustomsCity API key not configured' },
        { status: 500 }
      )
    }

    // Fetch submissions from database
    const submissions = await prisma.submission.findMany({
      where: {
        id: { in: submissionIds },
        documentId: { not: null },
      },
    })

    const results = []

    // Check each submission's PNC status
    for (const submission of submissions) {
      try {
        // Query CustomsCity for document status
        // Note: Adjust this endpoint based on actual CustomsCity API documentation
        const response = await fetch(
          `${CUSTOMSCITY_API_BASE_URL}/api/abi/documents/${submission.documentId}`,
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

          results.push({
            submissionId: submission.id,
            orderName: submission.orderName,
            pncNumber: data.pncNumber,
            success: true,
          })
        } else if (!response.ok) {
          // API error
          results.push({
            submissionId: submission.id,
            orderName: submission.orderName,
            success: false,
            message: data.message || `API error: ${response.status}`,
          })
        } else {
          // PNC not yet available
          results.push({
            submissionId: submission.id,
            orderName: submission.orderName,
            success: false,
            message: 'PNC not yet available',
          })
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 300))

      } catch (error) {
        results.push({
          submissionId: submission.id,
          orderName: submission.orderName,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      total: results.length,
      successful,
      failed,
      results,
    })

  } catch (error) {
    console.error('Check PNC error:', error)
    return NextResponse.json(
      { error: 'Failed to check PNC status' },
      { status: 500 }
    )
  }
}
