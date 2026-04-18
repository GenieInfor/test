import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'

// GET — liste pour admin
export async function GET() {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const promos = await query('SELECT * FROM codes_promo ORDER BY created_at DESC')
  return NextResponse.json({ promos })
}

// POST — créer un code (admin) ou vérifier un code (client)
export async function POST(req: NextRequest) {
  const body = await req.json()

  // Vérification client
  if (body.action === 'verifier') {
    const { code, total } = body
    const promo = await queryOne<any>(
      'SELECT * FROM codes_promo WHERE code = ? AND est_actif = 1',
      [code.toUpperCase().trim()]
    )
    if (!promo) return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 404 })
    if (promo.usage_count >= promo.usage_max)
      return NextResponse.json({ error: 'Code épuisé' }, { status: 400 })
    if (promo.date_expiration && new Date(promo.date_expiration) < new Date())
      return NextResponse.json({ error: 'Code expiré' }, { status: 400 })

    const reduction = promo.type === 'pourcentage'
      ? Math.round(total * promo.valeur / 100)
      : Math.min(promo.valeur, total)

    return NextResponse.json({ promo, reduction, total_final: total - reduction })
  }

  // Création admin
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { code, type, valeur, usage_max, date_expiration } = body
  if (!code || !valeur) return NextResponse.json({ error: 'Code et valeur obligatoires' }, { status: 400 })
  const result = await execute(
    'INSERT INTO codes_promo (code, type, valeur, usage_max, date_expiration) VALUES (?,?,?,?,?)',
    [code.toUpperCase().trim(), type || 'pourcentage', valeur, usage_max || 100, date_expiration || null]
  )
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 })
}
