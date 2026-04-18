const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

async function main() {
  const dataDir = path.join(__dirname, '..', 'data')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

  console.log('⚡ Initialisation SQLite...')
  const { createClient } = require('@libsql/client')
  const db = createClient({ url: `file:${path.join(dataDir, 'shop.db')}` })

  const tables = [
    `CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL, prenom TEXT NOT NULL,
      telephone TEXT NOT NULL UNIQUE, ville TEXT NOT NULL, quartier TEXT NOT NULL,
      mot_de_passe TEXT NOT NULL, est_actif INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL, telephone TEXT NOT NULL UNIQUE,
      mot_de_passe TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL, description TEXT, image_url TEXT, est_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS produits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL, description TEXT, prix REAL NOT NULL, prix_promo REAL,
      stock INTEGER DEFAULT 0, image_url TEXT, categorie_id INTEGER,
      est_actif INTEGER DEFAULT 1, est_vedette INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS produit_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produit_id INTEGER NOT NULL, image_url TEXT NOT NULL, ordre INTEGER DEFAULT 0,
      FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS commandes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_commande TEXT NOT NULL UNIQUE, client_id INTEGER,
      nom_invite TEXT, prenom_invite TEXT, telephone_invite TEXT, quartier_invite TEXT,
      statut TEXT DEFAULT 'en_attente',
      montant_total REAL NOT NULL, notes TEXT,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS commande_lignes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      commande_id INTEGER NOT NULL, produit_id INTEGER,
      nom_produit TEXT NOT NULL, prix_unitaire REAL NOT NULL,
      quantite INTEGER NOT NULL DEFAULT 1, sous_total REAL NOT NULL,
      FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS statuts_historique (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      commande_id INTEGER NOT NULL, statut TEXT NOT NULL, note TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
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
      code TEXT NOT NULL UNIQUE,
      type TEXT DEFAULT 'pourcentage',
      valeur REAL NOT NULL,
      usage_max INTEGER DEFAULT 100,
      usage_count INTEGER DEFAULT 0,
      date_expiration TEXT,
      est_actif INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, titre TEXT NOT NULL,
      message TEXT, lue INTEGER DEFAULT 0, data TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS idx_clients_tel ON clients(telephone)`,
    `CREATE INDEX IF NOT EXISTS idx_commandes_statut ON commandes(statut)`,
    `CREATE INDEX IF NOT EXISTS idx_commandes_num ON commandes(numero_commande)`,
    `CREATE INDEX IF NOT EXISTS idx_produits_cat ON produits(categorie_id)`,
    `CREATE INDEX IF NOT EXISTS idx_avis_produit ON avis(produit_id)`,
  ]

  for (const sql of tables) {
    await db.execute(sql)
  }
  console.log('✅ Tables créées')

  // Admin
  const existing = await db.execute({ sql: 'SELECT id FROM admins WHERE telephone=?', args: ['00000000'] })
  if (existing.rows.length === 0) {
    const hash = bcrypt.hashSync('Admin123!', 12)
    await db.execute({ sql: 'INSERT INTO admins (nom, telephone, mot_de_passe) VALUES (?,?,?)', args: ['Administrateur', '00000000', hash] })
    console.log('✅ Admin créé')
    console.log('   Téléphone  : 00000000')
    console.log('   Mot de passe : Admin123!')
    console.log('   ⚠️  Changez ce mot de passe !')
  } else {
    console.log('ℹ️  Admin déjà existant')
  }

  // Catégories
  const cats = await db.execute('SELECT COUNT(*) as c FROM categories')
  if (Number(cats.rows[0].c) === 0) {
    const data = [['Électronique','Appareils et accessoires'],['Mode','Vêtements et mode'],['Maison','Décoration et mobilier'],['Sport','Équipements sportifs']]
    for (const [nom, desc] of data) {
      await db.execute({ sql: 'INSERT INTO categories (nom, description) VALUES (?,?)', args: [nom, desc] })
    }
    console.log('✅ 4 catégories créées')
  }

  await db.close()
  console.log('')
  console.log('🎉 Base de données prête : data/shop.db')
  console.log('👉 Lance: npm run dev')
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
