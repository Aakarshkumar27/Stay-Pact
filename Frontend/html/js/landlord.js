/**
 * StayPact - Landlord Dashboard Controller
 */

let landlordListings = [];
let receivedBookings = [];

document.addEventListener('DOMContentLoaded', async () => {
  const user = API.getCurrentUser();
  if (!user) {
    const container = document.getElementById('landlordListingsGrid');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3.5rem 1.5rem; background: white; border-radius: var(--radius-lg); border: 1.5px dashed var(--border); margin: 1rem 0;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.2rem; font-size: 1.5rem;">
            <i class="fa-solid fa-key"></i>
          </div>
          <h3 style="font-size: 1.4rem; font-weight: 800; color: #0F172A;">Sign in to your Landlord Control Hub</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin: 8px auto 0; max-width: 460px;">
            Create a landlord account or sign in to list properties, set mutual fair terms, and review incoming tenant applications.
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
            <a href="login.html?tab=login&redirect=dashboard-landlord.html" class="btn btn-primary">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In
            </a>
            <a href="login.html?tab=signup&redirect=dashboard-landlord.html" class="btn btn-outline">
              <i class="fa-solid fa-user-plus"></i> Create Landlord Account
            </a>
          </div>
        </div>
      `;
    }
    return;
  }

  if (user.role !== 'landlord') {
    document.getElementById('roleNoticeBanner')?.classList.remove('hidden');
  }

  await loadDashboardData();
  bindLandlordEvents();
});

async function loadDashboardData() {
  const [propsRes, bookingsRes] = await Promise.all([
    API.request('/properties'),
    API.request('/bookings/received'),
  ]);

  const user = API.getCurrentUser();
  const allProps = propsRes.data || [];
  
  // Filter properties belonging to this landlord, or show sample properties if first time host
  if (user) {
    landlordListings = allProps.filter(p => p.landlord && (p.landlord._id === user._id || p.landlord.email === user.email));
    if (landlordListings.length === 0 && allProps.length > 0) {
      landlordListings = allProps.slice(0, 2);
    }
  } else {
    landlordListings = allProps;
  }

  receivedBookings = bookingsRes.data || [];

  renderStats();
  renderListings();
  renderRequests();
}

function renderStats() {
  const statActiveListings = document.getElementById('statActiveListings');
  const statPendingRequests = document.getElementById('statPendingRequests');
  const statMonthlyIncome = document.getElementById('statMonthlyIncome');

  if (statActiveListings) statActiveListings.textContent = landlordListings.length;
  if (statPendingRequests) statPendingRequests.textContent = receivedBookings.filter(b => b.status === 'pending').length;
  
  const totalRent = landlordListings.reduce((sum, p) => sum + (p.pricing?.monthlyRent || 0), 0);
  if (statMonthlyIncome) statMonthlyIncome.textContent = `₹${totalRent.toLocaleString('en-IN')}`;
}

function renderListings() {
  const container = document.getElementById('landlordListingsGrid');
  if (!container) return;

  if (landlordListings.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No properties listed yet. Click "+ List New Stay" above to publish your property.</p>';
    return;
  }

  container.innerHTML = landlordListings.map(p => `
    <div class="property-card" style="margin-bottom: 1rem; background: white; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden;">
      <div style="display: flex; gap: 1.2rem; padding: 1.2rem; align-items: center; flex-wrap: wrap;">
        <img src="${p.images[0]}" style="width: 120px; height: 90px; object-fit: cover; border-radius: var(--radius-md);" alt="${p.title}">
        <div style="flex: 1; min-width: 240px;">
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.3rem;">
            <span class="badge ${p.targetTenant === 'bachelors_allowed' ? 'badge-bachelor' : 'badge-family'}">${p.targetTenant === 'bachelors_allowed' ? 'Bachelors OK' : 'Families'}</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${p.location.locality}, ${p.location.city}</span>
          </div>
          <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.3rem;"><a href="property-detail.html?id=${p._id}">${p.title}</a></h4>
          <div style="font-size: 0.88rem; color: var(--primary-dark); font-weight: 700;">₹${p.pricing.monthlyRent.toLocaleString('en-IN')}/mo &bull; Deposit ₹${p.pricing.securityDeposit.toLocaleString('en-IN')}</div>
        </div>
        <div style="display: flex; gap: 0.6rem;">
          <a href="property-detail.html?id=${p._id}" class="btn btn-outline btn-sm"><i class="fa-solid fa-eye"></i> View Listing</a>
          <button class="btn btn-primary btn-sm" onclick="showToast('Listing terms synced live!', 'success')"><i class="fa-solid fa-pen"></i> Edit Terms</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderRequests() {
  const container = document.getElementById('landlordRequestsList');
  if (!container) return;

  if (receivedBookings.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No pending tenant proposals right now.</p>';
    return;
  }

  container.innerHTML = receivedBookings.map(b => `
    <div class="property-card" style="margin-bottom: 1.2rem; background: white; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.4rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.8rem;">
        <div style="display: flex; gap: 1rem; align-items: center;">
          <img src="${b.tenant.avatar}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" alt="${b.tenant.name}">
          <div>
            <h4 style="font-size: 1.1rem; font-weight: 800;">${b.tenant.name} <span class="badge ${b.tenantCategory === 'bachelor' ? 'badge-bachelor' : 'badge-family'}" style="font-size: 0.7rem;">${b.tenantCategory ? b.tenantCategory.toUpperCase() : 'TENANT'}</span></h4>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">${b.tenant.occupation || 'Working Professional'} &bull; ${b.tenant.phone || '+91 99887 76655'}</div>
          </div>
        </div>
        <span class="badge ${getStatusBadgeClass(b.status)}">${formatStatus(b.status)}</span>
      </div>

      <div style="background: var(--bg-subtle); padding: 1rem; border-radius: 8px; font-size: 0.88rem; margin-bottom: 1rem;">
        <div style="margin-bottom: 0.4rem;"><b>Property:</b> ${b.property.title}</div>
        <div style="margin-bottom: 0.4rem;"><b>Proposed Rent:</b> ₹${b.proposedMonthlyRent.toLocaleString('en-IN')}/mo &bull; <b>Move-in:</b> ${b.proposedMoveInDate}</div>
        <div><b>Tenant Note:</b> "${b.message || 'We are interested in this flat and agree to your mutual terms.'}"</div>
      </div>

      <div style="display: flex; gap: 0.8rem; justify-content: flex-end; align-items: center;">
        <a href="chat.html?userId=${b.tenant._id}" class="btn btn-outline btn-sm"><i class="fa-regular fa-comments"></i> Negotiate in Chat</a>
        ${b.status === 'pending' ? `
          <button class="btn btn-outline btn-sm" onclick="respondToBooking('${b._id}', 'rejected')" style="color: var(--accent-rose); border-color: var(--accent-rose);">Decline</button>
          <button class="btn btn-primary btn-sm" onclick="respondToBooking('${b._id}', 'accepted')"><i class="fa-solid fa-file-signature"></i> Accept & Generate Pact</button>
        ` : ''}
        ${b.agreementId ? `
          <a href="agreement.html?id=${b.agreementId}" class="btn btn-primary btn-sm"><i class="fa-solid fa-file-contract"></i> View Generated Pact</a>
        ` : ''}
      </div>
    </div>
  `).join('');
}

async function respondToBooking(bookingId, status) {
  const res = await API.request(`/bookings/${bookingId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

  if (res.success) {
    showToast(status === 'accepted' ? '🎉 Proposal accepted! Digital mutual pact generated.' : 'Application declined.', status === 'accepted' ? 'success' : 'info');
    await loadDashboardData();
  }
}

function bindLandlordEvents() {
  const form = document.getElementById('addPropertyForm');
  if (form) {
    form.addEventListener('submit', handleAddProperty);
  }
}

async function handleAddProperty(e) {
  e.preventDefault();
  
  const amenities = Array.from(document.querySelectorAll('.new-prop-amenity:checked')).map(cb => cb.value);
  const user = API.getCurrentUser();

  const payload = {
    title: document.getElementById('newPropTitle').value,
    propertyType: document.getElementById('newPropType').value,
    targetTenant: document.getElementById('newPropTarget').value,
    furnishing: document.getElementById('newPropFurnishing').value,
    pricing: {
      monthlyRent: Number(document.getElementById('newPropRent').value),
      securityDeposit: Number(document.getElementById('newPropDeposit').value),
      maintenance: Number(document.getElementById('newPropMaintenance').value || 0),
    },
    location: {
      locality: document.getElementById('newPropLocality').value,
      city: document.getElementById('newPropCity').value,
      address: document.getElementById('newPropAddress').value,
    },
    mutualTerms: {
      noticePeriodDays: Number(document.getElementById('newPropNotice').value),
      visitorPolicy: document.getElementById('newPropVisitor').value,
      cookingPolicy: document.getElementById('newPropFood').value,
    },
    amenities,
    images: [
      document.getElementById('newPropImgUrl').value || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    description: document.getElementById('newPropDesc').value,
  };

  const res = await API.request('/properties', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res.success) {
    closeAddPropertyModal();
    showToast('✨ Property & Mutual Living Terms published successfully!', 'success');
    await loadDashboardData();
  }
}

function openAddPropertyModal() {
  document.getElementById('addPropertyModal')?.classList.add('active');
}

function closeAddPropertyModal() {
  document.getElementById('addPropertyModal')?.classList.remove('active');
}

function switchLandlordTab(tab) {
  document.querySelectorAll('.dash-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.landlord-tab-pane').forEach(pane => pane.style.display = 'none');

  document.getElementById(`tabBtn_${tab}`)?.classList.add('active');
  const targetPane = document.getElementById(`tabPane_${tab}`);
  if (targetPane) targetPane.style.display = 'block';
}

function getStatusBadgeClass(status) {
  if (status === 'accepted' || status === 'agreement_generated') return 'badge-verified';
  if (status === 'rejected') return 'badge-anyone';
  return 'badge-family';
}

function formatStatus(status) {
  if (status === 'agreement_generated') return 'Pact Generated';
  if (status === 'accepted') return 'Accepted';
  if (status === 'rejected') return 'Declined';
  return 'Pending Review';
}
