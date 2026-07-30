const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- IN-MEMORY DATABASE ARRAYS LOCALIZED TO PUNE, MAHARASHTRA ---
const registeredUsers = [
    { id: 1, email: "sejalwagh4546@gmail.com", password: "password123", name: "Sejal Wagh", role: "Principal Consultant", location: "Pune, Maharashtra" },
    { id: 2, email: "admin@crm.com", password: "password123", name: "Rajesh Joshi", role: "Sales Director", location: "Pune, Maharashtra" },
    { id: 3, email: "aarav@crm.com", password: "password123", name: "Aarav Sharma", role: "Senior Property Advisor", location: "Baner, Pune" },
    { id: 4, email: "tanvi@crm.com", password: "password123", name: "Tanvi Deshmukh", role: "Client Relationship Manager", location: "Kharadi, Pune" }
];

let leads = [
    { id: 1, name: "Aditya Kulkarni", contact: "+91 98221 44556", email: "aditya.kulkarni@gmail.com", source: "Google Form", status: "Qualified", budget: 16500000, agent: "Sejal Wagh", project: "Panchshil Towers Kharadi", date: "2026-07-28" },
    { id: 2, name: "Sneha Kulkarni", contact: "+91 91234 56789", email: "sneha.kulkarni@yahoo.com", source: "Google Form", status: "Contacted", budget: 8500000, agent: "Tanvi Deshmukh", project: "Godrej Hillside Hinjewadi", date: "2026-07-29" },
    { id: 3, name: "Rohan Mehta", contact: "+91 98765 43210", email: "rohan.mehta@apexdev.in", source: "Website Inquiry", status: "New", budget: 34000000, agent: "Aarav Sharma", project: "Amanora Park Town Villa", date: "2026-07-29" },
    { id: 4, name: "Priya Patil", contact: "+91 99887 76655", email: "priya.patil@blueskyrealty.com", source: "Referral", status: "Qualified", budget: 48500000, agent: "Sejal Wagh", project: "Kasturi Apostle Penthouse", date: "2026-07-30" },
    { id: 5, name: "Vikram Malhotra", contact: "+91 94220 11223", email: "vikram@malhotra.io", source: "Google Form", status: "Closed Won", budget: 18000000, agent: "Rajesh Joshi", project: "VTP Pegasus Kharadi", date: "2026-07-30" }
];

let contacts = [
    { id: 1, name: "Aditya Kulkarni", email: "aditya.kulkarni@gmail.com", phone: "+91 98221 44556", company: "Kulkarni Tech Solutions", type: "Client", location: "Kothrud, Pune" },
    { id: 2, name: "Sneha Kulkarni", email: "sneha.kulkarni@yahoo.com", phone: "+91 91234 56789", company: "FinServ Global Pune", type: "Prospect", location: "Hinjewadi, Pune" },
    { id: 3, name: "Rohan Mehta", email: "rohan.mehta@apexdev.in", phone: "+91 98765 43210", company: "Apex Infrastructure Pune", type: "Client", location: "Baner, Pune" },
    { id: 4, name: "Priya Patil", email: "priya.patil@blueskyrealty.com", phone: "+91 99887 76655", company: "BlueSky Realty Maharashtra", type: "Partner", location: "Viman Nagar, Pune" },
    { id: 5, name: "Suresh Iyer", email: "suresh@iyerestates.com", phone: "+91 99220 33445", company: "Iyer Property Consultants", type: "Partner", location: "Camp, Pune" }
];

let deals = [
    { id: 1, name: "Kasturi Apostle Sky Penthouse Sale", client: "Priya Patil", value: 48500000, stage: "Closed Won", location: "Baner, Pune", date: "2026-07-25" },
    { id: 2, name: "Amanora Park Town 4BHK Villa Booking", client: "Rohan Mehta", value: 34000000, stage: "Negotiation", location: "Hadapsar, Pune", date: "2026-07-28" },
    { id: 3, name: "Panchshil Towers 3BHK Apartment", client: "Aditya Kulkarni", value: 16500000, stage: "Proposal Sent", location: "Kharadi, Pune", date: "2026-07-29" },
    { id: 4, name: "Godrej Hillside 2BHK Flat Booking", client: "Sneha Kulkarni", value: 8500000, stage: "Qualified", location: "Hinjewadi, Pune", date: "2026-07-30" }
];

let tasks = [
    { id: 1, text: "Site Visit with Aditya Kulkarni at Panchshil Towers Kharadi", status: "Due Today", date: "2026-07-30" },
    { id: 2, text: "Send MAHARERA Deed agreement to Priya Patil for Baner Penthouse", status: "Due Today", date: "2026-07-30" },
    { id: 3, text: "Verify property title deeds for Amanora Villa project Hadapsar", status: "Completed", date: "2026-07-29" },
    { id: 4, text: "Follow up on HDFC Home Loan approval for Sneha Kulkarni", status: "Pending", date: "2026-07-31" },
    { id: 5, text: "Client Meeting at VTP Pegasus Sales Gallery Kharadi", status: "Due Tomorrow", date: "2026-07-31" }
];

const projectsForSale = [
    {
        id: 1,
        name: "Panchshil World Trade Towers & Residency",
        company: "Panchshil Realty Pune",
        location: "Kharadi, Pune, Maharashtra",
        sqft: 1850,
        bhk: "3 BHK Ultra Luxury",
        price: 16500000,
        priceFormatted: "₹1.65 Crores",
        pricePerSqft: "₹8,918/sq.ft",
        image: "assets/pune_luxury_apartment_1785435301859.jpg",
        rera: "MAHARERA P52100012345",
        googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSen6nA9c8CQQN6C1YE9boioNK8eoKYAYA5On7GmEmV9YDg75w/viewform?usp=publish-editor",
        amenities: ["Infinity Pool", "Clubhouse", "EV Charging", "24/7 Security", "Private Balconies"]
    },
    {
        id: 2,
        name: "Amanora Park Town Independent Villas",
        company: "City Corporation Ltd (Amanora)",
        location: "Hadapsar - Magarpatta, Pune, MH",
        sqft: 3200,
        bhk: "4 BHK Independent Villa",
        price: 34000000,
        priceFormatted: "₹3.40 Crores",
        pricePerSqft: "₹10,625/sq.ft",
        image: "assets/pune_villa_project_1785435315094.jpg",
        rera: "MAHARERA P52100098765",
        googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSen6nA9c8CQQN6C1YE9boioNK8eoKYAYA5On7GmEmV9YDg75w/viewform?usp=publish-editor",
        amenities: ["Private Pool", "Landscaped Garden", "Private Garage", "Smart Home Automation"]
    },
    {
        id: 3,
        name: "Kasturi Apostle Sky Penthouse",
        company: "Kasturi Housing Pune",
        location: "Baner - Balewadi High Street, Pune, MH",
        sqft: 4100,
        bhk: "4 BHK Sky Penthouse",
        price: 48500000,
        priceFormatted: "₹4.85 Crores",
        pricePerSqft: "₹11,829/sq.ft",
        image: "assets/pune_penthouse_1785435330817.jpg",
        rera: "MAHARERA P52100045678",
        googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSen6nA9c8CQQN6C1YE9boioNK8eoKYAYA5On7GmEmV9YDg75w/viewform?usp=publish-editor",
        amenities: ["Private Elevator", "Terrace Lounge", "Jacuzzi", "Sky Garden", "Concierge Service"]
    },
    {
        id: 4,
        name: "Godrej Hillside & Life Republic",
        company: "Godrej Properties Pune",
        location: "Hinjewadi Phase 1 IT Park, Pune, MH",
        sqft: 1150,
        bhk: "2 BHK Premium Flat",
        price: 8500000,
        priceFormatted: "₹85 Lakhs",
        pricePerSqft: "₹7,391/sq.ft",
        image: "assets/pune_luxury_apartment_1785435301859.jpg",
        rera: "MAHARERA P52100033211",
        googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSen6nA9c8CQQN6C1YE9boioNK8eoKYAYA5On7GmEmV9YDg75w/viewform?usp=publish-editor",
        amenities: ["Gym & Spa", "Badminton Court", "Co-Working Hub", "Children Play Zone"]
    }
];

let crmSettings = {
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
};

// --- API ENDPOINTS ---

// Auth Endpoints
app.post('/api/auth/signup', (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please fill in email and password." });
    }
    const userExists = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
        return res.status(400).json({ success: false, message: "Email is already registered." });
    }
    const agentName = name || email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
    const newUser = {
        id: Date.now(),
        email,
        password,
        name: agentName,
        role: role || "Senior Property Advisor",
        location: "Pune, Maharashtra"
    };
    registeredUsers.push(newUser);
    res.json({ success: true, message: "Registration successful! You can now log in.", user: newUser });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = registeredUsers.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    res.json({ success: true, message: "Login successful!", user: { id: user.id, name: user.name, email: user.email, role: user.role, location: user.location } });
});

// Users Roster
app.get('/api/users', (req, res) => {
    res.json({ success: true, users: registeredUsers });
});

app.post('/api/users', (req, res) => {
    const { name, email, role } = req.body;
    if (!email || !name) {
        return res.status(400).json({ success: false, message: "Name and email are required." });
    }
    const newUser = { id: Date.now(), name, email, role: role || "Property Advisor", location: "Pune, MH", password: "password123" };
    registeredUsers.push(newUser);
    res.json({ success: true, user: newUser });
});

// Leads Endpoints (Saves to both Leads and Contacts)
app.get('/api/leads', (req, res) => {
    res.json({ success: true, leads });
});

app.post('/api/leads', (req, res) => {
    const { name, contact, email, phone, source, status, budget, agent, project, company } = req.body;
    if (!name || (!contact && !email && !phone)) {
        return res.status(400).json({ success: false, message: "Name and contact details are required." });
    }
    
    const contactDetail = contact || phone || email;
    const emailDetail = email || (contactDetail.includes('@') ? contactDetail : `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`);
    const phoneDetail = phone || (!contactDetail.includes('@') ? contactDetail : '+91 98220 11223');

    const newLead = {
        id: Date.now(),
        name,
        contact: contactDetail,
        email: emailDetail,
        phone: phoneDetail,
        source: source || "Google Form",
        status: status || "New",
        budget: Number(budget) || 12000000,
        agent: agent || "Sejal Wagh",
        project: project || "Panchshil Towers Kharadi",
        date: new Date().toISOString().split('T')[0]
    };
    leads.unshift(newLead);

    // Also auto-sync to Contacts Directory!
    const contactExists = contacts.find(c => c.email.toLowerCase() === emailDetail.toLowerCase() || c.name.toLowerCase() === name.toLowerCase());
    if (!contactExists) {
        const newContact = {
            id: Date.now() + 1,
            name,
            email: emailDetail,
            phone: phoneDetail,
            company: company || "Individual Buyer",
            type: status === "Qualified" || status === "Closed Won" ? "Client" : "Prospect",
            location: "Pune, Maharashtra"
        };
        contacts.unshift(newContact);
    }

    res.json({ success: true, lead: newLead, leads, contacts });
});

app.delete('/api/leads/:id', (req, res) => {
    const id = Number(req.params.id);
    leads = leads.filter(l => l.id !== id);
    res.json({ success: true, message: "Lead removed." });
});

// Contacts Endpoints
app.get('/api/contacts', (req, res) => {
    res.json({ success: true, contacts });
});

app.post('/api/contacts', (req, res) => {
    const { name, email, phone, company, type, location } = req.body;
    if (!name || !email) {
        return res.status(400).json({ success: false, message: "Name and email are required." });
    }
    const newContact = {
        id: Date.now(),
        name,
        email,
        phone: phone || "+91 98220 00000",
        company: company || "N/A",
        type: type || "Client",
        location: location || "Pune, MH"
    };
    contacts.unshift(newContact);
    res.json({ success: true, contact: newContact });
});

app.delete('/api/contacts/:id', (req, res) => {
    const id = Number(req.params.id);
    contacts = contacts.filter(c => c.id !== id);
    res.json({ success: true, message: "Contact deleted." });
});

// Deals Endpoints
app.get('/api/deals', (req, res) => {
    res.json({ success: true, deals });
});

app.post('/api/deals', (req, res) => {
    const { name, client, value, stage, location, date } = req.body;
    if (!name || !client || !value) {
        return res.status(400).json({ success: false, message: "Name, client, and value are required." });
    }
    const newDeal = {
        id: Date.now(),
        name,
        client,
        value: Number(value),
        stage: stage || "Qualified",
        location: location || "Pune, Maharashtra",
        date: date || new Date().toISOString().split('T')[0]
    };
    deals.unshift(newDeal);
    res.json({ success: true, deal: newDeal });
});

app.delete('/api/deals/:id', (req, res) => {
    const id = Number(req.params.id);
    deals = deals.filter(d => d.id !== id);
    res.json({ success: true, message: "Deal deleted." });
});

// Tasks Endpoints
app.get('/api/tasks', (req, res) => {
    res.json({ success: true, tasks });
});

app.post('/api/tasks', (req, res) => {
    const { text, status } = req.body;
    if (!text) {
        return res.status(400).json({ success: false, message: "Task description required." });
    }
    const newTask = {
        id: Date.now(),
        text,
        status: status || "Due Today",
        date: new Date().toISOString().split('T')[0]
    };
    tasks.unshift(newTask);
    res.json({ success: true, task: newTask });
});

app.put('/api/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = req.body.status || (task.status === 'Completed' ? 'Due Today' : 'Completed');
    }
    res.json({ success: true, task });
});

app.delete('/api/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    tasks = tasks.filter(t => t.id !== id);
    res.json({ success: true, message: "Task deleted." });
});

// Projects for Sale & Properties Endpoints
app.get('/api/projects', (req, res) => {
    res.json({ success: true, projects: projectsForSale });
});

app.get('/api/properties', (req, res) => {
    res.json({ success: true, properties: projectsForSale });
});

// Settings Endpoints
app.get('/api/settings', (req, res) => {
    res.json({ success: true, settings: crmSettings });
});

app.post('/api/settings', (req, res) => {
    crmSettings = { ...crmSettings, ...req.body };
    res.json({ success: true, message: "Settings saved successfully!", settings: crmSettings });
});

// Fallback Route for SPA
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 SysInsight Real Estate CRM Server running on http://localhost:${PORT}`);
});