import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    let contextInfo = ''
    try {
      const categories = await query<any>('SELECT nom FROM categories WHERE est_active=1 LIMIT 10')
      const produits = await query<any>('SELECT nom, prix, stock FROM produits WHERE est_actif=1 LIMIT 20')
      contextInfo = `Catégories: ${categories.map((c: any) => c.nom).join(', ')}
Produits: ${produits.map((p: any) => `${p.nom} (${Number(p.prix).toLocaleString('fr-FR')} FCFA)`).join(', ')}`
    } catch {}

    const systemPrompt = `Tu es l'assistant virtuel de ShopCid, une boutique en ligne.
Tu aides les clients à trouver des produits, comprendre les commandes et la livraison.
${contextInfo}
- Livraison dans tous les quartiers, paiement à la livraison disponible
- Commande possible sans compte
Réponds en français, de manière concise et chaleureuse.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 400,
        system: systemPrompt,
        messages: [...history.slice(-6).map((m: any) => ({ role: m.role, content: m.content })), { role: 'user', content: message }],
      }),
    })

    if (!response.ok) throw new Error('API IA indisponible')
    const data = await response.json()
    return NextResponse.json({ reply: data.content?.[0]?.text || 'Désolé, je ne peux pas répondre.' })
  } catch {
    return NextResponse.json({ reply: "Bonjour ! Je suis votre assistant ShopCid. Comment puis-je vous aider ?" })
  }
}
