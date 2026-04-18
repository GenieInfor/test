import { NextRequest, NextResponse } from 'next/server'
import { execute, query } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categorie = searchParams.get('categorie')
  let sql = `SELECT p.*, c.nom as categorie_nom FROM produits p LEFT JOIN categories c ON p.categorie_id = c.id WHERE p.est_actif = 1`
  const params: any[] = []
  if (categorie) { sql += ' AND p.categorie_id = ?'; params.push(categorie) }
  sql += ' ORDER BY p.created_at DESC'
  return NextResponse.json({ produits: await query(sql, params) })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const formData = await req.formData()
    const nom = formData.get('nom') as string
    const description = formData.get('description') as string
    const prix = parseFloat(formData.get('prix') as string)
    const prix_promo = formData.get('prix_promo') ? parseFloat(formData.get('prix_promo') as string) : null
    const stock = parseInt(formData.get('stock') as string) || 0
    const categorie_id = formData.get('categorie_id') ? parseInt(formData.get('categorie_id') as string) : null
    const est_vedette = formData.get('est_vedette') === 'true' ? 1 : 0
    const imageFile = formData.get('image') as File | null
    if (!nom || !prix) return NextResponse.json({ error: 'Nom et prix obligatoires' }, { status: 400 })
    let image_url: string | null = null
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split('.').pop()
      const filename = `prod_${Date.now()}.${ext}`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })
      await writeFile(path.join(uploadDir, filename), Buffer.from(await imageFile.arrayBuffer()))
      image_url = `/uploads/${filename}`
    }
    const result = await execute(
      'INSERT INTO produits (nom, description, prix, prix_promo, stock, image_url, categorie_id, est_vedette) VALUES (?,?,?,?,?,?,?,?)',
      [nom, description || null, prix, prix_promo, stock, image_url, categorie_id, est_vedette]
    )
    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 })
  } catch (err) { console.error(err); return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 }) }
}
