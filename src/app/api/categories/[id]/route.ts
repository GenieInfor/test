import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const formData = await req.formData()
  const nom = formData.get('nom') as string
  const description = formData.get('description') as string
  const est_active = formData.get('est_active') !== 'false' ? 1 : 0
  const imageFile = formData.get('image') as File | null
  let image_url: string | null = formData.get('image_url') as string | null
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const filename = `cat_${Date.now()}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), Buffer.from(await imageFile.arrayBuffer()))
    image_url = `/uploads/${filename}`
  }
  await execute(`UPDATE categories SET nom=?, description=?, image_url=?, est_active=?, updated_at=datetime('now') WHERE id=?`,
    [nom, description || null, image_url, est_active, id])
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  await execute(`UPDATE categories SET est_active=0 WHERE id=?`, [id])
  return NextResponse.json({ success: true })
}
