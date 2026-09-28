/**
 * StayPact - Digital Mutual Rental Pact Engine & Signing Workflow
 */

let currentPact = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pactId = urlParams.get('id') || 'pact-89421';
  await loadAgreement(pactId);
});

async function loadAgreement(pactId) {
  const res = await API.request(`/agreements/${pactId}`);
  if (!res.data) {
    showToast('Rental agreement not found', 'error');
    return;
  }

  currentPact = res.data;
  renderPactDocument(currentPact);
}

function renderPactDocument(pact) {
  document.getElementById('pactNumberDisplay').textContent = pact.pactNumber || 'PACT-2026-89421';
  document.getElementById('pactStatusBadge').className = `badge ${pact.status === 'active' ? 'badge-verified' : 'badge-family'}`;
  document.getElementById('pactStatusBadge').innerHTML = pact.status === 'active' 
    ? '<i class="fa-solid fa-circle-check"></i> Active & Legally Binding' 
    : '<i class="fa-solid fa-clock"></i> Pending Signatures';

  // Landlord & Tenant Box
  document.getElementById('pactLandlordName').textContent = pact.landlord.name;
  document.getElementById('pactLandlordContact').textContent = `${pact.landlord.phone || '+91 98765 43210'} | ${pact.landlord.email}`;
  
  document.getElementById('pactTenantName').textContent = pact.tenant.name;
  document.getElementById('pactTenantContact').textContent = `${pact.tenant.phone || '+91 99887 76655'} | ${pact.tenant.email} (${pact.tenant.tenantType || 'Bachelor'})`;

  // Property & Rent Terms
  document.getElementById('pactPropertyTitle').textContent = pact.property.title;
  document.getElementById('pactPropertyAddress').textContent = `${pact.property.location.address}, ${pact.property.location.locality}, ${pact.property.location.city}`;
  
  document.getElementById('pactRent').textContent = `₹${pact.terms.monthlyRent.toLocaleString('en-IN')}`;
  document.getElementById('pactDeposit').textContent = `₹${pact.terms.securityDeposit.toLocaleString('en-IN')}`;
  document.getElementById('pactNotice').textContent = `${pact.terms.noticePeriodDays || 30} Days`;
  document.getElementById('pactDueDay').textContent = `${pact.terms.rentDueDay || 5}th of each calendar month`;
  
  const startDateStr = new Date(pact.terms.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const endDateStr = new Date(pact.terms.endDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('pactDuration').textContent = `${pact.terms.durationMonths || 11} Months (${startDateStr} to ${endDateStr})`;

  // Negotiated Clauses
  const clausesList = document.getElementById('pactSpecialClauses');
  if (clausesList) {
    if (pact.terms.specialNegotiatedTerms && pact.terms.specialNegotiatedTerms.length > 0) {
      clausesList.innerHTML = pact.terms.specialNegotiatedTerms.map(c => `
        <li style="margin-bottom: 6px;"><b>Mutual Clause:</b> ${c}</li>
      `).join('');
    } else {
      clausesList.innerHTML = '<li>Standard transparent terms apply with zero hidden brokerages or lock-in penalties.</li>';
    }
  }

  // Signatures State
  renderSignatureState(pact);
}

function renderSignatureState(pact) {
  const landlordBox = document.getElementById('landlordSignBox');
  const tenantBox = document.getElementById('tenantSignBox');
  const user = API.getCurrentUser();

  // Landlord signature box
  if (pact.landlordSignature?.signed) {
    landlordBox.className = 'signature-box signed';
    landlordBox.innerHTML = `
      <span class="badge badge-verified"><i class="fa-solid fa-check"></i> Signed by Landlord</span>
      <div class="digital-signature-line">${pact.landlordSignature.signatureName || pact.landlord.name}</div>
      <div class="timestamp-audit">Timestamp: ${new Date(pact.landlordSignature.signedAt || Date.now()).toLocaleString('en-IN')}</div>
      <div class="timestamp-audit" style="color: #0D9488; font-weight: 700;">StayPact Cryptographic Audit ID #STP-${pact._id.slice(-6)}</div>
    `;
  } else {
    landlordBox.className = 'signature-box';
    landlordBox.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.85rem;">Landlord Signature Pending</p>
      ${user.role === 'landlord' ? `<button class="btn btn-primary btn-sm" onclick="openSigningModal()" style="margin-top: 10px;"><i class="fa-solid fa-pen-nib"></i> Sign as Landlord</button>` : ''}
    `;
  }

  // Tenant signature box
  if (pact.tenantSignature?.signed) {
    tenantBox.className = 'signature-box signed';
    tenantBox.innerHTML = `
      <span class="badge badge-verified"><i class="fa-solid fa-check"></i> Signed by Tenant</span>
      <div class="digital-signature-line">${pact.tenantSignature.signatureName || pact.tenant.name}</div>
      <div class="timestamp-audit">Timestamp: ${new Date(pact.tenantSignature.signedAt || Date.now()).toLocaleString('en-IN')}</div>
      <div class="timestamp-audit" style="color: #0D9488; font-weight: 700;">StayPact Cryptographic Audit ID #STP-${pact._id.slice(-6)}</div>
    `;
  } else {
    tenantBox.className = 'signature-box';
    tenantBox.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.85rem;">Tenant Signature Pending</p>
      ${user.role === 'tenant' ? `<button class="btn btn-primary btn-sm" onclick="openSigningModal()" style="margin-top: 10px;"><i class="fa-solid fa-pen-nib"></i> Sign as Tenant</button>` : ''}
    `;
  }
}

function openSigningModal() {
  const user = API.getCurrentUser();
  const modal = document.getElementById('signingModal');
  if (modal) {
    const input = document.getElementById('signFullNameInput');
    if (input) input.value = user.name || '';
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function closeSigningModal() {
  const modal = document.getElementById('signingModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

async function confirmDigitalSignature(e) {
  e.preventDefault();
  if (!currentPact) return;

  const signName = document.getElementById('signFullNameInput').value.trim();
  const comments = document.getElementById('signCommentsInput').value.trim();

  if (!signName) {
    showToast('Please enter your full legal name to sign', 'error');
    return;
  }

  const btn = document.getElementById('confirmSignBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Securing Signature...';

  const res = await API.request(`/agreements/${currentPact._id}/sign`, {
    method: 'POST',
    body: JSON.stringify({
      signatureName: signName,
      comments: comments || 'Digitally confirmed terms and conditions',
    }),
  });

  btn.disabled = false;
  btn.innerHTML = 'Sign & Commit Pact';

  closeSigningModal();
  showToast('🎉 Digital Mutual Pact signed successfully!', 'success');

  if (res.data) {
    currentPact = res.data;
    renderPactDocument(currentPact);
  }
}

function printAgreement() {
  window.print();
}
