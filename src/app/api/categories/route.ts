import { NextRequest, NextResponse } from 'next/server'
import { execute, query } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET() {
  return NextResponse.json({ categories: await query('SELECT * FROM categories WHERE est_active=1 ORDER BY nom ASC') })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const formData = await req.formData()
    const nom = formData.get('nom') as string
    const description = formData.get('description') as string
    const imageFile = formData.get('image') as File | null
    if (!nom) return NextResponse.json({ error: 'Nom obligatoire' }, { status: 400 })
    let image_url: string | null = null
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split('.').pop()
      const filename = `cat_${Date.now()}.${ext}`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })
      await writeFile(path.join(uploadDir, filename), Buffer.from(await imageFile.arrayBuffer()))
      image_url = `/uploads/${filename}`
    }
    const result = await execute('INSERT INTO categories (nom, description, image_url) VALUES (?,?,?)', [nom, description || null, image_url])
    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 })
  } catch (err) { return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 }) }
}
