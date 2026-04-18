/**
 * Couche base de données universelle
 * LOCAL  → SQLite via @libsql/client  (fichier data/shop.db)
 * PROD   → PostgreSQL via pg
 *
 * serialize() convertit les Row libsql en plain objects (requis par Next.js RSC)
 */

const IS_PROD = process.env.NODE_ENV === 'production'

// Convertit les Row libsql (objets spéciaux) en plain objects JSON
function serialize<T>(rows: any[]): T[] {
  return JSON.parse(JSON.stringify(rows)) as T[]
}

// ─── PostgreSQL ───────────────────────────────────────────────────────────────
let _pgPool: any = null
function getPgPool() {
  if (!_pgPool) {
    const { Pool } = require('pg')
    _pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10,
    })
  }
  return _pgPool
}

// ─── SQLite libsql ────────────────────────────────────────────────────────────
let _sqliteClient: any = null
async function getSqliteClient() {
  if (!_sqliteClient) {
    const { createClient } = require('@libsql/client')
    const path = require('path')
    const fs = require('fs')
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
    _sqliteClient = createClient({
      url: `file:${path.join(dataDir, 'shop.db')}`,
    })
  }
  return _sqliteClient
}

// ? → $1, $2, $3 pour PostgreSQL
function toPg(sql: string): string {
  let i = 0
  return sql.replace(/\?/g, () => `$${++i}`)
}

// ─── API publique ─────────────────────────────────────────────────────────────

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    if (IS_PROD) {
      const { rows } = await getPgPool().query(toPg(sql), params)
      return serialize<T>(rows)
    } else {
      const client = await getSqliteClient()
      const res = await client.execute({ sql, args: params })
      return serialize<T>(res.rows)
    }
  } catch (err) {
    console.error('DB query error:', err)
    throw new Error('Erreur base de données')
  }
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

export async function execute(
  sql: string,
  params: any[] = []
): Promise<{ lastInsertRowid?: number; changes?: number }> {
  try {
    if (IS_PROD) {
      const pgSql = /^\s*INSERT/i.test(sql) ? toPg(sql) + ' RETURNING id' : toPg(sql)
      const res = await getPgPool().query(pgSql, params)
      return {
        lastInsertRowid: res.rows?.[0]?.id,
        changes: res.rowCount ?? 0,
      }
    } else {
      const client = await getSqliteClient()
      const res = await client.execute({ sql, args: params })
      return {
        lastInsertRowid: Number(res.lastInsertRowid ?? 0),
        changes: res.rowsAffected ?? 0,
      }
    }
  } catch (err) {
    console.error('DB execute error:', err)
    throw new Error('Erreur base de données')
  }
}
