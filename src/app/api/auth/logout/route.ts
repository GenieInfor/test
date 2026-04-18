import { NextResponse } from 'next/server'
import { COOKIE_NAME_CLIENT } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_NAME_CLIENT)
  return response
}
