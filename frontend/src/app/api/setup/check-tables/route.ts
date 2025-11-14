import { NextRequest, NextResponse } from 'next/server'
import { getTursoClient } from '@/lib/turso'

export async function GET(request: NextRequest) {
  try {
    const client = getTursoClient()

    const result = await client.execute(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `)

    return NextResponse.json({
      success: true,
      totalTables: result.rows?.length || 0,
      tables: result.rows?.map((r: any) => r.name) || []
    })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
