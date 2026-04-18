import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  await execute('UPDATE codes_promo SET usage_count = usage_count + 1 WHERE code = ?', [code.toUpperCase()])
  return NextResponse.json({ success: true })
}
