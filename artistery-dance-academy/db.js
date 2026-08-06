const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'artistery.db');
const db = new sqlite3.Database(dbPath);

// Helper promise functions for clean async database operations
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initDB() {
  console.log('Initializing SQLite database at:', dbPath);

  // 1. Create Tables
  await runAsync(`
    CREATE TABLE IF NOT EXISTS pricing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      price INTEGER NOT NULL,
      unit TEXT NOT NULL,
      description TEXT,
      badge TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      images TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await runAsync(`ALTER TABLE photos ADD COLUMN images TEXT`);
  } catch (e) {
    // Column already exists
  }

  await runAsync(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      dance_style TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'New',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL
    );
  `);

  // 2. Seed Default Settings if Empty
  const settingsCount = await getAsync(`SELECT COUNT(*) as count FROM settings`);
  if (settingsCount.count === 0) {
    console.log('Seeding initial academy settings...');
    await runAsync(`INSERT INTO settings (key, value) VALUES ('academy_name', 'Artistery Academy')`);
    await runAsync(`INSERT INTO settings (key, value) VALUES ('contact_no', '8767100648')`);
    await runAsync(`INSERT INTO settings (key, value) VALUES ('location', 'Near Bharat Mata Chowk, MOSHI, PUNE')`);
    await runAsync(`INSERT INTO settings (key, value) VALUES ('email', 'waghsejal.8676@gmail.com')`);
    await runAsync(`INSERT INTO settings (key, value) VALUES ('whatsapp_text', 'For more details connect us on WhatsApp')`);
  }

  // 3. Seed Default Admin User & Ensure Credentials
  const adminCount = await getAsync(`SELECT COUNT(*) as count FROM admin`);
  if (adminCount.count === 0) {
    console.log('Seeding initial admin user...');
    await runAsync(
      `INSERT INTO admin (username, password, email) VALUES (?, ?, ?)`,
      ['waghsejal.8676@gmail.com', 'Sejal@8676', 'waghsejal.8676@gmail.com']
    );
  } else {
    // Ensure admin user and email are set to requested credentials
    await runAsync(
      `INSERT OR REPLACE INTO admin (id, username, password, email) VALUES (1, ?, ?, ?)`,
      ['waghsejal.8676@gmail.com', 'Sejal@8676', 'waghsejal.8676@gmail.com']
    );
  }

  // 4. Seed Pricing Data if Empty
  const pricingCount = await getAsync(`SELECT COUNT(*) as count FROM pricing`);
  if (pricingCount.count === 0) {
    console.log('Seeding default pricing options...');
    const initialPrices = [
      {
        category: 'Regular Classes',
        title: 'Individual Person Joining',
        price: 1200,
        unit: 'per person / month',
        description: 'Comprehensive regular batch training for beginners and enthusiasts. Learn foundation, rhythm, and choreography.',
        badge: 'Most Popular'
      },
      {
        category: 'Choreography',
        title: 'Private Choreography',
        price: 2500,
        unit: 'per person / course',
        description: 'One-on-one personalized dance choreography tailored to your style, music choice, and skill level.',
        badge: 'Personalized'
      },
      {
        category: 'Sangeet Special',
        title: 'Sangeet Choreography - Kids',
        price: 3000,
        unit: 'per kid (Age 7-16)',
        description: 'Fun, cute, and high-energy wedding choreography designed specifically for young stars aged 7 to 16.',
        badge: 'Kids Special (7-16)'
      },
      {
        category: 'Sangeet Special',
        title: 'Sangeet Choreography - Adults',
        price: 4500,
        unit: 'per adult',
        description: 'Showstopping solo or group sangeet dance routine for adults with energetic Bollywood & Fusion beats.',
        badge: 'Adults Special'
      },
      {
        category: 'Sangeet Special',
        title: 'Sangeet Choreography - Couple',
        price: 8000,
        unit: 'per couple',
        description: 'Romantic and grand bride & groom / couple choreography with customized song transitions and prop support.',
        badge: 'Bestseller'
      }
    ];

    for (const p of initialPrices) {
      await runAsync(
        `INSERT INTO pricing (category, title, price, unit, description, badge) VALUES (?, ?, ?, ?, ?, ?)`,
        [p.category, p.title, p.price, p.unit, p.description, p.badge]
      );
    }
  }

  // 5. Seed / Reset Gallery Photos with User Uploaded Images
  await runAsync(`DELETE FROM photos`);
  console.log('Seeding user uploaded session photos...');
  const initialPhotos = [
    {
      title: 'Artistery Dance Academy Session',
      category: 'Semi-Classical',
      image_url: '/uploads/hero.jpg',
      images: JSON.stringify(['/uploads/hero.jpg', '/uploads/bollywood.jpg']),
      description: 'Signature Artistery Dance Academy session highlight featuring expressive solo dancer posture.'
    },
    {
      title: 'Bollywood High Energy Dance Session',
      category: 'Bollywood',
      image_url: '/uploads/bollywood.jpg',
      images: JSON.stringify(['/uploads/bollywood.jpg', '/uploads/garba.jpg']),
      description: 'High energy Bollywood dance session with graceful moves and traditional festive flair.'
    },
    {
      title: 'Vibrant Garba and Dandiya Session',
      category: 'Garba',
      image_url: '/uploads/garba.jpg',
      images: JSON.stringify(['/uploads/garba.jpg', '/uploads/sangeet.jpg']),
      description: 'Festive Garba circles and colorful Dandiya Raas workshop session.'
    },
    {
      title: 'Wedding Sangeet Grand Choreography Rehearsal',
      category: 'Sangeet',
      image_url: '/uploads/sangeet.jpg',
      images: JSON.stringify(['/uploads/sangeet.jpg', '/uploads/hero.jpg']),
      description: 'Grand sangeet choreography rehearsal with celebration confetti and joyful group dance.'
    }
  ];

  for (const ph of initialPhotos) {
    await runAsync(
      `INSERT INTO photos (title, category, image_url, images, description) VALUES (?, ?, ?, ?, ?)`,
      [ph.title, ph.category, ph.image_url, ph.images, ph.description]
    );
  }

  console.log('Database initialized successfully!');
}

module.exports = {
  db,
  initDB,
  runAsync,
  allAsync,
  getAsync
};
