const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json());

// In-Memory Database Arrays
const registeredUsers = [
    { email: "waghsejal@company.com", password: "password123", name: "Wagh Sejal" },
    { email: "admin@crm.com", password: "password123", name: "Admin User" }
];

// --- AUTHENTICATION ENDPOINTS ---
app.post('/api/auth/signup', (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please fill in all fields." });
    }
    const userExists = registeredUsers.find(u => u.email === email);
    if (userExists) {
        return res.status(400).json({ success: false, message: "Email is already registered." });
    }
    
    // If no custom name is passed, clean up the email handle to use as the name
    const agentName = name || email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
    
    registeredUsers.push({ email, password, name: agentName });
    res.json({ success: true, message: "Registration successful! You can now log in." });
});
// --- Chart.js Configuration matching your Theme ---
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = '#111a33';

// Initialize Charts when the Reports tab is accessed
let chartsInitialized = false;

function initCharts() {
    if (chartsInitialized) return;
    chartsInitialized = true;

    const ctxPie = document.getElementById('leadPieChart').getContext('2d');
    new Chart(ctxPie, {
    type: 'doughnut',
    data: {
        labels: ['Organic Search', 'Direct Sales', 'LinkedIn', 'Referrals'],
        datasets: [{
        data: [40, 25, 20, 15],
        backgroundColor: ['#3b82f6', '#10b981', '#a855f7', '#ef4444'],
        borderWidth: 0
        }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
});

const ctxBar = document.getElementById('salesBarChart').getContext('2d');
    new Chart(ctxBar, {
    type: 'bar',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
        label: 'Revenue ($)',
        data: [12000, 19000, 15000, 22000, 28000, 34000],
        backgroundColor: '#3b82f6',
        borderRadius: 6
        }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// --- Reports Persistence ---
function saveReportDetails() {
    localStorage.setItem('sysinsight_report_title', document.getElementById('report-title-input').value);
    localStorage.setItem('sysinsight_report_notes', document.getElementById('report-notes').value);
    alert('Report updated and saved to Local Storage!');
}

function loadSavedReport() {
    const title = localStorage.getItem('sysinsight_report_title');
    const notes = localStorage.getItem('sysinsight_report_notes');
    if (title) document.getElementById('report-title-input').value = title;
    if (notes) document.getElementById('report-notes').value = notes;
}

// --- Sales Team Management ---
function loadSalesTeam() {
    let users = JSON.parse(localStorage.getItem('sysinsight_users')) || [
    { name: "sejal", email: "sejal@sysinsight.io", date: new Date().toISOString().split('T')[0], status: "Active" }
    ];
    localStorage.setItem('sysinsight_users', JSON.stringify(users));

    const tbody = document.getElementById('sales-team-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    users.forEach(user => {
    tbody.innerHTML += `
    <tr>
        <td style="font-weight: 500; color: var(--text-primary);">${user.name}</td>
        <td style="color: var(--text-secondary);">${user.email}</td>
        <td style="color: var(--text-secondary);">${user.date}</td>
        <td>
        <span class="status-badge status-active">
        <span class="status-dot"></span> ${user.status}
        </span>
        </td>
    </tr>`;
    });
}

function registerUser(event) {
    event.preventDefault();
    const users = JSON.parse(localStorage.getItem('sysinsight_users')) || [];
    users.push({
    name: document.getElementById('reg-name').value,
    email: document.getElementById('reg-email').value,
    date: new Date().toISOString().split('T')[0],
    status: "Active"
    });
localStorage.setItem('sysinsight_users', JSON.stringify(users));
document.getElementById('reg-name').value = '';
document.getElementById('reg-email').value = '';
loadSalesTeam();
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initCharts();
    loadSavedReport();
    loadSalesTeam();
});

app.listen(PORT, () => console.log(`🚀 SysInsight Backend serving on http://localhost:${PORT}`));