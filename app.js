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

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid email or password credentials." });
    }
    res.json({ success: true, message: "Access Granted.", user: { name: user.name, email: user.email } });
});

// --- INVENTORY ENDPOINTS ---
app.get('/api/inventory', (req, res) => {
    const masterInventory = [
        { id: 1, name: "Eco Studios", price: 200000, status: "Available" },
        { id: 2, name: "Skyline Towers", price: 350000, status: "Available" },
        { id: 3, name: "Grand Vista Villas", price: 500000, status: "Sold Out" }
    ];
    const maxBudget = parseFloat(req.query.budget);
    if (!maxBudget) return res.json(masterInventory);
    res.json(masterInventory.filter(item => item.price <= maxBudget));
});

app.listen(PORT, () => console.log(`🚀 SysInsight Backend serving on http://localhost:${PORT}`));