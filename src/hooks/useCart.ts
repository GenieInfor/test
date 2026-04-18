'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CartItem, Produit } from '@/types'

const CART_KEY = 'shopcid_cart'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY)
    if (stored) {
      try { setItems(JSON.parse(stored)) } catch {}
    }
  }, [])

  const save = (newItems: CartItem[]) => {
    setItems(newItems)
    localStorage.setItem(CART_KEY, JSON.stringify(newItems))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const addItem = useCallback((produit: Produit, quantite = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.produit.id === produit.id)
      const updated = existing
        ? prev.map(i => i.produit.id === produit.id
            ? { ...i, quantite: i.quantite + quantite }
            : i)
        : [...prev, { produit, quantite }]
      localStorage.setItem(CART_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeItem = useCallback((produitId: number) => {
    setItems(prev => {
      const updated = prev.filter(i => i.produit.id !== produitId)
      localStorage.setItem(CART_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const updateQuantite = useCallback((produitId: number, quantite: number) => {
    if (quantite <= 0) return removeItem(produitId)
    setItems(prev => {
      const updated = prev.map(i =>
        i.produit.id === produitId ? { ...i, quantite } : i
      )
      localStorage.setItem(CART_KEY, JSON.stringify(updated))
      return updated
    })
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem(CART_KEY)
  }, [])

  const total = items.reduce((sum, item) => {
    const prix = item.produit.prix_promo ?? item.produit.prix
    return sum + prix * item.quantite
  }, 0)

  const count = items.reduce((sum, item) => sum + item.quantite, 0)

  return { items, addItem, removeItem, updateQuantite, clearCart, total, count }
}
