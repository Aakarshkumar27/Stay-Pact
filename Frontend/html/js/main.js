/**
 * StayPact - Main UI Helper & Navigation Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarAuth();
  initMobileMenu();
});

function initNavbarAuth() {
  const user = API.getCurrentUser();
  const navActions = document.getElementById('navActions');
  if (!navActions) return;

  if (user && user.name) {
    const isLandlord = user.role === 'landlord';
    const dashboardLink = isLandlord ? 'dashboard-landlord.html' : 'dashboard-tenant.html';
    const roleLabel = isLandlord ? 'Landlord' : (user.tenantType ? user.tenantType.toUpperCase() : 'TENANT');
    const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D9488&color=ffffff&bold=true`;

    navActions.innerHTML = `
      <a href="${dashboardLink}" class="btn btn-outline btn-sm">
        <i class="fa-solid fa-gauge"></i> Dashboard
      </a>
      <a href="chat.html" class="btn btn-outline btn-sm" title="Messages">
        <i class="fa-regular fa-comments"></i>
      </a>
      <div class="user-dropdown-container" style="position: relative;">
        <button class="user-menu-btn" onclick="toggleUserDropdown()" style="display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid var(--border); padding: 0.3rem 0.7rem; border-radius: var(--radius-full); cursor: pointer;">
          <img src="${avatar}" alt="${user.name}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">
          <div style="text-align: left; line-height: 1.1;">
            <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-primary);">${user.name.split(' ')[0]}</div>
            <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">${roleLabel}</div>
          </div>
          <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem; color: var(--text-muted);"></i>
        </button>

        <div id="userDropdownMenu" class="user-dropdown-menu" style="display: none; position: absolute; right: 0; top: 110%; background: white; border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); width: 200px; padding: 0.5rem; z-index: 200;">
          <a href="${dashboardLink}" style="display: block; padding: 0.6rem 0.8rem; border-radius: 6px; font-weight: 600; font-size: 0.88rem; color: var(--text-primary);"><i class="fa-solid fa-house-user" style="margin-right: 8px;"></i> My Portal</a>
          <a href="agreement.html" style="display: block; padding: 0.6rem 0.8rem; border-radius: 6px; font-weight: 600; font-size: 0.88rem; color: var(--text-primary);"><i class="fa-solid fa-file-contract" style="margin-right: 8px;"></i> Digital Pacts</a>
          <a href="chat.html" style="display: block; padding: 0.6rem 0.8rem; border-radius: 6px; font-weight: 600; font-size: 0.88rem; color: var(--text-primary);"><i class="fa-regular fa-comments" style="margin-right: 8px;"></i> Inquiries & Chat</a>
          <hr style="margin: 0.4rem 0; border: 0; border-top: 1px solid var(--border);">
          <button onclick="API.logout()" style="width: 100%; text-align: left; padding: 0.6rem 0.8rem; border-radius: 6px; font-weight: 600; font-size: 0.88rem; color: var(--accent-rose); background: none; border: none; cursor: pointer;"><i class="fa-solid fa-arrow-right-from-bracket" style="margin-right: 8px;"></i> Log Out</button>
        </div>
      </div>
    `;
  } else {
    navActions.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Log In</a>
      <a href="login.html?tab=signup" class="btn btn-primary btn-sm">Sign Up</a>
    `;
  }
}

function toggleUserDropdown() {
  const menu = document.getElementById('userDropdownMenu');
  if (menu) {
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.querySelector('.user-dropdown-container');
  const menu = document.getElementById('userDropdownMenu');
  if (dropdown && menu && !dropdown.contains(e.target)) {
    menu.style.display = 'none';
  }
});

function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
    });
  }
}

// Global Toast Notification Helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '24px';
    container.style.right = '24px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.background = type === 'success' ? '#0F172A' : '#BE123C';
  toast.style.color = 'white';
  toast.style.padding = '12px 18px';
  toast.style.borderRadius = '10px';
  toast.style.fontSize = '0.9rem';
  toast.style.fontWeight = '600';
  toast.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '10px';
  toast.style.transition = 'all 0.3s ease';
  toast.style.transform = 'translateY(10px)';
  toast.style.opacity = '0';

  const icon = type === 'success' ? '<i class="fa-solid fa-circle-check" style="color: #2DD4BF;"></i>' : '<i class="fa-solid fa-circle-exclamation" style="color: #FDA4AF;"></i>';
  toast.innerHTML = `${icon} <span>${message}</span>`;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
