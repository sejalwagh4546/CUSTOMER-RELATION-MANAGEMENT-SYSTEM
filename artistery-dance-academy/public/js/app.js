// ====================================================
// ARTISTERY DANCE ACADEMY - FRONTEND APP LOGIC
// ====================================================

document.addEventListener('DOMContentLoaded', () => {
  let adminToken = localStorage.getItem('artistery_admin_token') || null;
  let currentGalleryPhotos = [];
  let currentPricingData = [];

  // --- Initial App Load ---
  initApp();

  function initApp() {
    loadSettings();
    loadPricing();
    loadPhotos();
    setupEventListeners();
    
    if (adminToken) {
      showAdminDashboard();
    }
  }

  // ----------------------------------------------------
  // 1. DATA FETCHING & UI RENDERING
  // ----------------------------------------------------

  // Load Public Settings
  async function loadSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        if (s.contact_no) {
          document.getElementById('infoPhone').innerText = `+91 ${s.contact_no}`;
          updateWhatsAppLinks(s.contact_no);
        }
        if (s.location) document.getElementById('infoLocation').innerText = s.location;
        if (s.email) document.getElementById('infoEmail').innerText = s.email;
        if (s.academy_name) {
          document.querySelectorAll('.brand-title').forEach(el => el.innerText = s.academy_name.toUpperCase());
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }

  function updateWhatsAppLinks(phoneNo) {
    const waUrl = `https://wa.me/91${phoneNo}?text=Hello%20Artistery%20Academy%2C%20I%20want%20more%20details%20about%20your%20dance%20classes%21`;
    const floatWa = document.getElementById('floatingWaBtn');
    if (floatWa) floatWa.href = waUrl;
    document.querySelectorAll('.top-wa-link, .btn-hero-wa, .btn-wa-block').forEach(el => el.href = waUrl);
  }

  // Load & Render Dynamic Pricing
  async function loadPricing() {
    const grid = document.getElementById('pricingGrid');
    try {
      const res = await fetch('/api/pricing');
      const data = await res.json();
      if (data.success && data.pricing) {
        currentPricingData = data.pricing;
        renderPricingCards(grid, data.pricing);
      }
    } catch (err) {
      grid.innerHTML = `<div class="alert alert-danger">Failed to load pricing details.</div>`;
    }
  }

  function renderPricingCards(container, list) {
    if (!list || list.length === 0) {
      container.innerHTML = `<p class="text-muted">No pricing tiers available.</p>`;
      return;
    }

    container.innerHTML = list.map((item, idx) => {
      const isFeatured = item.badge === 'Most Popular' || item.badge === 'Bestseller';
      return `
        <div class="pricing-card ${isFeatured ? 'featured' : ''}">
          ${item.badge ? `<div class="card-badge">${item.badge}</div>` : ''}
          <div class="pricing-category">${escapeHtml(item.category)}</div>
          <h3 class="pricing-title">${escapeHtml(item.title)}</h3>
          
          <div class="pricing-price-wrap">
            <span class="currency">₹</span>
            <span class="price-num">${item.price}</span>
            <span class="price-unit">/- ${escapeHtml(item.unit || '')}</span>
          </div>

          <p class="pricing-desc">${escapeHtml(item.description || '')}</p>

          <button class="btn btn-primary pricing-btn" onclick="selectPricingForEnroll('${escapeHtml(item.title)}')">
            <i class="fa-solid fa-bolt"></i> Enroll Now
          </button>
        </div>
      `;
    }).join('');
  }

  // Load & Render Session Photos Gallery
  async function loadPhotos() {
    const grid = document.getElementById('galleryGrid');
    try {
      const res = await fetch('/api/photos');
      const data = await res.json();
      if (data.success && data.photos) {
        currentGalleryPhotos = data.photos;
        renderGalleryGrid(grid, data.photos);
      }
    } catch (err) {
      grid.innerHTML = `<div class="alert alert-danger">Failed to load gallery photos.</div>`;
    }
  }

  function renderGalleryGrid(container, photos) {
    if (!photos || photos.length === 0) {
      container.innerHTML = `<p class="text-muted" style="grid-column: 1/-1; text-align:center;">No session photos uploaded yet.</p>`;
      return;
    }

    container.innerHTML = photos.map(photo => `
      <div class="gallery-card" data-category="${escapeHtml(photo.category)}" onclick="openLightbox('${escapeHtml(photo.image_url)}', '${escapeHtml(photo.title)}', '${escapeHtml(photo.description || '')}')">
        <div class="gallery-img-wrap">
          <img src="${escapeHtml(photo.image_url)}" alt="${escapeHtml(photo.title)}" loading="lazy">
          <span class="gallery-badge">${escapeHtml(photo.category)}</span>
        </div>
        <div class="gallery-body">
          <h3>${escapeHtml(photo.title)}</h3>
          <p>${escapeHtml(photo.description || 'Dance session highlights')}</p>
        </div>
      </div>
    `).join('');
  }

  // Filter Photos Gallery
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');
      
      const grid = document.getElementById('galleryGrid');
      if (filter === 'all') {
        renderGalleryGrid(grid, currentGalleryPhotos);
      } else {
        const filtered = currentGalleryPhotos.filter(p => p.category.toLowerCase().includes(filter.toLowerCase()));
        renderGalleryGrid(grid, filtered);
      }
    });
  });

  // ----------------------------------------------------
  // 2. ENQUIRY SUBMISSION
  // ----------------------------------------------------

  const enquiryForm = document.getElementById('enquiryForm');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = document.getElementById('submitEnquiryBtn');
      const successMsg = document.getElementById('enquirySuccessMsg');
      
      const payload = {
        name: document.getElementById('enqName').value.trim(),
        age: document.getElementById('enqAge').value,
        dance_style: document.getElementById('enqStyle').value,
        email: document.getElementById('enqEmail').value.trim(),
        phone: document.getElementById('enqPhone').value.trim(),
        notes: document.getElementById('enqNotes').value.trim()
      };

      try {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting...`;

        const res = await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        btn.disabled = false;
        btn.innerHTML = `<span><i class="fa-solid fa-bolt"></i> ENROLL NOW</span>`;

        if (data.success) {
          successMsg.classList.remove('hidden');
          enquiryForm.reset();
          setTimeout(() => successMsg.classList.add('hidden'), 6000);
          
          // Refresh admin panel if active
          if (adminToken) loadAdminEnquiries();
        } else {
          alert(data.error || 'Failed to submit enquiry.');
        }
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = `<span><i class="fa-solid fa-bolt"></i> ENROLL NOW</span>`;
        alert('Network error. Please try again.');
      }
    });
  }

  // ----------------------------------------------------
  // 3. ADMIN PORTAL LOGIC
  // ----------------------------------------------------

  const adminModal = document.getElementById('adminModal');
  const openAdminBtn = document.getElementById('openAdminBtn');
  const closeAdminModal = document.getElementById('closeAdminModal');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');

  if (openAdminBtn) {
    openAdminBtn.addEventListener('click', () => {
      adminModal.classList.add('active');
    });
  }

  if (closeAdminModal) {
    closeAdminModal.addEventListener('click', () => {
      adminModal.classList.remove('active');
    });
  }

  // Handle Admin Login
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('adminUsername').value;
      const password = document.getElementById('adminPassword').value;
      const errBox = document.getElementById('adminLoginErr');

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
          adminToken = data.token;
          localStorage.setItem('artistery_admin_token', adminToken);
          errBox.classList.add('hidden');
          showAdminDashboard();
        } else {
          errBox.innerText = data.error || 'Invalid credentials';
          errBox.classList.remove('hidden');
        }
      } catch (err) {
        errBox.innerText = 'Login failed. Network error.';
        errBox.classList.remove('hidden');
      }
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      adminToken = null;
      localStorage.removeItem('artistery_admin_token');
      document.getElementById('adminDashboardSection').classList.add('hidden');
      document.getElementById('adminLoginSection').classList.remove('hidden');
    });
  }

  function showAdminDashboard() {
    document.getElementById('adminLoginSection').classList.add('hidden');
    document.getElementById('adminDashboardSection').classList.remove('hidden');
    loadAdminEnquiries();
    loadAdminPricingEditor();
    loadAdminPhotosEditor();
  }

  // Admin Tab Navigation
  document.querySelectorAll('.admin-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', (e) => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      const tabId = tabBtn.getAttribute('data-tab');
      tabBtn.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Admin Tab 1: Load Enquiries (CONFIDENTIAL)
  async function loadAdminEnquiries() {
    if (!adminToken) return;
    const tbody = document.getElementById('enquiriesTableBody');
    try {
      const res = await fetch('/api/enquiries', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success && data.enquiries) {
        document.getElementById('enquiryBadgeCount').innerText = data.enquiries.length;
        if (data.enquiries.length === 0) {
          tbody.innerHTML = `<tr><td colspan="8" class="text-muted" style="text-align:center;">No student enquiries received yet.</td></tr>`;
          return;
        }

        tbody.innerHTML = data.enquiries.map(enq => `
          <tr>
            <td>${new Date(enq.created_at).toLocaleDateString()}</td>
            <td><strong>${escapeHtml(enq.name)}</strong></td>
            <td>${enq.age} yrs</td>
            <td><span class="badge-style">${escapeHtml(enq.dance_style)}</span></td>
            <td><a href="mailto:${escapeHtml(enq.email)}" style="color:var(--accent-cyan);">${escapeHtml(enq.email)}</a></td>
            <td><a href="tel:${escapeHtml(enq.phone)}" style="color:var(--whatsapp-color); font-weight:700;">${escapeHtml(enq.phone)}</a></td>
            <td>
              <span class="status-badge status-${enq.status}">${enq.status}</span>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteEnquiry(${enq.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-danger">Failed to fetch enquiries.</td></tr>`;
    }
  }

  window.deleteEnquiry = async function(id) {
    if (!confirm('Are you sure you want to delete this enquiry record?')) return;
    try {
      await fetch(`/api/enquiries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      loadAdminEnquiries();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  // Admin Tab 2: Pricing Editor
  function loadAdminPricingEditor() {
    const list = document.getElementById('adminPricingList');
    if (!currentPricingData || currentPricingData.length === 0) {
      list.innerHTML = `<p class="text-muted">No pricing data available.</p>`;
      return;
    }

    list.innerHTML = currentPricingData.map(item => `
      <div class="admin-price-row">
        <div>
          <label style="font-size:11px; color:var(--text-muted);">Title</label>
          <input type="text" id="editTitle_${item.id}" value="${escapeHtml(item.title)}" style="width:100%;">
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted);">Description</label>
          <input type="text" id="editDesc_${item.id}" value="${escapeHtml(item.description || '')}" style="width:100%;">
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted);">Price (₹)</label>
          <input type="number" id="editPrice_${item.id}" value="${item.price}" style="width:100%;">
        </div>
        <div>
          <button class="btn btn-sm btn-primary" onclick="savePriceEdit(${item.id})"><i class="fa-solid fa-check"></i> Save</button>
        </div>
      </div>
    `).join('');
  }

  window.savePriceEdit = async function(id) {
    const title = document.getElementById(`editTitle_${id}`).value;
    const description = document.getElementById(`editDesc_${id}`).value;
    const price = document.getElementById(`editPrice_${id}`).value;

    const targetItem = currentPricingData.find(p => p.id === id) || {};

    try {
      const res = await fetch(`/api/pricing/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          category: targetItem.category || 'General',
          title,
          price,
          unit: targetItem.unit || 'per person',
          description,
          badge: targetItem.badge || ''
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Price updated successfully!');
        loadPricing(); // Reload homepage pricing grid
      }
    } catch (err) {
      alert('Failed to save price changes.');
    }
  };

  // Admin Tab 3: Photos Upload Form
  const addPhotoForm = document.getElementById('addPhotoForm');
  if (addPhotoForm) {
    addPhotoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append('title', document.getElementById('photoTitle').value);
      formData.append('category', document.getElementById('photoCategory').value);
      formData.append('description', document.getElementById('photoDesc').value);
      formData.append('image_url', document.getElementById('photoUrl').value);
      
      const fileInput = document.getElementById('photoFile');
      if (fileInput.files[0]) {
        formData.append('image_file', fileInput.files[0]);
      }

      try {
        const res = await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${adminToken}` },
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          alert('Photo posted to gallery successfully!');
          addPhotoForm.reset();
          loadPhotos();
          loadAdminPhotosEditor();
        } else {
          alert(data.error || 'Failed to post photo.');
        }
      } catch (err) {
        alert('Network error posting photo.');
      }
    });
  }

  function loadAdminPhotosEditor() {
    const grid = document.getElementById('adminPhotosList');
    grid.innerHTML = currentGalleryPhotos.map(p => `
      <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; display:flex; gap:10px; align-items:center; margin-bottom:10px;">
        <img src="${escapeHtml(p.image_url)}" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">
        <div style="flex-grow:1;">
          <h5 style="margin:0;">${escapeHtml(p.title)}</h5>
          <span style="font-size:11px; color:var(--accent-magenta);">${p.category}</span>
        </div>
        <button class="btn btn-sm btn-outline-danger" onclick="deletePhoto(${p.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    `).join('');
  }

  window.deletePhoto = async function(id) {
    if (!confirm('Remove this photo from the gallery?')) return;
    try {
      await fetch(`/api/photos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      loadPhotos();
      loadAdminPhotosEditor();
    } catch (err) {
      alert('Delete photo failed.');
    }
  };

  // Admin Tab 4: Settings Update Form
  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        academy_name: document.getElementById('setAcademyName').value,
        contact_no: document.getElementById('setContactNo').value,
        location: document.getElementById('setLocation').value,
        email: document.getElementById('setEmail').value
      };

      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('settingsSuccessMsg').classList.remove('hidden');
          setTimeout(() => document.getElementById('settingsSuccessMsg').classList.add('hidden'), 4000);
          loadSettings();
        }
      } catch (err) {
        alert('Failed to update settings.');
      }
    });
  }

  // ----------------------------------------------------
  // 4. UTILITIES & UI INTERACTORS
  // ----------------------------------------------------

  // Lightbox Modal
  const lightboxModal = document.getElementById('lightboxModal');
  const closeLightbox = document.getElementById('closeLightbox');

  window.openLightbox = function(url, title, desc) {
    document.getElementById('lightboxImg').src = url;
    document.getElementById('lightboxTitle').innerText = title;
    document.getElementById('lightboxDesc').innerText = desc;
    lightboxModal.classList.add('active');
  };

  if (closeLightbox) {
    closeLightbox.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
    });
  }

  // Quick enroll button handler from pricing cards
  window.selectPricingForEnroll = function(pricingTitle) {
    const select = document.getElementById('enqStyle');
    if (select) {
      // Find matching or default option
      for (let i = 0; i < select.options.length; i++) {
        if (pricingTitle.toLowerCase().includes(select.options[i].value.toLowerCase())) {
          select.selectedIndex = i;
          break;
        }
      }
    }
    const contactSec = document.getElementById('contact');
    if (contactSec) {
      contactSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Setup Mobile Nav Toggle & Smooth Scrolling
  function setupEventListeners() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu) navMenu.classList.remove('active');
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
