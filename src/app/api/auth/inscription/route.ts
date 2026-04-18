import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db'
import { hashPassword, validatePhone, validateName, validatePassword, sanitize, createToken, COOKIE_NAME_CLIENT } from '@/lib/auth'

const attempts = new Map<string, { count: number; time: number }>()

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const att = attempts.get(ip)
    if (att && att.count >= 10 && now - att.time < 15 * 60 * 1000)
      return NextResponse.json({ error: 'Trop de tentatives.' }, { status: 429 })

    const body = await req.json()
    const { nom, prenom, telephone, ville, quartier, mot_de_passe } = body

    if (!nom || !prenom || !telephone || !ville || !quartier || !mot_de_passe)
      return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 })
    if (!validateName(nom) || !validateName(prenom))
      return NextResponse.json({ error: 'Nom ou prénom invalide' }, { status: 400 })
    if (!validatePhone(telephone))
      return NextResponse.json({ error: 'Numéro de téléphone invalide' }, { status: 400 })
    if (!validatePassword(mot_de_passe))
      return NextResponse.json({ error: 'Mot de passe trop faible (min. 8 caractères avec 1 chiffre)' }, { status: 400 })

    const existing = await queryOne('SELECT id FROM clients WHERE telephone = ?', [sanitize(telephone)])
    if (existing)
      return NextResponse.json({ error: 'Ce numéro est déjà utilisé' }, { status: 409 })

    const hashedPwd = await hashPassword(mot_de_passe)
    const result = await execute(
      'INSERT INTO clients (nom, prenom, telephone, ville, quartier, mot_de_passe) VALUES (?,?,?,?,?,?)',
      [sanitize(nom), sanitize(prenom), sanitize(telephone), sanitize(ville), sanitize(quartier), hashedPwd]
    )

    const client = {
      id: result.lastInsertRowid,
      nom: sanitize(nom), prenom: sanitize(prenom),
      telephone: sanitize(telephone), ville: sanitize(ville), quartier: sanitize(quartier),
    }

    const token = await createToken({ id: Number(result.lastInsertRowid), telephone: sanitize(telephone), role: 'client' })
    attempts.delete(ip)

    const response = NextResponse.json({ client }, { status: 201 })
    response.cookies.set(COOKIE_NAME_CLIENT, token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/',
    })
    return response
  } catch (err: any) {
    console.error('Inscription error:', err)
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}
