/**
 * StayPact - Explore & Map Split View Controller
 */

let allProperties = [];
let mapInstance = null;
let markersLayer = null;

document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  await loadProperties();
  bindFilterEvents();
  readUrlParams();
});

function initMap() {
  const mapElement = document.getElementById('leafletMap');
  if (!mapElement || typeof L === 'undefined') return;

  // Default centered at Bengaluru
  mapInstance = L.map('leafletMap', {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([12.9716, 77.5946], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors | StayPact',
    maxZoom: 19,
  }).addTo(mapInstance);

  markersLayer = L.layerGroup().addTo(mapInstance);
}

async function loadProperties() {
  const listingsContainer = document.getElementById('listingsContainer');
  if (listingsContainer) {
    listingsContainer.innerHTML = '<div style="text-align: center; padding: 3rem;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--primary);"></i><p style="margin-top: 10px;">Finding verified rental pacts...</p></div>';
  }

  const res = await API.request('/properties');
  allProperties = res.data || [];
  applyFilters();
}

function readUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const city = urlParams.get('city');
  const target = urlParams.get('target');
  const type = urlParams.get('type');
  const search = urlParams.get('search');

  if (city) {
    const citySelect = document.getElementById('filterCity');
    if (citySelect) citySelect.value = city;
  }
  if (target) {
    const targetSelect = document.getElementById('filterTarget');
    if (targetSelect) targetSelect.value = target;
  }
  if (type) {
    const typeSelect = document.getElementById('filterType');
    if (typeSelect) typeSelect.value = type;
  }
  if (search) {
    const searchInput = document.getElementById('filterSearch');
    if (searchInput) searchInput.value = search;
  }

  applyFilters();
}

function bindFilterEvents() {
  const inputs = ['filterCity', 'filterTarget', 'filterType', 'filterSearch', 'filterFurnishing', 'filterSort'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyFilters);
    if (el && id === 'filterSearch') el.addEventListener('input', debounce(applyFilters, 300));
  });

  const rentSlider = document.getElementById('filterRentRange');
  const rentDisplay = document.getElementById('rentRangeDisplay');
  if (rentSlider && rentDisplay) {
    rentSlider.addEventListener('input', (e) => {
      rentDisplay.textContent = `₹${Number(e.target.value).toLocaleString('en-IN')}`;
      applyFilters();
    });
  }

  // Amenity Checkboxes
  const amenityBoxes = document.querySelectorAll('.amenity-filter-cb');
  amenityBoxes.forEach(cb => cb.addEventListener('change', applyFilters));
}

function applyFilters() {
  const city = document.getElementById('filterCity')?.value || 'all';
  const target = document.getElementById('filterTarget')?.value || 'all';
  const type = document.getElementById('filterType')?.value || 'all';
  const search = document.getElementById('filterSearch')?.value.toLowerCase().trim() || '';
  const furnishing = document.getElementById('filterFurnishing')?.value || 'all';
  const maxRent = Number(document.getElementById('filterRentRange')?.value) || 150000;
  const sort = document.getElementById('filterSort')?.value || 'newest';

  // Selected Amenities
  const selectedAmenities = Array.from(document.querySelectorAll('.amenity-filter-cb:checked')).map(cb => cb.value);

  let filtered = allProperties.filter(p => {
    // City filter
    if (city !== 'all' && p.location.city.toLowerCase() !== city.toLowerCase()) return false;

    // Target Tenant filter
    if (target !== 'all') {
      if (target === 'bachelors_allowed' && !['bachelors_allowed', 'anyone'].includes(p.targetTenant)) return false;
      if (target === 'families_only' && !['families_only', 'anyone'].includes(p.targetTenant)) return false;
    }

    // Property Type
    if (type !== 'all' && p.propertyType !== type) return false;

    // Furnishing
    if (furnishing !== 'all' && p.furnishing !== furnishing) return false;

    // Max Rent
    if (p.pricing.monthlyRent > maxRent) return false;

    // Amenities
    if (selectedAmenities.length > 0) {
      const hasAllAmenities = selectedAmenities.every(a => p.amenities.includes(a));
      if (!hasAllAmenities) return false;
    }

    // Keyword Search
    if (search) {
      const matchText = `${p.title} ${p.description} ${p.location.locality} ${p.location.city}`.toLowerCase();
      if (!matchText.includes(search)) return false;
    }

    return true;
  });

  // Sorting
  if (sort === 'price_asc') filtered.sort((a, b) => a.pricing.monthlyRent - b.pricing.monthlyRent);
  if (sort === 'price_desc') filtered.sort((a, b) => b.pricing.monthlyRent - a.pricing.monthlyRent);
  if (sort === 'rating') filtered.sort((a, b) => (b.ratingAverage || 5) - (a.ratingAverage || 5));

  renderListings(filtered);
  updateMapMarkers(filtered);
}

function renderListings(properties) {
  const container = document.getElementById('listingsContainer');
  const countBadge = document.getElementById('resultsCount');
  if (countBadge) countBadge.textContent = `${properties.length} Verified Properties`;

  if (!container) return;

  if (properties.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--border);">
        <i class="fa-solid fa-house-chimney-crack fa-3x" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
        <h3>No rental matches found</h3>
        <p style="color: var(--text-secondary); margin-top: 0.5rem;">Try adjusting your price range or clearing some amenity filters.</p>
        <button class="btn btn-outline btn-sm" onclick="resetFilters()" style="margin-top: 1rem;">Reset All Filters</button>
      </div>
    `;
    return;
  }

  const user = API.getCurrentUser();
  const savedIds = user.savedProperties || [];

  container.innerHTML = properties.map(p => {
    const isSaved = savedIds.includes(p._id);
    const targetBadge = p.targetTenant === 'bachelors_allowed' 
      ? '<span class="badge badge-bachelor"><i class="fa-solid fa-bolt"></i> Bachelors OK</span>'
      : '<span class="badge badge-family"><i class="fa-solid fa-people-roof"></i> Families Only</span>';
    const noticeDays = p.mutualTerms?.noticePeriodDays || 30;

    return `
      <div class="property-card-luxe" id="card-${p._id}">
        <div class="card-media-wrapper">
          <img src="${p.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'}" alt="${p.title}" loading="lazy">
          
          <div class="card-floating-badge">${targetBadge}</div>
          
          <button class="card-floating-save ${isSaved ? 'saved' : ''}" onclick="toggleSave('${p._id}', event)" title="Save Stay">
            <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>

          <div class="card-floating-landlord">
            <img src="${p.landlord.avatar}" alt="${p.landlord.name}" class="landlord-avatar-micro">
            <span>${p.landlord.name.split(' ')[0]}</span>
          </div>
        </div>

        <div class="card-luxe-body">
          <div class="card-locality-row">
            <span><i class="fa-solid fa-location-dot" style="color: var(--primary);"></i> ${p.location.locality}, ${p.location.city}</span>
            <span style="color: #F59E0B;"><i class="fa-solid fa-star"></i> ${p.ratingAverage || 4.9}</span>
          </div>

          <a href="property-detail.html?id=${p._id}" class="card-luxe-title">${p.title}</a>

          <div class="card-pact-terms-strip">
            <span><i class="fa-solid fa-handshake"></i> <b>${noticeDays}-Day Exit</b></span>
            <span><i class="fa-solid fa-shield-halved"></i> Escrow Protected</span>
          </div>

          <div class="card-luxe-footer">
            <div class="card-price-block">
              <span class="card-price-val">₹${p.pricing.monthlyRent.toLocaleString('en-IN')}</span>
              <span class="card-price-sub">/ month • deposit ₹${p.pricing.securityDeposit.toLocaleString('en-IN')}</span>
            </div>
            <a href="property-detail.html?id=${p._id}" class="btn btn-primary btn-sm">
              Inspect & Pact
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateMapMarkers(properties) {
  if (!mapInstance || !markersLayer) return;
  markersLayer.clearLayers();

  if (properties.length === 0) return;

  const latLngs = [];

  properties.forEach(p => {
    if (!p.location.lat || !p.location.lng) return;

    const latLng = [p.location.lat, p.location.lng];
    latLngs.push(latLng);

    const priceLabel = p.pricing.monthlyRent >= 1000
      ? `₹${Math.round(p.pricing.monthlyRent / 1000)}k`
      : `₹${p.pricing.monthlyRent}`;

    const customIcon = L.divIcon({
      className: 'map-custom-marker-wrapper',
      html: `<div class="map-price-pin" id="marker-${p._id}"><i class="fa-solid fa-house" style="font-size: 0.75rem;"></i> ${priceLabel}</div>`,
      iconSize: [60, 30],
      iconAnchor: [30, 15],
    });

    const marker = L.marker(latLng, { icon: customIcon });

    const popupHtml = `
      <div style="width: 220px; font-family: inherit;">
        <img src="${p.images[0]}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;">
        <div style="font-weight: 700; font-size: 0.95rem; line-height: 1.2;">${p.title}</div>
        <div style="color: #0D9488; font-weight: 800; font-size: 1.05rem; margin-top: 4px;">₹${p.pricing.monthlyRent.toLocaleString('en-IN')}/mo</div>
        <a href="property-detail.html?id=${p._id}" class="btn btn-primary btn-sm" style="width: 100%; margin-top: 6px; padding: 4px; font-size: 0.8rem; display: block; text-align: center;">View Details</a>
      </div>
    `;

    marker.bindPopup(popupHtml);
    markersLayer.addLayer(marker);
  });

  if (latLngs.length > 0) {
    mapInstance.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40], maxZoom: 14 });
  }
}

function getTargetTenantBadge(target) {
  if (target === 'bachelors_allowed') {
    return `<span class="badge badge-bachelor"><i class="fa-solid fa-user-group"></i> Bachelors OK</span>`;
  }
  if (target === 'families_only') {
    return `<span class="badge badge-family"><i class="fa-solid fa-people-roof"></i> Families Only</span>`;
  }
  return `<span class="badge badge-anyone"><i class="fa-solid fa-users"></i> All Tenants</span>`;
}

function formatAmenity(key) {
  const map = {
    wifi: 'High Speed WiFi',
    ac: 'Air Conditioner',
    kitchen: 'Modular Kitchen',
    parking_bike: 'Bike Parking',
    parking_car: 'Car Parking',
    washing_machine: 'Washing Machine',
    refrigerator: 'Fridge',
    power_backup: 'Power Backup',
    security_guard: '24/7 Security',
    lift: 'Elevator',
    balcony: 'Balcony',
    gym: 'Fitness Gym',
  };
  return map[key] || key;
}

function toggleSave(propertyId, event) {
  event.preventDefault();
  event.stopPropagation();

  const user = API.getCurrentUser();
  user.savedProperties = user.savedProperties || [];
  const idx = user.savedProperties.indexOf(propertyId);

  if (idx > -1) {
    user.savedProperties.splice(idx, 1);
    showToast('Removed from saved wishlist');
  } else {
    user.savedProperties.push(propertyId);
    showToast('Saved to wishlist!', 'success');
  }

  localStorage.setItem('staypact_user', JSON.stringify(user));
  applyFilters();
}

function resetFilters() {
  document.getElementById('filterCity').value = 'all';
  document.getElementById('filterTarget').value = 'all';
  document.getElementById('filterType').value = 'all';
  document.getElementById('filterFurnishing').value = 'all';
  document.getElementById('filterSearch').value = '';
  document.getElementById('filterRentRange').value = 100000;
  document.getElementById('rentRangeDisplay').textContent = '₹1,00,000';
  document.querySelectorAll('.amenity-filter-cb').forEach(cb => cb.checked = false);
  applyFilters();
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
