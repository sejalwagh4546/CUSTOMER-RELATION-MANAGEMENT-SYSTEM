// LocalStorage key for storing CRM Leads
const LOCAL_STORAGE_KEY = 'crm_leads';

// Initial default lead data if none exists in storage
let leadsData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [
  { id: 1, name: "Rohan Mehta", company: "Eco Studios", contact: "rohan@ecostudios.com", source: "Google Form", value: 450000, status: "Qualified" },
  { id: 2, name: "Ananya Verma", company: "Skyline Towers", contact: "+91 9876543210", source: "WhatsApp", value: 1200000, status: "New" },
  { id: 3, name: "Vikram Malhotra", company: "Grand Vista Villas", contact: "vikram@vista.com", source: "Direct Contact", value: 800000, status: "Contacted" }
];

document.addEventListener('DOMContentLoaded', () => {
  // Setup User Profile details from local storage
  setupUserProfile();

  // Initialize Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Render initial table and KPIs
  renderLeads();

  // Setup Modal Controls
  setupModalEvents();

  // Setup Filters
  document.getElementById('searchInput').addEventListener('input', renderLeads);
  document.getElementById('statusFilter').addEventListener('change', renderLeads);
});

function setupUserProfile() {
  const storedUser = localStorage.getItem('currentUser');
  let agentName = "MAHI";

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user.name) agentName = user.name;
    } catch(e) {}
  }

  const profileNameEl = document.getElementById('user-profile-name');
  const avatarEl = document.getElementById('user-avatar');

  if (profileNameEl) profileNameEl.innerText = agentName;
  if (avatarEl) avatarEl.innerText = agentName.charAt(0).toUpperCase();
}

function updateClock() {
  const now = new Date();
  const dateEl = document.getElementById('current-date');
  const timeEl = document.getElementById('current-time');
  if (dateEl) dateEl.innerText = now.toLocaleDateString('en-GB');
  if (timeEl) timeEl.innerText = now.toLocaleTimeString();
}

function saveLeadsToStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leadsData));
}

function renderLeads() {
  const tableBody = document.getElementById('leadsTableBody');
  const searchValue = document.getElementById('searchInput').value.toLowerCase();
  const statusValue = document.getElementById('statusFilter').value;

  // Filter leads based on search text and status dropdown
  const filteredLeads = leadsData.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchValue) ||
                          lead.company.toLowerCase().includes(searchValue) ||
                          lead.contact.toLowerCase().includes(searchValue);
    const matchesStatus = (statusValue === 'ALL') || (lead.status === statusValue);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  let totalVal = 0;
  let qualifiedCount = 0;

  leadsData.forEach(lead => {
    totalVal += Number(lead.value) || 0;
    if (lead.status === 'Qualified') qualifiedCount++;
  });

  document.getElementById('totalLeadsCount').innerText = leadsData.length;
  document.getElementById('totalValue').innerText = `₹${totalVal.toLocaleString('en-IN')}`;
  document.getElementById('hotLeadsCount').innerText = qualifiedCount;

  // Render rows
  if (filteredLeads.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-6 text-slate-500">No leads found matching your criteria.</td>
      </tr>
    `;
    return;
  }

  let html = '';
  filteredLeads.forEach(lead => {
    let statusClass = 'bg-slate-800 text-slate-300 border-slate-700';
    if (lead.status === 'New') statusClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (lead.status === 'Contacted') statusClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (lead.status === 'Qualified') statusClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (lead.status === 'Closed') statusClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';

    html += `
      <tr>
        <td class="py-4 px-4 font-semibold text-white">${lead.name}</td>
        <td class="py-4 px-4 text-slate-400">${lead.company}</td>
        <td class="py-4 px-4 text-slate-400">${lead.contact}</td>
        <td class="py-4 px-4"><span class="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded">${lead.source}</span></td>
        <td class="py-4 px-4 font-medium text-slate-200">₹${Number(lead.value).toLocaleString('en-IN')}</td>
        <td class="py-4 px-4">
          <span class="text-[11px] font-semibold px-2.5 py-1 rounded-md border ${statusClass}">${lead.status}</span>
        </td>
        <td class="py-4 px-4 text-right">
          <button onclick="deleteLead(${lead.id})" title="Delete Lead" class="text-slate-400 hover:text-red-400 transition">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = html;
}

function setupModalEvents() {
  const modal = document.getElementById('leadModal');
  const openBtn = document.getElementById('openModalBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('addLeadForm');

  const openModal = () => modal.style.display = 'flex';
  const closeModal = () => {
    modal.style.display = 'none';
    form.reset();
  };

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newLead = {
      id: Date.now(),
      name: document.getElementById('leadName').value.trim(),
      company: document.getElementById('companyName').value.trim(),
      contact: document.getElementById('leadEmail').value.trim(),
      source: document.getElementById('leadSource').value,
      value: Number(document.getElementById('leadValue').value),
      status: document.getElementById('leadStatus').value
    };

    leadsData.push(newLead);
    saveLeadsToStorage();
    renderLeads();
    closeModal();
  });
}

function deleteLead(id) {
  if (confirm('Are you sure you want to delete this lead?')) {
    leadsData = leadsData.filter(lead => lead.id !== id);
    saveLeadsToStorage();
    renderLeads();
  }
}

function performLogout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}