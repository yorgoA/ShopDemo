const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '../database');
const DB_PATH = path.join(DB_DIR, 'shop.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let sqlDb = null;
let insideTx = false;

function persist() {
  if (insideTx) return;
  const data = sqlDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Returns a statement handle with .run(), .get(), .all() matching better-sqlite3 API.
function prepare(sql) {
  return {
    run(...args) {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      sqlDb.run(sql, params);
      const idResult = sqlDb.exec('SELECT last_insert_rowid()');
      const lastInsertRowid = idResult.length ? idResult[0].values[0][0] : null;
      persist();
      return { lastInsertRowid };
    },
    get(...args) {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      const stmt = sqlDb.prepare(sql);
      stmt.bind(params);
      const row = stmt.step() ? stmt.getAsObject() : undefined;
      stmt.free();
      return row;
    },
    all(...args) {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      const stmt = sqlDb.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    },
  };
}

function transaction(fn) {
  return function () {
    sqlDb.run('BEGIN');
    insideTx = true;
    try {
      const result = fn();
      sqlDb.run('COMMIT');
      insideTx = false;
      persist();
      return result;
    } catch (err) {
      sqlDb.run('ROLLBACK');
      insideTx = false;
      throw err;
    }
  };
}

function getDb() {
  return { prepare, transaction };
}

function initializeDatabase() {
  const initSqlJs = require('sql.js');

  return initSqlJs().then((SQL) => {
    if (fs.existsSync(DB_PATH)) {
      sqlDb = new SQL.Database(fs.readFileSync(DB_PATH));
    } else {
      sqlDb = new SQL.Database();
    }

    sqlDb.run('PRAGMA foreign_keys = ON');

    sqlDb.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT '',
      address TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Migrate existing databases that predate name/address columns
    try { sqlDb.run("ALTER TABLE users ADD COLUMN name TEXT DEFAULT ''"); } catch {}
    try { sqlDb.run("ALTER TABLE users ADD COLUMN address TEXT DEFAULT ''"); } catch {}

    sqlDb.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0
    )`);

    sqlDb.run(`CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id),
      UNIQUE(user_id, product_id)
    )`);

    sqlDb.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    sqlDb.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    persist();
    seedIfEmpty();
    console.log('Database ready.');
  });
}

function seedIfEmpty() {
  const result = sqlDb.exec('SELECT COUNT(*) FROM products');
  const count = result.length ? result[0].values[0][0] : 0;
  if (count > 0) return;

  const products = [
    ['Wireless Headphones', 'Premium noise-cancelling wireless headphones with 30h battery life and foldable design.', 79.99, 50],
    ['Mechanical Keyboard', 'Compact TKL mechanical keyboard with RGB backlighting and tactile switches.', 129.99, 30],
    ['USB-C Hub', '7-in-1 USB-C hub with HDMI 4K, 3x USB 3.0, SD/microSD card reader and PD charging.', 39.99, 100],
    ['HD Webcam', '1080p HD webcam with built-in stereo microphone, auto-focus and privacy shutter.', 59.99, 45],
    ['LED Desk Lamp', 'Touch-controlled LED desk lamp with 5 color modes, adjustable brightness and USB charging port.', 34.99, 60],
    ['XL Mouse Pad', 'Extra-large desk mat (90×40cm) with stitched edges, non-slip rubber base.', 24.99, 80],
    ['Laptop Stand', 'Adjustable aluminum laptop stand compatible with 10–17" laptops, improves posture and airflow.', 49.99, 35],
    ['Portable Charger', '20000mAh power bank with USB-C PD 65W fast charging for laptops and phones.', 44.99, 55],
    ['Cable Management Kit', 'Complete desk cable organizer with 40 clips, 10 velcro ties and adhesive cable channels.', 14.99, 120],
    ['Monitor Light Bar', 'Screen-mounted LED light bar with auto-brightness sensor, asymmetric lighting to reduce glare.', 54.99, 40],
  ];

  const stmt = sqlDb.prepare('INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)');
  for (const row of products) {
    stmt.run(row);
  }
  stmt.free();
  persist();
}

module.exports = { getDb, initializeDatabase };
