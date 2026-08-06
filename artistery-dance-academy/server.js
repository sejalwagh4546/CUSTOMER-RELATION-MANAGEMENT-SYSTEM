const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { initDB, runAsync, allAsync, getAsync } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Catch-all route for frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configure Multer for File Uploads
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'photo-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Admin Simple Auth Token simulation
const ADMIN_TOKEN = 'artistery-admin-session-secret-2026';

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader === `Bearer ${ADMIN_TOKEN}`) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
}

// ----------------------------------------------------
// 1. PUBLIC API ENDPOINTS
// ----------------------------------------------------

// Get Academy Settings & Contact Info
app.get('/api/settings', async (req, res) => {
  try {
    const rows = await allAsync(`SELECT key, value FROM settings`);
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Pricing Options
app.get('/api/pricing', async (req, res) => {
  try {
    const pricing = await allAsync(`SELECT * FROM pricing ORDER BY id ASC`);
    res.json({ success: true, pricing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Session Photos Gallery
app.get('/api/photos', async (req, res) => {
  try {
    const photos = await allAsync(`SELECT * FROM photos ORDER BY created_at DESC`);
    res.json({ success: true, photos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Student Enquiry Form
app.post('/api/enquiries', async (req, res) => {
  try {
    const { name, age, dance_style, email, phone, notes } = req.body;
    if (!name || !age || !dance_style || !email || !phone) {
      return res.status(400).json({ error: 'Please fill in all required fields (Name, Age, Dance Style, Email, Contact No).' });
    }

    const result = await runAsync(
      `INSERT INTO enquiries (name, age, dance_style, email, phone, notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, parseInt(age), dance_style, email, phone, notes || '']
    );

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! Our team will contact you shortly.',
      enquiryId: result.lastID
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Login Check
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await getAsync(`SELECT * FROM admin WHERE username = ? OR email = ?`, [username, username]);
    
    // Check against DB credentials
    if (admin && admin.password === password) {
      return res.json({
        success: true,
        token: ADMIN_TOKEN,
        user: { username: admin.username, email: admin.email }
      });
    }

    // Direct check for specified admin credentials
    if ((username === 'waghsejal.8676@gmail.com' || username === 'admin') && password === 'Sejal@8676') {
      return res.json({
        success: true,
        token: ADMIN_TOKEN,
        user: { username: 'waghsejal.8676@gmail.com', email: 'waghsejal.8676@gmail.com' }
      });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 2. ADMIN ONLY API ENDPOINTS
// ----------------------------------------------------

// Get All Enquiries (CONFIDENTIAL - Admin only)
app.get('/api/enquiries', requireAdmin, async (req, res) => {
  try {
    const enquiries = await allAsync(`SELECT * FROM enquiries ORDER BY created_at DESC`);
    res.json({ success: true, enquiries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Enquiry Status (Admin only)
app.patch('/api/enquiries/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await runAsync(`UPDATE enquiries SET status = ? WHERE id = ?`, [status, req.params.id]);
    res.json({ success: true, message: 'Enquiry status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Enquiry (Admin only)
app.delete('/api/enquiries/:id', requireAdmin, async (req, res) => {
  try {
    await runAsync(`DELETE FROM enquiries WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add New Pricing Tier (Admin only)
app.post('/api/pricing', requireAdmin, async (req, res) => {
  try {
    const { category, title, price, unit, description, badge } = req.body;
    const result = await runAsync(
      `INSERT INTO pricing (category, title, price, unit, description, badge) VALUES (?, ?, ?, ?, ?, ?)`,
      [category, title, parseInt(price), unit, description, badge]
    );
    res.status(201).json({ success: true, message: 'Pricing tier created', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Pricing Tier (Admin only)
app.put('/api/pricing/:id', requireAdmin, async (req, res) => {
  try {
    const { category, title, price, unit, description, badge } = req.body;
    await runAsync(
      `UPDATE pricing SET category = ?, title = ?, price = ?, unit = ?, description = ?, badge = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [category, title, parseInt(price), unit, description, badge, req.params.id]
    );
    res.json({ success: true, message: 'Pricing updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Pricing Tier (Admin only)
app.delete('/api/pricing/:id', requireAdmin, async (req, res) => {
  try {
    await runAsync(`DELETE FROM pricing WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Pricing tier deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload & Post New Photo Entry (Multiple Photos Support)
app.post('/api/photos', requireAdmin, upload.array('image_files', 10), async (req, res) => {
  try {
    const { title, category, description, image_url } = req.body;
    let imagesArray = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach(f => imagesArray.push('/uploads/' + f.filename));
    }

    if (image_url) {
      const urls = image_url.split(',').map(u => u.trim()).filter(Boolean);
      imagesArray.push(...urls);
    }

    if (imagesArray.length === 0) {
      return res.status(400).json({ error: 'Please select one or more image files or enter image URL(s).' });
    }

    const primaryImageUrl = imagesArray[0];
    const imagesJson = JSON.stringify(imagesArray);

    const result = await runAsync(
      `INSERT INTO photos (title, category, image_url, images, description) VALUES (?, ?, ?, ?, ?)`,
      [title || 'Dance Session', category || 'General', primaryImageUrl, imagesJson, description || '']
    );

    res.status(201).json({ success: true, message: `${imagesArray.length} photo(s) added to session entry successfully`, id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Photo (Admin only)
app.delete('/api/photos/:id', requireAdmin, async (req, res) => {
  try {
    await runAsync(`DELETE FROM photos WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Settings (Admin only)
app.put('/api/settings', requireAdmin, async (req, res) => {
  try {
    const { academy_name, contact_no, location, email, whatsapp_text } = req.body;
    if (academy_name) await runAsync(`INSERT OR REPLACE INTO settings (key, value) VALUES ('academy_name', ?)`, [academy_name]);
    if (contact_no) await runAsync(`INSERT OR REPLACE INTO settings (key, value) VALUES ('contact_no', ?)`, [contact_no]);
    if (location) await runAsync(`INSERT OR REPLACE INTO settings (key, value) VALUES ('location', ?)`, [location]);
    if (email) await runAsync(`INSERT OR REPLACE INTO settings (key, value) VALUES ('email', ?)`, [email]);
    if (whatsapp_text) await runAsync(`INSERT OR REPLACE INTO settings (key, value) VALUES ('whatsapp_text', ?)`, [whatsapp_text]);

    res.json({ success: true, message: 'Academy settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server after Database Init
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=====================================================`);
      console.log(`  Artistery Dance Academy Server is running on port ${PORT}`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`=====================================================`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
  });
