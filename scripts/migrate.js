/**
 * Migration — ajoute les nouvelles tables sans effacer les données existantes
 * Usage: node scripts/migrate.js
 */
const path = require('path')
const fs = require('fs')

async function migrate() {
  const dbPath = path.join(__dirname, '..', 'data', 'shop.db')
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Base introuvable. Lance: npm run init-db')
    process.exit(1)
  }

  const { createClient } = require('@libsql/client')
  const db = createClient({ url: `file:${dbPath}` })

  console.log('⚡ Migration en cours...')

  const newTables = [
    `CREATE TABLE IF NOT EXISTS produit_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produit_id INTEGER NOT NULL, image_url TEXT NOT NULL, ordre INTEGER DEFAULT 0,
      FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS avis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produit_id INTEGER NOT NULL, client_id INTEGER,
      nom_auteur TEXT NOT NULL, note INTEGER NOT NULL,
      commentaire TEXT, created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS codes_promo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE, type TEXT DEFAULT 'pourcentage',
      valeur REAL NOT NULL, usage_max INTEGER DEFAULT 100,
      usage_count INTEGER DEFAULT 0, date_expiration TEXT,
      est_actif INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS statuts_historique (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      commande_id INTEGER NOT NULL, statut TEXT NOT NULL, note TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, titre TEXT NOT NULL,
      message TEXT, lue INTEGER DEFAULT 0, data TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS idx_commandes_num ON commandes(numero_commande)`,
    `CREATE INDEX IF NOT EXISTS idx_avis_produit ON avis(produit_id)`,
  ]

  for (const sql of newTables) {
    try {
      await db.execute(sql)
    } catch (e) {
      // Ignorer si déjà existant
    }
  }

  await db.close()
  console.log('✅ Migration terminée !')
  console.log('👉 Relance: npm run dev')
}

migrate().catch(err => { console.error('❌', err.message); process.exit(1) })
