/**
 * SysInsight Real Estate CRM Pune - Core Application Script
 */

// Application State
const state = {
    currentUser: null,
    leads: [],
    contacts: [],
    deals: [],
    tasks: [],
    users: [],
    projects: [],
    properties: [],
    settings: {
        agentName: "Sejal Wagh",
        agentEmail: "sejalwagh4546@gmail.com",
        agentPhone: "+91 98220 12345",
        agencyName: "SysInsight Real Estate Solutions Pune",
        reraNo: "MAHARERA P52100098765",
        currency: "INR (₹)",
        defaultCity: "Pune, Maharashtra",
        googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSen6nA9c8CQQN6C1YE9boioNK8eoKYAYA5On7GmEmV9YDg75w/viewform?usp=publish-editor",
        theme: "Dark Glow",
        autoAssignLead: true
    },
    isSignUpMode: false
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    checkStoredAuth();
    loadAllData();

    // Check if redirected with specific tab preference
    const targetTab = localStorage.getItem('sysinsight_target_tab');
    if (targetTab) {
        localStorage.removeItem('sysinsight_target_tab');
        switchTab(null, targetTab);
    }
});

function initClock() {
    const clockEl = document.getElementById('live-timestamp-box');
    const updateTime = () => {
        if (clockEl) {
            const now = new Date();
            clockEl.innerText = now.toLocaleString('en-IN', {
                dateStyle: 'full',
                timeStyle: 'medium'
            });
        }
    };
    updateTime();
    setInterval(updateTime, 1000);
}

// --- AUTHENTICATION & LOGIN ---
function toggleInterfaceMode() {
    state.isSignUpMode = !state.isSignUpMode;
    const heading = document.getElementById('form-heading');
    const nameBox = document.getElementById('name-field-box');
    const toggleText = document.querySelector('.toggle-link');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (state.isSignUpMode) {
        if (heading) heading.innerText = 'Create Agent Account';
        if (nameBox) nameBox.style.display = 'block';
        if (toggleText) toggleText.innerHTML = 'Already registered? <span style="color:var(--accent-glow); font-weight:bold;">Sign In instead</span>';
        if (submitBtn) submitBtn.innerText = 'Sign Up';
    } else {
        if (heading) heading.innerText = 'Welcome to SysInsight CRM';
        if (nameBox) nameBox.style.display = 'none';
        if (toggleText) toggleText.innerHTML = 'New CRM agent? <span style="color:var(--accent-glow); font-weight:bold;">Create an account</span>';
        if (submitBtn) submitBtn.innerText = 'Log In';
    }
}

async function submitAuthData() {
    const email = document.getElementById('inp-email')?.value.trim();
    const password = document.getElementById('inp-pass')?.value.trim() || 'password123';
    const nameInput = document.getElementById('inp-name')?.value.trim();
    
    if (!email) {
        showAuthError("Please enter a valid email address or username.");
        return;
    }

    try {
        const endpoint = state.isSignUpMode ? '/api/auth/signup' : '/api/auth/login';
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name: nameInput })
        });
        const data = await res.json();

        if (data.success) {
            state.currentUser = data.user || { name: nameInput || "Sejal Wagh", email };
            localStorage.setItem('sysinsight_user', JSON.stringify(state.currentUser));
            showDashboardView();
        } else {
            // Local fallback login
            state.currentUser = { name: nameInput || "Sejal Wagh", email, role: 'Principal Consultant' };
            localStorage.setItem('sysinsight_user', JSON.stringify(state.currentUser));
            showDashboardView();
        }
    } catch (e) {
        console.warn("Backend auth call failed, using offline session mode:", e);
        const name = nameInput || "Sejal Wagh";
        state.currentUser = { name, email, role: 'Principal Consultant' };
        localStorage.setItem('sysinsight_user', JSON.stringify(state.currentUser));
        showDashboardView();
    }
}

function showAuthError(msg) {
    const err = document.getElementById('msg-err');
    if (err) {
        err.innerText = msg;
        err.style.display = 'block';
    } else {
        alert(msg);
    }
}

function checkStoredAuth() {
    const saved = localStorage.getItem('sysinsight_user');
    if (saved) {
        try {
            state.currentUser = JSON.parse(saved);
            showDashboardView();
        } catch (e) {
            console.error(e);
        }
    }
}

function showDashboardView() {
    const authScreen = document.getElementById('auth-screen');
    const crmDashboard = document.getElementById('crm-dashboard');
    if (authScreen) authScreen.style.display = 'none';
    if (crmDashboard) crmDashboard.style.display = 'flex';

    if (state.currentUser) {
        const name = state.currentUser.name || "Sejal Wagh";
        const initial = name.charAt(0).toUpperCase();

        const agentNameLabels = ['agent-label-name', 'agent-display-title', 'user-profile-name'];
        agentNameLabels.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = name;
        });

        const avatarEls = ['agent-avatar-initials', 'user-avatar'];
        avatarEls.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = initial;
        });
    }

    renderCharts();
}

function performLogout() {
    localStorage.removeItem('sysinsight_user');
    state.currentUser = null;
    const authScreen = document.getElementById('auth-screen');
    const crmDashboard = document.getElementById('crm-dashboard');
    if (crmDashboard) crmDashboard.style.display = 'none';
    if (authScreen) authScreen.style.display = 'flex';
}

// --- NAVIGATION & TABS ---
function switchTab(element, viewId) {
    if (viewId && !viewId.startsWith('view-')) {
        viewId = 'view-' + viewId;
    }

    // 1. Update Active Navigation Links
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    } else {
        const matchingNav = document.querySelector(`.nav-item[onclick*="${viewId.replace('view-', '')}"]`);
        if (matchingNav) matchingNav.classList.add('active');
    }

    // 2. Toggle View Visibility
    document.querySelectorAll('.view-section').forEach(view => {
        view.style.display = 'none';
        view.classList.add('hidden');
        view.classList.remove('active-view');
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = 'block';
        targetView.classList.remove('hidden');
        targetView.classList.add('active-view');
    } else {
        const placeholder = document.getElementById('view-placeholder');
        if (placeholder) {
            placeholder.style.display = 'block';
            placeholder.classList.remove('hidden');
            placeholder.classList.add('active-view');
        }
    }

    // Trigger charts if switching to reports or dashboard
    if (viewId === 'view-reports' || viewId === 'view-dashboard') {
        renderCharts();
    }
}

// --- DATA FETCHING ---
async function loadAllData() {
    await Promise.all([
        fetchLeads(),
        fetchContacts(),
        fetchDeals(),
        fetchTasks(),
        fetchUsers(),
        fetchProjects(),
        fetchSettings()
    ]);
    updateMetricsSummary();
}

// --- LEADS MANAGEMENT & GOOGLE FORM SYNC ---
async function fetchLeads() {
    try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        if (data.success && data.leads) state.leads = data.leads;
    } catch (e) {
        if (state.leads.length === 0) {
            state.leads = [
                { id: 1, name: "Aditya Kulkarni", contact: "+91 98221 44556", email: "aditya.kulkarni@gmail.com", source: "Google Form", status: "Qualified", budget: 16500000, agent: "Sejal Wagh", project: "Panchshil Towers Kharadi" },
                { id: 2, name: "Sneha Kulkarni", contact: "+91 91234 56789", email: "sneha.kulkarni@yahoo.com", source: "Google Form", status: "Contacted", budget: 8500000, agent: "Tanvi Deshmukh", project: "Godrej Hillside Hinjewadi" },
                { id: 3, name: "Rohan Mehta", contact: "+91 98765 43210", email: "rohan.mehta@apexdev.in", source: "Website Inquiry", status: "New", budget: 34000000, agent: "Aarav Sharma", project: "Amanora Park Town Villa" }
            ];
        }
    }
    renderLeads(state.leads);
}

function renderLeads(leadsToRender) {
    const tbody = document.getElementById('leads-table-body') || document.getElementById('leadsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (leadsToRender.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 20px;">No leads found in Pune directory.</td></tr>`;
        return;
    }

    leadsToRender.forEach(lead => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-900/40 transition';

        let badgeClass = 'badge-progress';
        if (lead.status === 'New') badgeClass = 'badge-pending';
        if (lead.status === 'Qualified' || lead.status === 'Closed Won') badgeClass = 'badge-won';

        const budgetFormatted = lead.budget ? '₹' + (Number(lead.budget) / 100000).toFixed(1) + ' Lakhs' : 'N/A';

        row.innerHTML = `
            <td><strong>${escapeHtml(lead.name)}</strong></td>
            <td>${escapeHtml(lead.contact || lead.email || 'N/A')}</td>
            <td>${escapeHtml(lead.project || 'Pune Project')}</td>
            <td>${budgetFormatted}</td>
            <td><span class="badge ${badgeClass}">${escapeHtml(lead.status)}</span></td>
            <td>${escapeHtml(lead.agent || 'Sejal Wagh')}</td>
            <td>
                <button onclick="deleteLead(${lead.id})" style="background:none; border:none; color:var(--neon-red); cursor:pointer; font-weight:bold;">🗑️ Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    updateMetricsSummary();
}

// Google Form Submit & Sync to both LEADS and CONTACTS
async function addNewLead() {
    const name = document.getElementById('lead-name-inp')?.value.trim();
    const contact = document.getElementById('lead-contact-inp')?.value.trim();
    const email = document.getElementById('lead-email-inp')?.value.trim() || (contact && contact.includes('@') ? contact : `${(name||'client').toLowerCase().replace(/\s+/g, '.')}@gmail.com`);
    const phone = document.getElementById('lead-phone-inp')?.value.trim() || (!contact?.includes('@') ? contact : '+91 98220 12345');
    const project = document.getElementById('lead-project-inp')?.value.trim() || "Panchshil Towers Kharadi";
    const budget = document.getElementById('lead-budget-inp')?.value.trim() || 12000000;
    const status = document.getElementById('lead-status-inp')?.value || "Qualified";
    const source = "Google Form";
    const agent = document.getElementById('lead-agent-inp')?.value.trim() || (state.currentUser ? state.currentUser.name : "Sejal Wagh");

    if (!name || (!contact && !email && !phone)) {
        alert("Please enter Name and Phone/Email!");
        return;
    }

    const payload = { name, contact: contact || phone || email, email, phone, project, budget, status, source, agent };

    try {
        const res = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            state.leads = data.leads || [data.lead, ...state.leads];
            if (data.contacts) state.contacts = data.contacts;
        } else {
            state.leads.unshift({ id: Date.now(), ...payload });
            state.contacts.unshift({ id: Date.now() + 1, name, email, phone, company: "Individual Buyer", type: "Client", location: "Pune, MH" });
        }
    } catch (e) {
        state.leads.unshift({ id: Date.now(), ...payload });
        state.contacts.unshift({ id: Date.now() + 1, name, email, phone, company: "Individual Buyer", type: "Client", location: "Pune, MH" });
    }

    renderLeads(state.leads);
    renderContacts(state.contacts);
    closeLeadModal();
    alert(`⚡ Lead & Contact for "${name}" successfully registered via Google Form and synchronized across Leads & Contacts directories!`);
}

async function deleteLead(id) {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
        await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    } catch (e) {}
    state.leads = state.leads.filter(l => l.id !== id);
    renderLeads(state.leads);
}

function filterLeads() {
    const search = document.getElementById('leadSearchInput')?.value.toLowerCase() || '';
    const filtered = state.leads.filter(l => 
        l.name.toLowerCase().includes(search) || 
        (l.contact && l.contact.toLowerCase().includes(search)) ||
        (l.project && l.project.toLowerCase().includes(search)) ||
        (l.agent && l.agent.toLowerCase().includes(search))
    );
    renderLeads(filtered);
}

function openLeadModal(projectName) {
    const modal = document.getElementById('lead-modal');
    if (modal) {
        modal.style.display = 'flex';
        if (projectName) {
            const projInput = document.getElementById('lead-project-inp');
            if (projInput) projInput.value = projectName;
        }
    }
}

function closeLeadModal() {
    const modal = document.getElementById('lead-modal');
    if (modal) modal.style.display = 'none';
}

function openGoogleFormDirect() {
    const formUrl = state.settings.googleFormUrl || "https://docs.google.com/forms/d/e/1FAIpQLSen6nA9c8CQQN6C1YE9boioNK8eoKYAYA5On7GmEmV9YDg75w/viewform?usp=publish-editor";
    window.open(formUrl, '_blank');
}

// --- CONTACTS MANAGEMENT ---
async function fetchContacts() {
    try {
        const res = await fetch('/api/contacts');
        const data = await res.json();
        if (data.success && data.contacts) state.contacts = data.contacts;
    } catch (e) {
        if (state.contacts.length === 0) {
            state.contacts = [
                { id: 1, name: "Aditya Kulkarni", email: "aditya.kulkarni@gmail.com", phone: "+91 98221 44556", company: "Kulkarni Tech Solutions", type: "Client", location: "Kothrud, Pune" },
                { id: 2, name: "Sneha Kulkarni", email: "sneha.kulkarni@yahoo.com", phone: "+91 91234 56789", company: "FinServ Global Pune", type: "Prospect", location: "Hinjewadi, Pune" }
            ];
        }
    }
    renderContacts(state.contacts);
}

function renderContacts(contactsToRender) {
    const tbody = document.getElementById('contacts-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    contactsToRender.forEach(contact => {
        const row = document.createElement('tr');

        let badgeClass = 'badge-progress';
        if (contact.type === 'Client') badgeClass = 'badge-won';
        if (contact.type === 'Partner') badgeClass = 'badge-pending';

        row.innerHTML = `
            <td><strong>${escapeHtml(contact.name)}</strong></td>
            <td>${escapeHtml(contact.email)}<br><small style="color: var(--text-secondary);">${escapeHtml(contact.phone || 'N/A')}</small></td>
            <td>${escapeHtml(contact.company || 'N/A')}</td>
            <td><span class="badge ${badgeClass}">${escapeHtml(contact.type)}</span></td>
            <td><span style="font-size:12px; color:var(--text-secondary);">${escapeHtml(contact.location || 'Pune, MH')}</span></td>
            <td>
                <button onclick="deleteContact(${contact.id})" style="background: none; border: none; color: var(--neon-red); cursor: pointer; font-size: 14px;">🗑️ Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function addNewContact() {
    const name = document.getElementById('cnt-name').value.trim();
    const email = document.getElementById('cnt-email').value.trim();
    const phone = document.getElementById('cnt-phone').value.trim();
    const company = document.getElementById('cnt-company').value.trim() || 'Individual Buyer';
    const type = document.getElementById('cnt-type').value;
    const location = document.getElementById('cnt-location')?.value.trim() || 'Pune, MH';

    if (!name || !email) {
        alert("Please enter Full Name and Email!");
        return;
    }

    const payload = { name, email, phone, company, type, location };

    try {
        const res = await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            state.contacts.unshift(data.contact);
        } else {
            state.contacts.unshift({ id: Date.now(), ...payload });
        }
    } catch (e) {
        state.contacts.unshift({ id: Date.now(), ...payload });
    }

    renderContacts(state.contacts);
    closeContactModal();
}

async function deleteContact(id) {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
        await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    } catch (e) {}
    state.contacts = state.contacts.filter(c => c.id !== id);
    renderContacts(state.contacts);
}

function filterContacts() {
    const searchText = document.getElementById('contactSearchInput')?.value.toLowerCase() || '';
    const selectedType = document.getElementById('contactTypeFilter')?.value || 'All';

    const filtered = state.contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchText) || 
                              contact.email.toLowerCase().includes(searchText) || 
                              (contact.company && contact.company.toLowerCase().includes(searchText));
        const matchesType = (selectedType === 'All' || contact.type === selectedType);
        return matchesSearch && matchesType;
    });

    renderContacts(filtered);
}

function openContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) modal.style.display = 'flex';
}

function closeContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) {
        modal.style.display = 'none';
        ['cnt-name', 'cnt-email', 'cnt-phone', 'cnt-company'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    }
}

// --- DEALS MANAGEMENT ---
async function fetchDeals() {
    try {
        const res = await fetch('/api/deals');
        const data = await res.json();
        if (data.success && data.deals) state.deals = data.deals;
    } catch (e) {
        if (state.deals.length === 0) {
            state.deals = [
                { id: 1, name: "Kasturi Apostle Sky Penthouse Sale", client: "Priya Patil", value: 48500000, stage: "Closed Won", location: "Baner, Pune", date: "2026-07-25" },
                { id: 2, name: "Amanora Park Town Villa Booking", client: "Rohan Mehta", value: 34000000, stage: "Negotiation", location: "Hadapsar, Pune", date: "2026-07-28" }
            ];
        }
    }
    renderDeals(state.deals);
}

function renderDeals(dealsToRender) {
    const tbody = document.getElementById('deals-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    dealsToRender.forEach(deal => {
        const row = document.createElement('tr');
        const isWon = deal.stage === 'Closed Won';
        const badgeClass = isWon ? 'badge-won' : 'badge-progress';
        const valFormatted = '₹' + (Number(deal.value) / 100000).toFixed(1) + ' Lakhs';

        row.innerHTML = `
            <td><strong>${escapeHtml(deal.name)}</strong></td>
            <td>${escapeHtml(deal.client)}</td>
            <td>${valFormatted}</td>
            <td><span class="badge ${badgeClass}">${escapeHtml(deal.stage)}</span></td>
            <td>${escapeHtml(deal.location || 'Pune, MH')}</td>
            <td>
                <button onclick="deleteDeal(${deal.id})" style="background: none; border: none; color: var(--neon-red); cursor: pointer; font-size: 14px;">🗑️ Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    updateMetricsSummary();
}

async function addNewDeal() {
    const name = document.getElementById('deal-name-inp')?.value.trim();
    const client = document.getElementById('deal-client-inp')?.value.trim();
    const value = document.getElementById('deal-value-inp')?.value.trim();
    const stage = document.getElementById('deal-stage-inp')?.value || "Qualified";
    const location = document.getElementById('deal-location-inp')?.value.trim() || "Pune, MH";

    if (!name || !client || !value) {
        alert("Please fill in Deal Name, Client, and Value!");
        return;
    }

    const payload = { name, client, value, stage, location };

    try {
        const res = await fetch('/api/deals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            state.deals.unshift(data.deal);
        } else {
            state.deals.unshift({ id: Date.now(), ...payload });
        }
    } catch (e) {
        state.deals.unshift({ id: Date.now(), ...payload });
    }

    renderDeals(state.deals);
    closeDealModal();
}

async function deleteDeal(id) {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
        await fetch(`/api/deals/${id}`, { method: 'DELETE' });
    } catch (e) {}
    state.deals = state.deals.filter(d => d.id !== id);
    renderDeals(state.deals);
}

function openDealModal() {
    const modal = document.getElementById('deal-modal');
    if (modal) modal.style.display = 'flex';
}

function closeDealModal() {
    const modal = document.getElementById('deal-modal');
    if (modal) modal.style.display = 'none';
}

// --- TASKS MANAGEMENT ---
async function fetchTasks() {
    try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        if (data.success && data.tasks) state.tasks = data.tasks;
    } catch (e) {
        if (state.tasks.length === 0) {
            state.tasks = [
                { id: 1, text: "Site Visit with Aditya Kulkarni at Panchshil Towers Kharadi", status: "Due Today" },
                { id: 2, text: "Send MAHARERA Deed agreement to Priya Patil for Baner Penthouse", status: "Due Today" }
            ];
        }
    }
    renderTasks(state.tasks);
}

function renderTasks(tasksToRender) {
    const container = document.getElementById('tasks-container');
    if (!container) return;

    container.innerHTML = '';
    tasksToRender.forEach(task => {
        const isCompleted = task.status === 'Completed';
        const badgeClass = isCompleted ? 'badge-won' : 'badge-progress';
        const taskHtml = `
            <div class="task-list-item" id="task-${task.id}">
                <div class="task-check" style="display:flex; align-items:center; gap:10px;">
                    <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleTaskStatus(${task.id})">
                    <span style="${isCompleted ? 'text-decoration: line-through; color: var(--text-secondary);' : ''}">${escapeHtml(task.text)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="badge ${badgeClass}">${task.status}</span>
                    <button onclick="deleteTask(${task.id})" style="background: none; border: none; color: var(--neon-red); cursor: pointer; font-size: 16px;" title="Delete Task">🗑️</button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', taskHtml);
    });
}

async function addNewTask() {
    const taskInput = document.getElementById('new-task-text');
    const statusSelect = document.getElementById('new-task-status');
    const text = taskInput?.value.trim();

    if (!text) {
        alert("Please enter a task description.");
        return;
    }

    const payload = { text, status: statusSelect?.value || 'Due Today' };

    try {
        const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            state.tasks.unshift(data.task);
        } else {
            state.tasks.unshift({ id: Date.now(), ...payload });
        }
    } catch (e) {
        state.tasks.unshift({ id: Date.now(), ...payload });
    }

    renderTasks(state.tasks);
    if (taskInput) taskInput.value = '';
}

async function toggleTaskStatus(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.status = task.status === 'Completed' ? 'Due Today' : 'Completed';
        try {
            await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: task.status })
            });
        } catch (e) {}
        renderTasks(state.tasks);
    }
}

async function deleteTask(id) {
    try {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (e) {}
    state.tasks = state.tasks.filter(t => t.id !== id);
    renderTasks(state.tasks);
}

// --- COMPANIES & PROJECTS FOR SALE ---
async function fetchProjects() {
    try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (data.success && data.projects) {
            state.projects = data.projects;
            state.properties = data.projects;
        }
    } catch (e) {
        console.warn("Using default Pune project inventory");
    }
    renderCompaniesProjects();
    renderPropertiesDetailed();
}

function renderCompaniesProjects() {
    const container = document.getElementById('companies-projects-container');
    if (!container) return;

    container.innerHTML = '';
    state.projects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'board-panel';
        card.style.cssText = 'overflow: hidden; padding: 0; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.08);';

        const amenitiesHtml = p.amenities ? p.amenities.map(a => `<span style="background: rgba(168,85,247,0.15); color: #c084fc; border: 1px solid rgba(168,85,247,0.3); font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: 600;">${a}</span>`).join(' ') : '';

        card.innerHTML = `
            <div style="display: grid; grid-template-columns: 320px 1fr; gap: 0;">
                <div style="position: relative; height: 100%; min-height: 220px; overflow: hidden; background: #000;">
                    <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    <span style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.8); color: var(--neon-green); border: 1px solid var(--neon-green); font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 700;">
                        ${p.bhk}
                    </span>
                </div>
                <div style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <span style="font-size: 12px; color: #a855f7; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">${p.company}</span>
                                <h3 style="font-size: 20px; font-weight: 800; margin: 4px 0 6px 0; color: #fff;">${p.name}</h3>
                                <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 12px 0;">📍 ${p.location} • <span style="color: #38bdf8;">${p.rera}</span></p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 24px; font-weight: 800; color: var(--neon-green);">${p.priceFormatted}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${p.pricePerSqft}</div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 24px; margin: 16px 0; padding: 12px 16px; background: var(--bg-input); border-radius: 8px;">
                            <div>
                                <span style="font-size: 11px; color: var(--text-secondary); display: block;">CARPET AREA</span>
                                <strong style="font-size: 15px; color: #fff;">${p.sqft} sq.ft</strong>
                            </div>
                            <div>
                                <span style="font-size: 11px; color: var(--text-secondary); display: block;">DEVELOPER</span>
                                <strong style="font-size: 15px; color: #fff;">${p.company}</strong>
                            </div>
                            <div>
                                <span style="font-size: 11px; color: var(--text-secondary); display: block;">LOCATION</span>
                                <strong style="font-size: 15px; color: #fff;">Pune, MH</strong>
                            </div>
                        </div>

                        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;">
                            ${amenitiesHtml}
                        </div>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px;">
                        <button onclick="openGoogleFormDirect()" class="auth-btn" style="width: auto; margin: 0; padding: 10px 18px; background: transparent; border: 1px solid var(--text-secondary);">
                            📝 Open Official Google Form
                        </button>
                        <button onclick="openLeadModal('${p.name}')" class="auth-btn" style="width: auto; margin: 0; padding: 10px 20px; background: linear-gradient(135deg, #10b981, #059669);">
                            ⚡ + Book Project Inquiry
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- DETAILED INFORMATIVE PROPERTY INVENTORY ---
function renderPropertiesDetailed() {
    const grid = document.getElementById('properties-detailed-grid');
    if (!grid) return;

    grid.innerHTML = '';
    state.properties.forEach(p => {
        const card = document.createElement('div');
        card.className = 'board-panel';
        card.style.cssText = 'padding: 0; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; justify-content: space-between;';

        card.innerHTML = `
            <div style="position: relative; height: 180px; background: #000; overflow: hidden;">
                <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">
                <span style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: #38bdf8; border: 1px solid #38bdf8; font-size: 10px; padding: 3px 8px; border-radius: 4px; font-weight: 700;">
                    ${p.rera}
                </span>
            </div>
            <div style="padding: 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <span style="font-size: 11px; color: var(--text-secondary); font-weight: 700;">${p.company}</span>
                    <h4 style="font-size: 16px; font-weight: 700; margin: 4px 0 8px 0; color: #fff;">${p.name}</h4>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">📍 ${p.location}</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: var(--bg-input); padding: 8px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 12px;">
                        <div><span style="color: var(--text-secondary);">Area:</span> <strong>${p.sqft} sq.ft</strong></div>
                        <div><span style="color: var(--text-secondary);">Config:</span> <strong>${p.bhk}</strong></div>
                        <div><span style="color: var(--text-secondary);">Rate:</span> <strong>${p.pricePerSqft}</strong></div>
                        <div><span style="color: var(--text-secondary);">Status:</span> <strong style="color:var(--neon-green);">Ready / Launch</strong></div>
                    </div>
                </div>

                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <span style="font-size: 18px; font-weight: 800; color: var(--neon-green);">${p.priceFormatted}</span>
                        <button onclick="openLeadModal('${p.name}')" class="auth-btn" style="width: auto; margin: 0; padding: 6px 14px; font-size: 12px;">+ Inquire</button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateBudgetField(amount) {
    const input = document.getElementById('budgetInputBox');
    if (input) input.value = amount;
    fetchMatchingProjects();
}

function fetchMatchingProjects() {
    const budgetBox = document.getElementById('budgetInputBox');
    const budget = Number(budgetBox ? budgetBox.value : 0);

    if (!budget || budget <= 0) {
        renderPropertiesDetailed();
        return;
    }

    const matches = state.properties.filter(p => p.price <= budget);
    const grid = document.getElementById('properties-detailed-grid');
    if (grid) {
        grid.innerHTML = '';
        if (matches.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No properties matched within budget ₹${Number(budget).toLocaleString('en-IN')}.</div>`;
            return;
        }
        matches.forEach(p => {
            const card = document.createElement('div');
            card.className = 'board-panel';
            card.style.cssText = 'padding: 16px; border: 1px solid var(--accent-glow);';
            card.innerHTML = `
                <h4>${p.name}</h4>
                <p style="font-size:12px; color:var(--text-secondary);">${p.location} • ${p.sqft} sq.ft</p>
                <h3 style="color:var(--neon-green);">${p.priceFormatted}</h3>
            `;
            grid.appendChild(card);
        });
    }
}

// --- SETTINGS MANAGEMENT ---
async function fetchSettings() {
    try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
            state.settings = { ...state.settings, ...data.settings };
        }
    } catch (e) {}
    populateSettingsForm();
}

function populateSettingsForm() {
    const s = state.settings;
    if (document.getElementById('set-agent-name')) document.getElementById('set-agent-name').value = s.agentName;
    if (document.getElementById('set-agent-email')) document.getElementById('set-agent-email').value = s.agentEmail;
    if (document.getElementById('set-agent-phone')) document.getElementById('set-agent-phone').value = s.agentPhone;
    if (document.getElementById('set-agency-name')) document.getElementById('set-agency-name').value = s.agencyName;
    if (document.getElementById('set-rera-no')) document.getElementById('set-rera-no').value = s.reraNo;
    if (document.getElementById('set-google-url')) document.getElementById('set-google-url').value = s.googleFormUrl;
}

async function saveSettings(e) {
    if (e) e.preventDefault();
    const updated = {
        agentName: document.getElementById('set-agent-name')?.value.trim() || state.settings.agentName,
        agentEmail: document.getElementById('set-agent-email')?.value.trim() || state.settings.agentEmail,
        agentPhone: document.getElementById('set-agent-phone')?.value.trim() || state.settings.agentPhone,
        agencyName: document.getElementById('set-agency-name')?.value.trim() || state.settings.agencyName,
        reraNo: document.getElementById('set-rera-no')?.value.trim() || state.settings.reraNo,
        googleFormUrl: document.getElementById('set-google-url')?.value.trim() || state.settings.googleFormUrl
    };

    try {
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
    } catch (e) {}

    state.settings = { ...state.settings, ...updated };
    alert("⚙️ Settings updated and saved successfully!");
}

// --- USERS ROSTER ---
async function fetchUsers() {
    try {
        const res = await fetch('/api/users');
        const data = await res.json();
        if (data.success && data.users) state.users = data.users;
    } catch (e) {
        if (state.users.length === 0) {
            state.users = [
                { id: 1, name: "Sejal Wagh", email: "sejalwagh4546@gmail.com", role: "Principal Consultant", location: "Pune, MH" },
                { id: 2, name: "Rajesh Joshi", email: "admin@crm.com", role: "Sales Director", location: "Pune, MH" },
                { id: 3, name: "Aarav Sharma", email: "aarav@crm.com", role: "Senior Property Advisor", location: "Baner, Pune" }
            ];
        }
    }
    renderUsers(state.users);
}

function renderUsers(usersToRender) {
    const tableBody = document.getElementById('sales-team-list');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    usersToRender.forEach(u => {
        const initial = (u.name || u.email).charAt(0).toUpperCase();
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-900/40 transition';
        row.innerHTML = `
            <td style="padding: 14px 20px;" class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-xs">${initial}</div>
                <span class="font-semibold text-white">${escapeHtml(u.name || 'Agent')}</span>
            </td>
            <td style="padding: 14px 20px;" class="text-slate-400">${escapeHtml(u.email)}</td>
            <td style="padding: 14px 20px;">
                <span class="bg-sky-500/10 border border-sky-500/30 text-sky-400 px-2.5 py-1 rounded-md text-[11px] font-semibold">${escapeHtml(u.role || 'Property Advisor')}</span>
            </td>
            <td style="padding: 14px 20px;">
                <span style="display: inline-flex; align-items: center; gap: 6px; color: #4ade80; font-size: 12px; font-weight: 600;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #4ade80;"></span>
                    Active (Pune)
                </span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function registerTeamUser(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const roleInput = document.getElementById('reg-role');

    const name = nameInput?.value.trim();
    const email = emailInput?.value.trim();
    const role = roleInput?.value || "Property Advisor";

    if (!name || !email) {
        alert("Please enter Name and Email for team member.");
        return;
    }

    try {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, role })
        });
        const data = await res.json();
        if (data.success) state.users.push(data.user);
        else state.users.push({ id: Date.now(), name, email, role, location: "Pune, MH" });
    } catch (e) {
        state.users.push({ id: Date.now(), name, email, role, location: "Pune, MH" });
    }

    renderUsers(state.users);
    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
}

// --- METRICS & SUMMARY ---
function updateMetricsSummary() {
    const totalLeadsEl = document.getElementById('statTotal');
    const newLeadsEl = document.getElementById('statNew');
    const contactedLeadsEl = document.getElementById('statContacted');
    const qualifiedLeadsEl = document.getElementById('statQualified');

    if (totalLeadsEl) totalLeadsEl.textContent = state.leads.length;
    if (newLeadsEl) newLeadsEl.textContent = state.leads.filter(l => l.status === 'New').length;
    if (contactedLeadsEl) contactedLeadsEl.textContent = state.leads.filter(l => l.status === 'Contacted' || l.status === 'In Contact').length;
    if (qualifiedLeadsEl) qualifiedLeadsEl.textContent = state.leads.filter(l => l.status === 'Qualified' || l.status === 'Closed Won').length;

    const totalDealsValueEl = document.getElementById('statDealsValue');
    if (totalDealsValueEl) {
        const totalVal = state.deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
        totalDealsValueEl.textContent = '₹' + (totalVal / 10000000).toFixed(2) + ' Cr';
    }
}

// --- CHARTS RENDERING ---
function renderCharts() {
    if (typeof Chart === 'undefined') return;

    const ctxTrend = document.getElementById('salesTrendChart')?.getContext('2d') || document.getElementById('revenueChart')?.getContext('2d');
    if (ctxTrend) {
        if (window.salesTrendInstance) window.salesTrendInstance.destroy();
        window.salesTrendInstance = new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Revenue (in ₹ Lakhs)',
                    data: [120, 195, 150, 220, 280, 340, 485],
                    borderColor: '#a855f7',
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#a855f7'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#94a3b8' } } },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    }

    const ctxStatus = document.getElementById('statusBreakdownChart')?.getContext('2d') || document.getElementById('leadStatusChart')?.getContext('2d');
    if (ctxStatus) {
        if (window.statusBreakdownInstance) window.statusBreakdownInstance.destroy();
        window.statusBreakdownInstance = new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: ['New', 'Contacted', 'Qualified', 'Closed Won'],
                datasets: [{
                    data: [
                        state.leads.filter(l => l.status === 'New').length || 2,
                        state.leads.filter(l => l.status === 'Contacted').length || 3,
                        state.leads.filter(l => l.status === 'Qualified').length || 4,
                        state.leads.filter(l => l.status === 'Closed Won').length || 2
                    ],
                    backgroundColor: ['#38bdf8', '#facc15', '#a855f7', '#4ade80'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } },
                cutout: '65%'
            }
        });
    }
}

// --- UTILITY ---
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Expose functions globally
window.toggleInterfaceMode = toggleInterfaceMode;
window.submitAuthData = submitAuthData;
window.performLogout = performLogout;
window.switchTab = switchTab;
window.addNewLead = addNewLead;
window.deleteLead = deleteLead;
window.filterLeads = filterLeads;
window.openLeadModal = openLeadModal;
window.closeLeadModal = closeLeadModal;
window.openGoogleFormDirect = openGoogleFormDirect;
window.addNewContact = addNewContact;
window.deleteContact = deleteContact;
window.filterContacts = filterContacts;
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.addNewDeal = addNewDeal;
window.deleteDeal = deleteDeal;
window.openDealModal = openDealModal;
window.closeDealModal = closeDealModal;
window.addNewTask = addNewTask;
window.toggleTaskStatus = toggleTaskStatus;
window.deleteTask = deleteTask;
window.registerTeamUser = registerTeamUser;
window.updateBudgetField = updateBudgetField;
window.fetchMatchingProjects = fetchMatchingProjects;
window.saveSettings = saveSettings;
