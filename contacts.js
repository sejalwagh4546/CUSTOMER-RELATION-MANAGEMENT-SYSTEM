// Modal Functions
function openContactModal() {
    document.getElementById('contact-modal').style.display = 'flex';
}

function closeContactModal() {
    document.getElementById('contact-modal').style.display = 'none';
    clearFormFields();
}

function clearFormFields() {
    document.getElementById('cnt-name').value = '';
    document.getElementById('cnt-email').value = '';
    document.getElementById('cnt-phone').value = '';
    document.getElementById('cnt-company').value = '';
}

// Add New Contact Logic
function addNewContact() {
    const name = document.getElementById('cnt-name').value.trim();
    const email = document.getElementById('cnt-email').value.trim();
    const phone = document.getElementById('cnt-phone').value.trim();
    const company = document.getElementById('cnt-company').value.trim() || 'N/A';
    const type = document.getElementById('cnt-type').value;

    if (!name || !email) {
        alert("Please enter at least Full Name and Email.");
        return;
    }

    const tbody = document.getElementById('contacts-table-body');
    const row = document.createElement('tr');

    let badgeClass = 'badge-progress';
    if (type === 'Client') badgeClass = 'badge-won';
    if (type === 'Partner') badgeClass = 'badge-pending';

    row.innerHTML = `
        <td><strong>${name}</strong></td>
        <td>${email}<br><small style="color: var(--text-secondary);">${phone || 'N/A'}</small></td>
        <td>${company}</td>
        <td><span class="badge ${badgeClass}">${type}</span></td>
        <td>
            <button onclick="deleteContact(this)" style="background: none; border: none; color: var(--neon-red); cursor: pointer; font-size: 14px;">Delete</button>
        </td>
    `;

    tbody.appendChild(row);
    closeContactModal();
}

// Delete Contact Row
function deleteContact(button) {
    const row = button.closest('tr');
    if (confirm("Are you sure you want to delete this contact?")) {
        row.remove();
    }
}

// Filter Contacts Logic
function filterContacts() {
    const searchText = document.getElementById('contactSearchInput').value.toLowerCase();
    const selectedType = document.getElementById('contactTypeFilter').value;
    const rows = document.querySelectorAll('#contacts-table-body tr');

    rows.forEach(row => {
        const rowText = row.innerText.toLowerCase();
        const typeBadge = row.querySelector('.badge').innerText;

        const matchesSearch = rowText.includes(searchText);
        const matchesType = (selectedType === 'All' || typeBadge === selectedType);

        if (matchesSearch && matchesType) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}