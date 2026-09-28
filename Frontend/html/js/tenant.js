/**
 * StayPact - Tenant Dashboard Controller
 */

let myBookings = [];
let myAgreements = [];
let savedProperties = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadTenantData();
});

async function loadTenantData() {
  const user = API.getCurrentUser();
  if (!user) {
    const container = document.getElementById('tenantAgreementsList');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3.5rem 1.5rem; background: white; border-radius: var(--radius-lg); border: 1.5px dashed var(--border); margin: 1rem 0;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.2rem; font-size: 1.5rem;">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h3 style="font-size: 1.4rem; font-weight: 800; color: #0F172A;">Sign in to view your Tenant Portal</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin: 8px auto 0; max-width: 460px;">
            Create a free tenant account or sign in to track your rental applications, manage digital agreements, and chat with landlords.
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
            <a href="login.html?tab=login&redirect=dashboard-tenant.html" class="btn btn-primary">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In
            </a>
            <a href="login.html?tab=signup&redirect=dashboard-tenant.html" class="btn btn-outline">
              <i class="fa-solid fa-user-plus"></i> Create Tenant Account
            </a>
          </div>
        </div>
      `;
    }
    return;
  }

  const [bookingsRes, agreementsRes, propsRes] = await Promise.all([
    API.request('/bookings/my'),
    API.request('/agreements/my'),
    API.request('/properties'),
  ]);

  myBookings = bookingsRes.data || [];
  myAgreements = agreementsRes.data || [];
  
  const allProps = propsRes.data || [];
  const savedIds = user.savedProperties || [];
  savedProperties = allProps.filter(p => savedIds.includes(p._id));

  renderTenantStats();
  renderAgreements();
  renderApplications();
  renderWishlist();
}

function renderTenantStats() {
  const statActivePacts = document.getElementById('statActivePacts');
  const statActiveBookings = document.getElementById('statActiveBookings');
  const statSavedProps = document.getElementById('statSavedProps');

  if (statActivePacts) statActivePacts.textContent = myAgreements.filter(a => a.status === 'active').length;
  if (statActiveBookings) statActiveBookings.textContent = myBookings.length;
  if (statSavedProps) statSavedProps.textContent = savedProperties.length;
}

function renderAgreements() {
  const container = document.getElementById('tenantAgreementsList');
  if (!container) return;

  if (myAgreements.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--border);">
        <i class="fa-solid fa-file-contract fa-2x" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
        <h4>No signed mutual pacts yet</h4>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">Once your booking request is accepted by the landlord, your digital pact will appear here for review and signature.</p>
        <a href="explore.html" class="btn btn-primary btn-sm" style="margin-top: 1.2rem;">
          <i class="fa-solid fa-compass"></i> Explore Verified Stays
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = myAgreements.map(a => `
    <div class="property-card" style="margin-bottom: 1.2rem; border-left: 4px solid var(--primary); background: white; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden;">
      <div style="padding: 1.5rem; display: grid; grid-template-columns: 120px 1.5fr 1fr auto; gap: 1.5rem; align-items: center;">
        <img src="${a.property.images[0]}" style="width: 120px; height: 90px; object-fit: cover; border-radius: var(--radius-md);" alt="${a.property.title}">
        
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.3rem;">
            <span class="pact-number-tag" style="margin: 0; font-family: monospace; background: var(--bg-subtle); padding: 2px 6px; border-radius: 4px; font-weight: 700;">${a.pactNumber}</span>
            <span class="badge ${a.status === 'active' ? 'badge-verified' : 'badge-family'}">${a.status === 'active' ? 'Active & Signed' : 'Signatures Pending'}</span>
          </div>
          <h4 style="font-size: 1.1rem; font-weight: 700;"><a href="property-detail.html?id=${a.property._id}">${a.property.title}</a></h4>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
            <span><i class="fa-solid fa-user-shield"></i> Landlord: ${a.landlord.name}</span> &bull; 
            <span><i class="fa-solid fa-phone"></i> ${a.landlord.phone || '+91 98765 43210'}</span>
          </div>
        </div>

        <div>
          <div style="font-weight: 800; font-size: 1.2rem; color: var(--text-primary);">₹${a.terms.monthlyRent.toLocaleString('en-IN')}/mo</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Deposit ₹${a.terms.securityDeposit.toLocaleString('en-IN')} &bull; ${a.terms.noticePeriodDays}d Notice</div>
          <div style="font-size: 0.78rem; color: var(--primary-dark); font-weight: 600; margin-top: 4px;"><i class="fa-solid fa-calendar-check"></i> Next Due: 5th of month</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <a href="agreement.html?id=${a._id}" class="btn btn-primary btn-sm">
            <i class="fa-solid fa-file-signature"></i> View Pact
          </a>
          <a href="chat.html?userId=${a.landlord._id}" class="btn btn-outline btn-sm">
            <i class="fa-regular fa-comments"></i> Chat Host
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

function renderApplications() {
  const container = document.getElementById('tenantBookingsList');
  if (!container) return;

  if (myBookings.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No pending rental applications.</p>';
    return;
  }

  container.innerHTML = myBookings.map(b => `
    <div class="property-card" style="margin-bottom: 1rem; background: white; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.2rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem;">
        <div>
          <h4 style="font-size: 1.1rem; font-weight: 700;"><a href="property-detail.html?id=${b.property._id}">${b.property.title}</a></h4>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Host: ${b.landlord.name} &bull; Requested move-in: ${b.proposedMoveInDate}</div>
        </div>
        <span class="badge ${getStatusBadgeClass(b.status)}">${formatStatus(b.status)}</span>
      </div>

      <div style="background: var(--bg-subtle); padding: 0.8rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 0.8rem;">
        <b>Proposed Rent:</b> ₹${b.proposedMonthlyRent.toLocaleString('en-IN')}/mo &bull; <b>Note:</b> ${b.message || 'No special message.'}
      </div>

      <div style="display: flex; gap: 0.6rem; justify-content: flex-end;">
        ${b.agreementId ? `<a href="agreement.html?id=${b.agreementId}" class="btn btn-primary btn-sm"><i class="fa-solid fa-file-signature"></i> Sign Agreement</a>` : ''}
        <a href="chat.html?userId=${b.landlord._id}" class="btn btn-outline btn-sm"><i class="fa-regular fa-comments"></i> Message Landlord</a>
      </div>
    </div>
  `).join('');
}

function renderWishlist() {
  const container = document.getElementById('tenantWishlistGrid');
  if (!container) return;

  if (savedProperties.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem; grid-column: 1/-1;">You haven\'t saved any properties yet. Browse stays and click the heart icon to save.</p>';
    return;
  }

  container.innerHTML = savedProperties.map(p => `
    <div class="property-card" style="background: white; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden;">
      <img src="${p.images[0]}" style="width: 100%; height: 160px; object-fit: cover;" alt="${p.title}">
      <div style="padding: 1rem;">
        <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 4px;"><a href="property-detail.html?id=${p._id}">${p.title}</a></h4>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">${p.location.locality}, ${p.location.city}</div>
        <div style="font-weight: 800; color: var(--primary-dark); font-size: 1.1rem; margin-bottom: 12px;">₹${p.pricing.monthlyRent.toLocaleString('en-IN')}/mo</div>
        <a href="property-detail.html?id=${p._id}" class="btn btn-primary btn-sm" style="width: 100%; justify-content: center;">View & Propose Pact</a>
      </div>
    </div>
  `).join('');
}

function switchTenantTab(tab) {
  document.querySelectorAll('.dash-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tenant-tab-pane').forEach(pane => pane.style.display = 'none');

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
  if (status === 'agreement_generated') return 'Agreement Ready for Signing';
  if (status === 'accepted') return 'Proposal Accepted';
  if (status === 'rejected') return 'Declined';
  return 'Awaiting Landlord Review';
}
