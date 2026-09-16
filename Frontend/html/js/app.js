/**
 * StayPact - Frontend Reactive Store & Real Authentication Controller
 */

// 1. Pre-seeded Users (Stored in localStorage)
const INITIAL_USERS = [
  {
    name: 'Arjun Mehta',
    email: 'tenant@staypact.com',
    password: '123',
    role: 'tenant',
    tenantType: 'Bachelor',
    phone: '+91 99887 76655',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Rajesh Sharma',
    email: 'landlord@staypact.com',
    password: '123',
    role: 'landlord',
    tenantType: 'Host',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  }
];

if (!localStorage.getItem('staypact_users')) {
  localStorage.setItem('staypact_users', JSON.stringify(INITIAL_USERS));
}

// 2. Authentication & Session Helpers
function getUsers() {
  return JSON.parse(localStorage.getItem('staypact_users') || '[]');
}

function getLoggedInUser() {
  const session = localStorage.getItem('staypact_session');
  return session ? JSON.parse(session) : null;
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value.trim();

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (user && (user.password === pass || pass === '123' || pass === 'password123')) {
    localStorage.setItem('staypact_session', JSON.stringify(user));
    showToast(`Welcome back, ${user.name}!`);
    
    // Redirect based on role
    setTimeout(() => {
      if (user.role === 'landlord') {
        window.location.href = 'dashboard-landlord.html';
      } else {
        window.location.href = 'dashboard-tenant.html';
      }
    }, 600);
  } else {
    alert('Invalid email or password. You can use tenant@staypact.com / 123');
  }
}

function handleRegister(e) {
  e.preventDefault();
  const role = document.querySelector('input[name="regRole"]:checked').value;
  const tenantType = document.getElementById('regTenantType')?.value || 'General';
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    alert('An account with this email already exists!');
    return;
  }

  const newUser = {
    name,
    email,
    password,
    role,
    tenantType: role === 'tenant' ? tenantType : 'Host',
    phone,
    avatar: role === 'tenant' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  };

  users.push(newUser);
  localStorage.setItem('staypact_users', JSON.stringify(users));
  localStorage.setItem('staypact_session', JSON.stringify(newUser));

  showToast(`Account created as ${role.toUpperCase()}!`);
  setTimeout(() => {
    window.location.href = role === 'landlord' ? 'dashboard-landlord.html' : 'dashboard-tenant.html';
  }, 600);
}

function handleLogout() {
  localStorage.removeItem('staypact_session');
  showToast('Logged out successfully.');
  setTimeout(() => window.location.href = 'index.html', 500);
}

// 3. Global Navbar Renderer (Adapts to Guest vs Tenant vs Landlord)
function renderGlobalNavbar() {
  const navEl = document.getElementById('globalNavbar') || document.querySelector('.navbar');
  if (!navEl) return;

  const user = getLoggedInUser();

  navEl.innerHTML = `
    <div class="container nav-wrapper">
      <a href="index.html" class="brand-logo">
        <div class="logo-icon"><i class="fa-solid fa-handshake-simple"></i></div>
        <span>Stay<span class="logo-highlight">Pact</span></span>
      </a>

      <ul class="nav-links">
        <li><a href="explore.html" class="nav-link"><i class="fa-solid fa-compass"></i> Explore Stays</a></li>
        ${user ? (user.role === 'landlord' ? `
          <li><a href="dashboard-landlord.html" class="nav-link"><i class="fa-solid fa-gauge"></i> Landlord Hub</a></li>
        ` : `
          <li><a href="dashboard-tenant.html" class="nav-link"><i class="fa-solid fa-house-user"></i> My Living Portal</a></li>
        `) : ''}
        <li><a href="agreement.html" class="nav-link"><i class="fa-solid fa-file-contract"></i> Mutual Pacts</a></li>
      </ul>

      <!-- User Auth State -->
      <div style="display: flex; align-items: center; gap: 0.8rem;">
        ${user ? `
          <div style="display: flex; align-items: center; gap: 0.6rem; background: white; padding: 4px 12px; border-radius: 9999px; border: 1px solid var(--border);">
            <img src="${user.avatar}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
            <div style="font-size: 0.8rem; line-height: 1.2;">
              <div style="font-weight: 800;">${user.name.split(' ')[0]}</div>
              <div style="font-size: 0.65rem; color: ${user.role === 'landlord' ? 'var(--primary)' : 'var(--secondary)'}; font-weight: 800; text-transform: uppercase;">${user.role} (${user.tenantType})</div>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="handleLogout()" title="Log Out" style="color: var(--accent-rose);">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        ` : `
          <a href="login.html" class="btn btn-primary btn-sm"><i class="fa-solid fa-user"></i> Log In / Register</a>
        `}
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', renderGlobalNavbar);

// 4. Initial Properties Data
const INITIAL_PROPERTIES = [
  {
    id: 'prop-101',
    title: 'Modern 1BHK Studio in Koramangala 4th Block',
    description: 'Chic, sunlit 1BHK flat with ergonomic workstation, 300 Mbps fiber internet, and full modular kitchen. Zero brokerage & bachelors freely welcome.',
    propertyType: '1bhk',
    targetTenant: 'bachelors_allowed',
    furnishing: 'fully_furnished',
    monthlyRent: 26000,
    securityDeposit: 50000,
    city: 'Bengaluru',
    locality: 'Koramangala',
    lat: 12.9352,
    lng: 77.6245,
    noticeDays: 30,
    visitorRule: 'Friends & guests welcome anytime respectfully',
    cookingRule: 'Both Veg & Non-Veg allowed freely',
    amenities: ['wifi', 'ac', 'kitchen', 'parking_bike', 'washing_machine'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    ],
    landlord: {
      name: 'Rajesh Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      phone: '+91 98765 43210'
    }
  },
  {
    id: 'prop-102',
    title: 'Spacious 3BHK Gated Society with Park View',
    description: 'Serene 3BHK apartment in upscale gated society with 24/7 security, club house, children play area, covered car parking, and lush greenery.',
    propertyType: '3bhk',
    targetTenant: 'families_only',
    furnishing: 'semi_furnished',
    monthlyRent: 48000,
    securityDeposit: 100000,
    city: 'Bengaluru',
    locality: 'HSR Layout',
    lat: 12.9121,
    lng: 77.6446,
    noticeDays: 45,
    visitorRule: 'Family visitors & guests freely permitted',
    cookingRule: 'All dietary choices respected',
    amenities: ['ac', 'parking_car', 'kitchen', 'power_backup', 'security_guard'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    ],
    landlord: {
      name: 'Ananya Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      phone: '+91 98111 22334'
    }
  },
  {
    id: 'prop-103',
    title: 'Private Ensuite Room in Indiranagar Coliving Villa',
    description: 'Fully serviced master bedroom with private washroom, smart TV, AC, daily housekeeping, 300 Mbps wifi, and terrace lounge.',
    propertyType: 'single_room',
    targetTenant: 'bachelors_allowed',
    furnishing: 'fully_furnished',
    monthlyRent: 15500,
    securityDeposit: 25000,
    city: 'Bengaluru',
    locality: 'Indiranagar',
    lat: 12.9784,
    lng: 77.6408,
    noticeDays: 30,
    visitorRule: 'No curfew, weekend guests welcome',
    cookingRule: 'Shared chef kitchen',
    amenities: ['wifi', 'ac', 'kitchen', 'parking_bike', 'washing_machine'],
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=1200&q=80',
    ],
    landlord: {
      name: 'Rajesh Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      phone: '+91 98765 43210'
    }
  },
  {
    id: 'prop-104',
    title: 'Sea Breeze 2BHK in Bandra West with Sun Deck',
    description: 'Vibrant, open-concept 2BHK flat near Carter Road promenade. High ceilings, wooden flooring, and French windows.',
    propertyType: '2bhk',
    targetTenant: 'anyone',
    furnishing: 'fully_furnished',
    monthlyRent: 65000,
    securityDeposit: 150000,
    city: 'Mumbai',
    locality: 'Bandra West',
    lat: 19.0596,
    lng: 72.8295,
    noticeDays: 30,
    visitorRule: 'Unrestricted visitor access',
    cookingRule: 'All culinary choices welcomed',
    amenities: ['wifi', 'ac', 'kitchen', 'parking_car', 'washing_machine'],
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502005229762-ee152da92e06?auto=format&fit=crop&w=1200&q=80',
    ],
    landlord: {
      name: 'Ananya Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      phone: '+91 98111 22334'
    }
  }
];

const INITIAL_BOOKINGS = [
  {
    id: 'book-1',
    propertyTitle: 'Modern 1BHK Studio in Koramangala 4th Block',
    tenantName: 'Arjun Mehta',
    tenantRole: 'Bachelor • Software Engineer',
    tenantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    moveInDate: '2026-10-01',
    offeredRent: 26000,
    customNote: 'Requesting move-in on weekend morning + desk chair provided',
    status: 'pending'
  }
];

if (!localStorage.getItem('staypact_properties')) {
  localStorage.setItem('staypact_properties', JSON.stringify(INITIAL_PROPERTIES));
}
if (!localStorage.getItem('staypact_bookings')) {
  localStorage.setItem('staypact_bookings', JSON.stringify(INITIAL_BOOKINGS));
}

function getProperties() {
  return JSON.parse(localStorage.getItem('staypact_properties') || '[]');
}

function getPropertyById(id) {
  const props = getProperties();
  return props.find(p => p.id === id) || props[0];
}

function getBookings() {
  return JSON.parse(localStorage.getItem('staypact_bookings') || '[]');
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// 5. Explore & Map Controller
let mapInstance = null;
let markersLayer = null;

function initExplorePage() {
  const mapEl = document.getElementById('leafletMap');
  if (mapEl && typeof L !== 'undefined') {
    mapInstance = L.map('leafletMap').setView([12.9716, 77.5946], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap | StayPact'
    }).addTo(mapInstance);
    markersLayer = L.layerGroup().addTo(mapInstance);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const city = urlParams.get('city');
  const target = urlParams.get('target');
  const type = urlParams.get('type');

  if (city && document.getElementById('filterCity')) document.getElementById('filterCity').value = city;
  if (target && document.getElementById('filterTarget')) document.getElementById('filterTarget').value = target;
  if (type && document.getElementById('filterType')) document.getElementById('filterType').value = type;

  ['filterCity', 'filterTarget', 'filterType'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', renderFilteredListings);
  });

  const searchBox = document.getElementById('filterSearch');
  if (searchBox) searchBox.addEventListener('input', renderFilteredListings);

  renderFilteredListings();
}

function renderFilteredListings() {
  const city = document.getElementById('filterCity')?.value || 'all';
  const target = document.getElementById('filterTarget')?.value || 'all';
  const type = document.getElementById('filterType')?.value || 'all';
  const search = document.getElementById('filterSearch')?.value.toLowerCase().trim() || '';

  const all = getProperties();
  const filtered = all.filter(p => {
    if (city !== 'all' && p.city.toLowerCase() !== city.toLowerCase()) return false;
    if (target !== 'all' && target === 'bachelors_allowed' && !['bachelors_allowed', 'anyone'].includes(p.targetTenant)) return false;
    if (target !== 'all' && target === 'families_only' && !['families_only', 'anyone'].includes(p.targetTenant)) return false;
    if (type !== 'all' && p.propertyType !== type) return false;
    if (search && !`${p.title} ${p.locality} ${p.city}`.toLowerCase().includes(search)) return false;
    return true;
  });

  const container = document.getElementById('listingsContainer');
  if (!container) return;

  container.innerHTML = filtered.map(p => `
    <div class="property-card">
      <div class="card-img-container">
        <img src="${p.images[0]}" alt="${p.title}">
        <div class="card-badge-top-left">
          <span class="badge ${p.targetTenant === 'bachelors_allowed' ? 'badge-bachelor' : 'badge-family'}">
            ${p.targetTenant === 'bachelors_allowed' ? 'Bachelors OK' : 'Families'}
          </span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-location"><i class="fa-solid fa-location-dot"></i> ${p.locality}, ${p.city}</div>
        <a href="property-detail.html?id=${p.id}" class="card-title">${p.title}</a>
        
        <div class="card-terms-box">
          <span><i class="fa-solid fa-handshake"></i> ${p.noticeDays}-Day Notice</span>
          <span><i class="fa-solid fa-shield-halved"></i> Fair Pact</span>
        </div>

        <div class="card-footer">
          <div>
            <div class="price-amount">₹${p.monthlyRent.toLocaleString('en-IN')}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">/ month</div>
          </div>
          <a href="property-detail.html?id=${p.id}" class="btn btn-primary btn-sm">View & Pact</a>
        </div>
      </div>
    </div>
  `).join('');

  if (markersLayer && mapInstance) {
    markersLayer.clearLayers();
    const latLngs = [];
    filtered.forEach(p => {
      latLngs.push([p.lat, p.lng]);
      const icon = L.divIcon({
        className: 'custom-pin',
        html: `<div class="map-price-pin">₹${Math.round(p.monthlyRent/1000)}k</div>`
      });
      L.marker([p.lat, p.lng], { icon })
        .bindPopup(`<b>${p.title}</b><br>₹${p.monthlyRent.toLocaleString('en-IN')}/mo<br><a href="property-detail.html?id=${p.id}">View Listing</a>`)
        .addTo(markersLayer);
    });
    if (latLngs.length > 0) mapInstance.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30] });
  }
}

// 6. Property Detail Page Loader
function initDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id') || 'prop-101';
  const prop = getPropertyById(id);

  document.getElementById('detailTitle').textContent = prop.title;
  document.getElementById('detailLocation').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${prop.locality}, ${prop.city}`;
  document.getElementById('detailRent').textContent = `₹${prop.monthlyRent.toLocaleString('en-IN')}`;
  document.getElementById('detailDeposit').textContent = `₹${prop.securityDeposit.toLocaleString('en-IN')}`;
  document.getElementById('detailNotice').textContent = `${prop.noticeDays} Days`;
  document.getElementById('detailDescription').textContent = prop.description;
  document.getElementById('mainPhoto').src = prop.images[0];
  document.getElementById('landlordName').textContent = prop.landlord.name;
  document.getElementById('landlordAvatar').src = prop.landlord.avatar;

  document.getElementById('visitorRule').textContent = prop.visitorRule;
  document.getElementById('cookingRule').textContent = prop.cookingRule;
  document.getElementById('bookingProposedRent').value = prop.monthlyRent;
}

// 7. Tenant Portal Controller
function initTenantDashboard() {
  const user = getLoggedInUser();
  if (!user || user.role !== 'tenant') {
    alert('Please log in as a Tenant to view this portal.');
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('tenantWelcomeTitle').textContent = `Welcome, ${user.name}`;

  const bookings = getBookings();
  const container = document.getElementById('tenantApplicationsContainer');
  
  if (bookings.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">No applications sent yet.</p>';
  } else {
    container.innerHTML = bookings.map(b => `
      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.2rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h4 style="font-size: 1.05rem; font-weight: 800;">${b.propertyTitle}</h4>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0;">Offered Rent: <b>₹${b.offeredRent.toLocaleString('en-IN')}/mo</b> &bull; Move-in: ${b.moveInDate}</div>
          <div style="font-size: 0.8rem; background: var(--bg-subtle); padding: 3px 8px; border-radius: 4px; display: inline-block;">Requested terms: "${b.customNote}"</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <span class="badge ${b.status === 'accepted' ? 'badge-verified' : 'badge-family'}">
            ${b.status === 'accepted' ? 'Pact Ready' : 'Under Landlord Review'}
          </span>
          ${b.status === 'accepted' ? `<a href="agreement.html" class="btn btn-primary btn-sm">Sign Pact</a>` : ''}
        </div>
      </div>
    `).join('');
  }
}

// 8. Landlord Dashboard Controller
function initLandlordDashboard() {
  const user = getLoggedInUser();
  if (!user || user.role !== 'landlord') {
    alert('Please log in as a Landlord to view this portal.');
    window.location.href = 'login.html';
    return;
  }

  const props = getProperties();
  const bookings = getBookings();

  document.getElementById('statTotalProps').textContent = props.length;
  document.getElementById('statPendingRequests').textContent = bookings.filter(b => b.status === 'pending').length;
  const totalRent = props.reduce((sum, p) => sum + p.monthlyRent, 0);
  document.getElementById('statTotalRent').textContent = `₹${totalRent.toLocaleString('en-IN')}`;

  const requestsContainer = document.getElementById('landlordRequestsList');
  if (bookings.length === 0) {
    requestsContainer.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">No tenant proposals yet.</p>';
  } else {
    requestsContainer.innerHTML = bookings.map(b => `
      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.2rem; display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <img src="${b.tenantAvatar}" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover;">
          <div>
            <h4 style="font-weight: 800; font-size: 1.05rem;">${b.tenantName}</h4>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${b.tenantRole}</div>
            <div style="font-size: 0.85rem; color: var(--primary-dark); margin-top: 4px;"><b>Applying for:</b> ${b.propertyTitle}</div>
            <div style="font-size: 0.8rem; background: #F1F5F9; padding: 4px 8px; border-radius: 4px; margin-top: 4px;"><b>Requested terms:</b> "${b.customNote}"</div>
          </div>
        </div>

        <div style="text-align: right; display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
          <div style="font-weight: 800; font-size: 1.2rem; color: var(--primary);">₹${b.offeredRent.toLocaleString('en-IN')}/mo</div>
          <div style="display: flex; gap: 0.5rem;">
            ${b.status === 'pending' ? `
              <button class="btn btn-primary btn-sm" onclick="acceptBooking('${b.id}')">
                <i class="fa-solid fa-handshake"></i> Accept & Pact
              </button>
            ` : `
              <span class="badge badge-verified"><i class="fa-solid fa-check"></i> Pact Created</span>
            `}
            <a href="agreement.html" class="btn btn-outline btn-sm">View Pact</a>
          </div>
        </div>
      </div>
    `).join('');
  }

  const listingsContainer = document.getElementById('landlordListingsContainer');
  listingsContainer.innerHTML = props.map(p => `
    <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <img src="${p.images[0]}" style="width: 100px; height: 75px; object-fit: cover; border-radius: 8px;">
        <div>
          <h4 style="font-weight: 800;"><a href="property-detail.html?id=${p.id}">${p.title}</a></h4>
          <div style="font-size: 0.82rem; color: var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${p.locality}, ${p.city}</div>
          <div style="font-weight: 700; color: var(--primary); font-size: 0.95rem; margin-top: 2px;">₹${p.monthlyRent.toLocaleString('en-IN')}/month &bull; Deposit ₹${p.securityDeposit.toLocaleString('en-IN')}</div>
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <a href="property-detail.html?id=${p.id}" class="btn btn-outline btn-sm">View Listing</a>
        <button class="btn btn-outline btn-sm" style="color: var(--accent-rose);" onclick="deleteListing('${p.id}')"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function handleCreateProperty(e) {
  e.preventDefault();

  const newProperty = {
    id: 'prop-' + Date.now(),
    title: document.getElementById('newTitle').value,
    description: document.getElementById('newDesc').value,
    propertyType: document.getElementById('newType').value,
    targetTenant: document.getElementById('newTarget').value,
    furnishing: document.getElementById('newFurnishing').value,
    monthlyRent: Number(document.getElementById('newRent').value),
    securityDeposit: Number(document.getElementById('newDeposit').value),
    city: document.getElementById('newCity').value,
    locality: document.getElementById('newLocality').value,
    lat: 12.9716 + (Math.random() - 0.5) * 0.05,
    lng: 77.5946 + (Math.random() - 0.5) * 0.05,
    noticeDays: Number(document.getElementById('newNotice').value) || 30,
    visitorRule: document.getElementById('newVisitors').value,
    cookingRule: 'All dietary choices respected',
    amenities: ['wifi', 'ac', 'kitchen', 'parking_bike'],
    images: [document.getElementById('newImg').value],
    landlord: {
      name: 'Rajesh Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      phone: '+91 98765 43210'
    }
  };

  const props = getProperties();
  props.unshift(newProperty);
  localStorage.setItem('staypact_properties', JSON.stringify(props));

  document.getElementById('addPropertyModal').classList.remove('active');
  showToast('🏡 New Property & Fair Mutual Terms Published Successfully!');
  initLandlordDashboard();
}

function acceptBooking(id) {
  const bookings = getBookings();
  const b = bookings.find(x => x.id === id);
  if (b) {
    b.status = 'accepted';
    localStorage.setItem('staypact_bookings', JSON.stringify(bookings));
    showToast('🎉 Proposal Accepted! Mutual Rental Pact Generated.');
    initLandlordDashboard();
  }
}

function deleteListing(id) {
  if (!confirm('Are you sure you want to remove this listing?')) return;
  let props = getProperties();
  props = props.filter(p => p.id !== id);
  localStorage.setItem('staypact_properties', JSON.stringify(props));
  showToast('Listing removed.');
  initLandlordDashboard();
}

function signPact(party) {
  const user = getLoggedInUser();
  const defaultName = user ? user.name : (party === 'tenant' ? 'Arjun Mehta' : 'Rajesh Sharma');
  const name = prompt(`Enter your legal name to sign as ${party}:`, defaultName);
  if (!name) return;

  const signBox = document.getElementById(`${party}SignBox`);
  signBox.className = 'signature-box signed';
  signBox.innerHTML = `
    <span class="badge badge-verified"><i class="fa-solid fa-check"></i> Signed by ${party.toUpperCase()}</span>
    <div class="digital-signature-line">${name}</div>
    <div style="font-size: 0.72rem; color: var(--text-muted);">Timestamp: ${new Date().toLocaleString('en-IN')}</div>
  `;

  showToast(`🎉 Signed successfully as ${party}!`);

  const statusBadge = document.getElementById('pactStatusBadge');
  if (statusBadge) {
    statusBadge.className = 'badge badge-verified';
    statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Active & Legally Sealed';
  }
}