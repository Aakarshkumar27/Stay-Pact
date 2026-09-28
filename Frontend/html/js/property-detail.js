/**
 * StayPact - Property Detail & Mutual Terms Controller
 */

let currentProperty = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const propId = urlParams.get('id') || 'prop-101';
  await loadPropertyDetails(propId);
});

async function loadPropertyDetails(propId) {
  const res = await API.request(`/properties/${propId}`);
  if (!res.data) {
    showToast('Property listing not found', 'error');
    return;
  }

  currentProperty = res.data;
  renderProperty(currentProperty);
}

function renderProperty(prop) {
  // Breadcrumbs & Title
  document.getElementById('breadcrumbTitle').textContent = prop.title;
  document.getElementById('propertyTitle').textContent = prop.title;
  document.getElementById('propertyLocation').innerHTML = `<i class="fa-solid fa-location-dot" style="color: var(--primary);"></i> ${prop.location.address}, ${prop.location.locality}, ${prop.location.city}`;
  
  document.getElementById('targetTenantBadge').innerHTML = getTargetTenantBadge(prop.targetTenant);
  document.getElementById('propTypeBadge').textContent = formatPropertyType(prop.propertyType);
  document.getElementById('furnishBadge').textContent = formatFurnishing(prop.furnishing);

  // Pricing Block
  document.getElementById('monthlyRentDisplay').textContent = `₹${prop.pricing.monthlyRent.toLocaleString('en-IN')}`;
  document.getElementById('securityDepositDisplay').textContent = `₹${prop.pricing.securityDeposit.toLocaleString('en-IN')}`;
  document.getElementById('maintenanceDisplay').textContent = prop.pricing.maintenance > 0 ? `₹${prop.pricing.maintenance.toLocaleString('en-IN')}` : 'Included';
  
  if (document.getElementById('electricityRule')) {
    document.getElementById('electricityRule').textContent = prop.pricing.electricityBillRule || 'As per meter reading';
  }

  // Pre-fill proposed rent in booking modal
  if (document.getElementById('bookingProposedRent')) {
    document.getElementById('bookingProposedRent').value = prop.pricing.monthlyRent;
  }

  // Gallery
  renderGallery(prop.images);

  // Amenities
  renderAmenities(prop.amenities);

  // Mutual Terms
  renderMutualTerms(prop.mutualTerms);

  // Host Info
  renderHostCard(prop.landlord);

  // Description
  document.getElementById('propertyDescription').textContent = prop.description;
}

function renderGallery(images) {
  const mainImg = document.getElementById('mainGalleryImg');
  const thumbsContainer = document.getElementById('galleryThumbs');

  if (images && images.length > 0) {
    mainImg.src = images[0];
    thumbsContainer.innerHTML = images.map((img, idx) => `
      <img src="${img}" class="gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="switchGalleryImg('${img}', this)" alt="Property photo ${idx + 1}">
    `).join('');
  }
}

function switchGalleryImg(src, thumbElement) {
  document.getElementById('mainGalleryImg').src = src;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  thumbElement.classList.add('active');
}

function renderAmenities(amenities) {
  const container = document.getElementById('amenitiesList');
  if (!container) return;

  container.innerHTML = amenities.map(a => `
    <div class="amenity-item" style="display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.8rem; background: var(--bg-subtle); border-radius: 8px;">
      <i class="fa-solid fa-circle-check" style="color: var(--primary);"></i>
      <span style="font-weight: 600; font-size: 0.9rem;">${formatAmenity(a)}</span>
    </div>
  `).join('');
}

function renderMutualTerms(terms) {
  const container = document.getElementById('mutualTermsList');
  if (!container || !terms) return;

  container.innerHTML = `
    <div class="term-row" style="display: flex; gap: 1rem; margin-bottom: 0.9rem; align-items: flex-start;">
      <div style="width: 32px; height: 32px; border-radius: 50%; background: #CCFBF1; color: #0D9488; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fa-solid fa-calendar-check"></i></div>
      <div>
        <h4 style="font-size: 0.95rem; font-weight: 700;">Notice Period & Exit: ${terms.noticePeriodDays} Days</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">Tenant or landlord may terminate lease with a ${terms.noticePeriodDays}-day formal notice without penalty.</p>
      </div>
    </div>

    <div class="term-row" style="display: flex; gap: 1rem; margin-bottom: 0.9rem; align-items: flex-start;">
      <div style="width: 32px; height: 32px; border-radius: 50%; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fa-solid fa-users"></i></div>
      <div>
        <h4 style="font-size: 0.95rem; font-weight: 700;">Visitor & Guest Policy</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">${terms.visitorPolicy || 'Friends & family allowed respectfully.'}</p>
      </div>
    </div>

    <div class="term-row" style="display: flex; gap: 1rem; margin-bottom: 0.9rem; align-items: flex-start;">
      <div style="width: 32px; height: 32px; border-radius: 50%; background: #FEF3C7; color: #B45309; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fa-solid fa-utensils"></i></div>
      <div>
        <h4 style="font-size: 0.95rem; font-weight: 700;">Cooking & Diet Policy</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">${terms.cookingPolicy || 'All dietary preparations welcome.'}</p>
      </div>
    </div>

    <div class="term-row" style="display: flex; gap: 1rem; margin-bottom: 0.9rem; align-items: flex-start;">
      <div style="width: 32px; height: 32px; border-radius: 50%; background: #DCFCE7; color: #166534; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fa-solid fa-paw"></i></div>
      <div>
        <h4 style="font-size: 0.95rem; font-weight: 700;">Pet Friendly Status</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">${terms.petPolicy || 'Mutual agreement applies.'}</p>
      </div>
    </div>
  `;

  // Custom clauses
  const customClausesContainer = document.getElementById('customClauses');
  if (customClausesContainer && terms.customClauses && terms.customClauses.length > 0) {
    customClausesContainer.innerHTML = `
      <div style="margin-top: 1rem; padding: 1rem; background: #F8FAFC; border: 1px dashed var(--border); border-radius: var(--radius-md);">
        <h5 style="font-weight: 700; margin-bottom: 0.5rem;"><i class="fa-solid fa-feather"></i> Landlord's Custom Assurances</h5>
        <ul style="padding-left: 1.2rem; font-size: 0.85rem; color: var(--text-secondary);">
          ${terms.customClauses.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    `;
  }
}

function renderHostCard(landlord) {
  if (!landlord) return;
  const nameEl = document.getElementById('landlordName');
  const occEl = document.getElementById('landlordOccupation');
  const avEl = document.getElementById('landlordAvatar');
  if (nameEl) nameEl.textContent = landlord.name;
  if (occEl) occEl.textContent = landlord.occupation || 'Verified Host';
  if (avEl) avEl.src = landlord.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';
}

function openBookingModal() {
  const user = API.getCurrentUser();
  if (!user) {
    showToast('Please sign in or create an account to send a rental proposal.', 'error');
    setTimeout(() => {
      window.location.href = `login.html?tab=signup&redirect=${encodeURIComponent(window.location.href)}`;
    }, 1000);
    return;
  }

  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateInput = document.getElementById('bookingStartDate');
    if (dateInput) dateInput.value = nextWeek;
  }
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

async function submitBookingRequest(e) {
  e.preventDefault();
  if (!currentProperty) return;

  const user = API.getCurrentUser();
  if (!user) {
    showToast('Please sign in or create an account first.', 'error');
    window.location.href = `login.html?tab=signup&redirect=${encodeURIComponent(window.location.href)}`;
    return;
  }

  const startDate = document.getElementById('bookingStartDate').value;
  const duration = Number(document.getElementById('bookingDuration').value);
  const tenantCategory = document.getElementById('bookingTenantCategory').value;
  const occupants = Number(document.getElementById('bookingOccupants').value);
  const proposedRent = Number(document.getElementById('bookingProposedRent').value);
  const message = document.getElementById('bookingMessage').value;
  const customNote = document.getElementById('bookingCustomTerm').value;

  const customTermsRequested = customNote ? [customNote] : [];

  const payload = {
    propertyId: currentProperty._id,
    proposedStartDate: startDate,
    durationMonths: duration,
    tenantCategory,
    occupantCount: occupants,
    proposedMonthlyRent: proposedRent,
    message,
    customTermsRequested,
  };

  const btn = document.getElementById('submitBookingBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting Pact Request...';

  const res = await API.request('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  btn.disabled = false;
  btn.innerHTML = 'Send Mutual Pact Proposal';

  closeBookingModal();
  showToast('🎉 Booking & Mutual Terms Request Sent to Landlord!', 'success');

  setTimeout(() => {
    window.location.href = 'dashboard-tenant.html';
  }, 1200);
}

function openChatWithHost() {
  const user = API.getCurrentUser();
  if (!user) {
    showToast('Please sign in or create an account to chat with the host.', 'error');
    setTimeout(() => {
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
    }, 1000);
    return;
  }
  if (!currentProperty || !currentProperty.landlord) return;
  window.location.href = `chat.html?userId=${currentProperty.landlord._id}&propId=${currentProperty._id}`;
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

function formatPropertyType(t) {
  const map = {
    single_room: 'Private Single Room',
    shared_room: 'Shared Room in Coliving',
    '1bhk': '1 BHK Independent Flat',
    '2bhk': '2 BHK Apartment',
    '3bhk': '3 BHK Luxury Apartment',
    studio: 'Studio Apartment',
    villa: 'Independent Villa',
  };
  return map[t] || t;
}

function formatFurnishing(f) {
  const map = {
    fully_furnished: 'Fully Furnished (Turnkey)',
    semi_furnished: 'Semi Furnished',
    unfurnished: 'Unfurnished',
  };
  return map[f] || f;
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
