/**
 * Script de réinitialisation de l'admin
 * Usage: node scripts/reset-admin.js
 */
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

async function main() {
  const dataDir = path.join(__dirname, '..', 'data')
  const dbPath = path.join(dataDir, 'shop.db')

  if (!fs.existsSync(dbPath)) {
    console.log('❌ Base de données introuvable. Lance dabord: npm run init-db')
    process.exit(1)
  }

  const { createClient } = require('@libsql/client')
  const db = createClient({ url: `file:${dbPath}` })

  // Vérifier que la table admins existe
  try {
    await db.execute('SELECT COUNT(*) FROM admins')
  } catch {
    console.log('❌ Table admins inexistante. Lance: npm run init-db')
    process.exit(1)
  }

  const telephone = '00000000'
  const motDePasse = 'Admin123!'
  const hash = bcrypt.hashSync(motDePasse, 12)

  // Supprimer l'ancien admin et recréer
  await db.execute('DELETE FROM admins WHERE telephone = ?', [telephone])
  await db.execute({
    sql: 'INSERT INTO admins (nom, telephone, mot_de_passe) VALUES (?,?,?)',
    args: ['Administrateur', telephone, hash]
  })

  // Vérification
  const admin = await db.execute({
    sql: 'SELECT id, nom, telephone FROM admins WHERE telephone = ?',
    args: [telephone]
  })

  if (admin.rows.length > 0) {
    console.log('✅ Admin réinitialisé avec succès !')
    console.log('')
    console.log('   Téléphone  : ' + telephone)
    console.log('   Mot de passe : ' + motDePasse)
    console.log('')
    console.log('👉 Va sur http://localhost:3000/admin/login')
  } else {
    console.log('❌ Erreur lors de la création de l\'admin')
  }

  await db.close()
}

main().catch(err => {
  console.error('❌ Erreur:', err.message)
  process.exit(1)
})
