#!/usr/bin/env tsx
/**
 * Database builder for Russian Law MCP server.
 *
 * Builds the SQLite database from seed JSON files in data/seed/.
 *
 * Usage: npm run build:db
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_DIR = path.resolve(__dirname, '../data/seed');
const DB_PATH = path.resolve(__dirname, '../data/database.db');

// ─────────────────────────────────────────────────────────────────────────────
// Seed file types
// ─────────────────────────────────────────────────────────────────────────────

interface LawSeed {
  id: string;
  title: string;
  title_en?: string;
  identifier: string;
  law_type: string;
  status?: string;
  effective_date?: string;
  publication_date?: string;
  source_url?: string;
  last_amended?: string;
  last_updated?: string;
  description?: string;
}

interface ProvisionSeed {
  article: string;
  title?: string;
  content: string;
  part?: string;
  paragraph?: string;
  provision_ref?: string;
  order_index?: number;
  metadata?: Record<string, unknown>;
}

interface SeedFile {
  law: LawSeed;
  provisions: ProvisionSeed[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Database schema
// ─────────────────────────────────────────────────────────────────────────────

const SCHEMA = `
-- Laws (federal laws, codes, presidential decrees, government resolutions)
CREATE TABLE laws (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_en TEXT,
    identifier TEXT NOT NULL,
    law_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_force',
    effective_date TEXT,
    publication_date TEXT,
    source_url TEXT,
    last_amended TEXT,
    last_updated TEXT,
    description TEXT,
    provision_count INTEGER DEFAULT 0
);

-- Individual provisions (articles, parts, paragraphs)
CREATE TABLE provisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    law_id TEXT NOT NULL REFERENCES laws(id),
    article TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    part TEXT,
    paragraph TEXT,
    provision_ref TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    metadata TEXT
);

-- Unique index for deduplication (expressions allowed in CREATE INDEX)
CREATE UNIQUE INDEX idx_provisions_unique
    ON provisions(law_id, article, COALESCE(part, ''), COALESCE(paragraph, ''));

-- FTS5 for provision search
CREATE VIRTUAL TABLE provisions_fts USING fts5(
    content, title, article,
    content='provisions',
    content_rowid='rowid',
    tokenize='unicode61'
);

-- FTS sync triggers
CREATE TRIGGER provisions_ai AFTER INSERT ON provisions BEGIN
    INSERT INTO provisions_fts(rowid, content, title, article)
    VALUES (new.rowid, new.content, new.title, new.article);
END;
CREATE TRIGGER provisions_ad AFTER DELETE ON provisions BEGIN
    INSERT INTO provisions_fts(provisions_fts, rowid, content, title, article)
    VALUES ('delete', old.rowid, old.content, old.title, old.article);
END;
CREATE TRIGGER provisions_au AFTER UPDATE ON provisions BEGIN
    INSERT INTO provisions_fts(provisions_fts, rowid, content, title, article)
    VALUES ('delete', old.rowid, old.content, old.title, old.article);
    INSERT INTO provisions_fts(rowid, content, title, article)
    VALUES (new.rowid, new.content, new.title, new.article);
END;

-- EU documents (directives and regulations referenced by Russian law)
CREATE TABLE IF NOT EXISTS eu_documents (
    id TEXT PRIMARY KEY,
    document_type TEXT NOT NULL,
    document_number TEXT,
    title TEXT NOT NULL,
    short_title TEXT,
    celex TEXT,
    year INTEGER,
    community TEXT DEFAULT 'EU',
    in_force INTEGER DEFAULT 1,
    source_url TEXT
);

-- EU references linking Russian law provisions to EU directives/regulations
CREATE TABLE eu_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    law_id TEXT NOT NULL REFERENCES laws(id),
    provision_id INTEGER REFERENCES provisions(id),
    eu_directive TEXT,
    eu_regulation TEXT,
    eu_article TEXT,
    reference_type TEXT
);

-- Cross-references between provisions/laws
CREATE TABLE cross_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_law_id TEXT NOT NULL REFERENCES laws(id),
    source_provision_ref TEXT,
    target_law_id TEXT NOT NULL,
    target_provision_ref TEXT,
    ref_type TEXT DEFAULT 'reference'
);

-- Build metadata (tier, schema version, build timestamp)
CREATE TABLE db_metadata (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Indexes
CREATE INDEX idx_provisions_law_id ON provisions(law_id);
CREATE INDEX idx_provisions_article ON provisions(article);
CREATE INDEX idx_provisions_ref ON provisions(provision_ref);
CREATE INDEX idx_eu_references_law_id ON eu_references(law_id);
CREATE INDEX idx_cross_refs_source ON cross_references(source_law_id);
`;

// ─────────────────────────────────────────────────────────────────────────────
// Build
// ─────────────────────────────────────────────────────────────────────────────

function buildDatabase(): void {
  console.log('Building Russian Law MCP database...\n');

  // Delete existing database if present
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('  Deleted existing database.');
  }

  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  // Create schema
  db.exec(SCHEMA);

  // Prepared statements
  const insertLaw = db.prepare(`
    INSERT INTO laws (id, title, title_en, identifier, law_type, status, effective_date, publication_date, source_url, last_amended, last_updated, description, provision_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertProvision = db.prepare(`
    INSERT OR IGNORE INTO provisions (law_id, article, title, content, part, paragraph, provision_ref, order_index, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const updateProvisionCount = db.prepare(`
    UPDATE laws SET provision_count = ? WHERE id = ?
  `);

  // Load seed files
  if (!fs.existsSync(SEED_DIR)) {
    console.log(`No seed directory at ${SEED_DIR} — creating empty database.`);
    writeBuildMetadata(db, 0, 0);
    finalizeDatabase(db);
    return;
  }

  const seedFiles = fs.readdirSync(SEED_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('.') && !f.startsWith('_'));

  if (seedFiles.length === 0) {
    console.log('No seed files found. Database created with empty schema.');
    writeBuildMetadata(db, 0, 0);
    finalizeDatabase(db);
    return;
  }

  let totalLaws = 0;
  let totalProvisions = 0;

  const loadAll = db.transaction(() => {
    for (const file of seedFiles) {
      const filePath = path.join(SEED_DIR, file);
      console.log(`  Loading ${file}...`);

      const content = fs.readFileSync(filePath, 'utf-8');
      const seed = JSON.parse(content) as SeedFile;
      const law = seed.law;

      insertLaw.run(
        law.id,
        law.title,
        law.title_en ?? null,
        law.identifier,
        law.law_type,
        law.status ?? 'in_force',
        law.effective_date ?? null,
        law.publication_date ?? null,
        law.source_url ?? null,
        law.last_amended ?? null,
        law.last_updated ?? null,
        law.description ?? null,
        0 // provision_count — updated after inserting provisions
      );
      totalLaws++;

      let provisionCount = 0;
      for (let i = 0; i < seed.provisions.length; i++) {
        const prov = seed.provisions[i];
        insertProvision.run(
          law.id,
          prov.article,
          prov.title ?? null,
          prov.content,
          prov.part ?? null,
          prov.paragraph ?? null,
          prov.provision_ref ?? null,
          prov.order_index ?? i,
          prov.metadata ? JSON.stringify(prov.metadata) : null
        );
        provisionCount++;
      }

      updateProvisionCount.run(provisionCount, law.id);
      totalProvisions += provisionCount;

      console.log(`    ${provisionCount} provisions`);
    }
  });

  loadAll();

  // Get actual counts from the database (INSERT OR IGNORE may skip duplicates)
  const actualLaws = db.prepare('SELECT COUNT(*) as c FROM laws').get() as { c: number };
  const actualProvisions = db.prepare('SELECT COUNT(*) as c FROM provisions').get() as { c: number };

  writeBuildMetadata(db, actualLaws.c, actualProvisions.c);
  finalizeDatabase(db);

  const size = fs.statSync(DB_PATH).size;
  console.log(
    `\nBuild complete: ${actualLaws.c} laws, ${actualProvisions.c} provisions`
  );
  console.log(`Output: ${DB_PATH} (${(size / 1024).toFixed(1)} KB)`);
}

function writeBuildMetadata(db: Database.Database, laws: number, provisions: number): void {
  const insertMeta = db.prepare('INSERT INTO db_metadata (key, value) VALUES (?, ?)');
  const writeMeta = db.transaction(() => {
    insertMeta.run('tier', 'free');
    insertMeta.run('schema_version', '1');
    insertMeta.run('built_at', new Date().toISOString());
    insertMeta.run('builder', 'build-db.ts');
    insertMeta.run('law_count', String(laws));
    insertMeta.run('provision_count', String(provisions));
  });
  writeMeta();
}

function finalizeDatabase(db: Database.Database): void {
  db.pragma('wal_checkpoint(TRUNCATE)');
  db.pragma('journal_mode = DELETE');
  db.exec('ANALYZE');
  db.close();
}

buildDatabase();
