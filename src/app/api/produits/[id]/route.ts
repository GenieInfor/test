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
  const prix = parseFloat(formData.get('prix') as string)
  const prix_promo = formData.get('prix_promo') ? parseFloat(formData.get('prix_promo') as string) : null
  const stock = parseInt(formData.get('stock') as string) || 0
  const categorie_id = formData.get('categorie_id') ? parseInt(formData.get('categorie_id') as string) : null
  const est_vedette = formData.get('est_vedette') === 'true' ? 1 : 0
  const est_actif = formData.get('est_actif') !== 'false' ? 1 : 0
  const imageFile = formData.get('image') as File | null
  let image_url: string | null = formData.get('image_url') as string | null
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const filename = `prod_${Date.now()}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), Buffer.from(await imageFile.arrayBuffer()))
    image_url = `/uploads/${filename}`
  }
  await execute(
    `UPDATE produits SET nom=?, description=?, prix=?, prix_promo=?, stock=?, image_url=?, categorie_id=?, est_vedette=?, est_actif=?, updated_at=datetime('now') WHERE id=?`,
    [nom, description || null, prix, prix_promo, stock, image_url, categorie_id, est_vedette, est_actif, id]
  )
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  await execute(`UPDATE produits SET est_actif=0, updated_at=datetime('now') WHERE id=?`, [id])
  return NextResponse.json({ success: true })
}
