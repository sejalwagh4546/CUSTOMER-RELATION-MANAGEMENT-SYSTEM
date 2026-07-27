// Initial Mock Data
const GOOGLE_SCRIPT_URL = "https://script.google.com/u/0/home/projects/12qd0n18KiONMtzGpLa2sWTz-x6SSpECAGxcmcrCzJ3Ct2tX9-OckhJ6X/edit";

let leads = [
  { id: 1, name: "Aarav Sharma", email: "aarav.s@example.com", source: "Website", status: "New" },
  { id: 2, name: "Priya Patel", email: "priya.p@example.com", source: "LinkedIn", status: "Contacted" },
  { id: 3, name: "Rahul Verma", email: "rahul.v@example.com", source: "Referral", status: "Qualified" },
  { id: 4, name: "Neha Gupta", email: "neha.g@example.com", source: "Cold Outreach", status: "New" }
];

// DOM Elements
// Uses "leads-table-body" or falls back to "leadsTableBody"
const tableBody = document.getElementById("leads-table-body") || document.getElementById("leadsTableBody");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("leadModal") || document.getElementById("lead-modal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const addLeadForm = document.getElementById("addLeadForm");

// Render Table Rows
function renderLeads(leadsToRender) {
  const targetTable = document.getElementById("leads-table-body") || tableBody;
  if (!targetTable) return;

  targetTable.innerHTML = "";

  if (leadsToRender.length === 0) {
    targetTable.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No leads found.</td></tr>`;
    return;
  }

  leadsToRender.forEach((lead) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><strong>${escapeHtml(lead.name)}</strong></td>
      <td>${escapeHtml(lead.email)}</td>
      <td>${escapeHtml(lead.source)}</td>
      <td>
        <span class="badge badge-${lead.status.toLowerCase().replace(/\s+/g, '')}">${lead.status}</span>
      </td>
      <td>
        <button class="btn-delete" title="Delete Lead" onclick="deleteLead(${lead.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;">✕</button>
      </td>
    `;

    targetTable.appendChild(row);
  });

  updateMetrics();
}

// Update Top Dashboard Stat Cards Live
function updateMetrics() {
  const statTotal = document.getElementById("statTotal");
  const statNew = document.getElementById("statNew");
  const statContacted = document.getElementById("statContacted");
  const statQualified = document.getElementById("statQualified");

  if (statTotal) statTotal.textContent = leads.length;
  if (statNew) statNew.textContent = leads.filter(l => l.status === "New").length;
  if (statContacted) statContacted.textContent = leads.filter(l => l.status === "Contacted" || l.status === "In Contact").length;
  if (statQualified) statQualified.textContent = leads.filter(l => l.status === "Qualified").length;
}

// Search Filter
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = leads.filter(
      (l) => l.name.toLowerCase().includes(searchTerm) || l.email.toLowerCase().includes(searchTerm)
    );
    renderLeads(filtered);
  });
}

// Delete Lead
window.deleteLead = function (id) {
  leads = leads.filter((lead) => lead.id !== id);
  renderLeads(leads);
};

// Modal Control Functions
window.openModal = function () {
  const targetModal = document.getElementById("leadModal") || document.getElementById("lead-modal");
  if (targetModal) targetModal.style.display = "flex";
};

window.closeModal = function () {
  const targetModal = document.getElementById("leadModal") || document.getElementById("lead-modal");
  if (targetModal) targetModal.style.display = "none";
  if (addLeadForm) addLeadForm.reset();
};

window.openLeadModal = window.openModal;
window.closeLeadModal = window.closeModal;

if (openModalBtn) openModalBtn.addEventListener("click", openModal);
if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

// Add New Lead - Global Function for button click / submit
window.addNewLead = function () {
  const nameInput = document.getElementById("leadName") || document.getElementById("lead-name-inp");
  const emailInput = document.getElementById("leadEmail") || document.getElementById("lead-email-inp");
  const sourceInput = document.getElementById("leadSource") || document.getElementById("lead-source-inp");
  const statusInput = document.getElementById("leadStatus") || document.getElementById("lead-status-inp");

  if (!nameInput || !emailInput) return;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const source = sourceInput ? sourceInput.value : "Google Form";
  const status = statusInput ? statusInput.value : "New";

  if (!name || !email) {
    alert("Please fill in both Name and Email.");
    return;
  }

  const newLead = {
    id: Date.now(),
    name: name,
    email: email,
    source: source,
    status: status
  };

  leads.unshift(newLead);
  renderLeads(leads);
  closeModal();

  nameInput.value = "";
  emailInput.value = "";
};

// Form Event Listener
if (addLeadForm) {
  addLeadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addNewLead();
  });
}

// Utility to prevent XSS in text inputs
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.innerText = text;
  return div.innerHTML;
}

// Initial Render on Page Load
document.addEventListener("DOMContentLoaded", () => {
  renderLeads(leads);
});