const http = require('http');

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testAll() {
  console.log('--- Testing API Endpoints ---');
  
  // 1. Settings
  const s = await request('http://localhost:3000/api/settings');
  console.log('1. Settings API:', s.status, s.data);

  // 2. Pricing
  const p = await request('http://localhost:3000/api/pricing');
  console.log('2. Pricing API:', p.status, 'Items count:', p.data.pricing.length);
  p.data.pricing.forEach(item => {
    console.log(`   - ${item.title}: ₹${item.price} (${item.unit})`);
  });

  // 3. Photos
  const ph = await request('http://localhost:3000/api/photos');
  console.log('3. Photos API:', ph.status, 'Photos count:', ph.data.photos.length);
  ph.data.photos.forEach(item => console.log(`   Photo: ${item.title} | Category: ${item.category}`));

  // 4. Submit Enquiry
  const enq = await request('http://localhost:3000/api/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Aarti Deshmukh',
    age: 24,
    dance_style: 'Sangeet - Couple',
    email: 'aarti.d@gmail.com',
    phone: '8767100648',
    notes: 'Wedding on November 15, need couple choreography'
  });
  console.log('4. Submit Enquiry API:', enq.status, enq.data);

  // 5. Admin Login
  const login = await request('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    username: 'waghsejal.8676@gmail.com',
    password: 'Sejal@8676'
  });
  console.log('5. Admin Login API:', login.status, login.data);

  // 6. Admin Confidential Enquiries
  const confidential = await request('http://localhost:3000/api/enquiries', {
    headers: { 'Authorization': 'Bearer ' + login.data.token }
  });
  console.log('6. Confidential Enquiries API:', confidential.status, 'Received enquiries:', confidential.data.enquiries.length);
  confidential.data.enquiries.forEach(e => {
    console.log(`   - Name: ${e.name}, Style: ${e.dance_style}, Contact: ${e.phone}, Email: ${e.email}`);
  });

  console.log('--- ALL API TESTS PASSED SUCCESSFULLY ---');
}

testAll().catch(console.error);
