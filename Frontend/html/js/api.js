/**
 * StayPact API Client
 * Handles requests to the backend server with seamless fallback
 * to local persistence when operating in standalone mode.
 */

const API_BASE = window.location.origin.includes('http') && !window.location.protocol.startsWith('file')
  ? `${window.location.origin}/api`
  : 'http://localhost:5000/api';

// Pre-seeded Properties Database
const SEED_PROPERTIES = [
  {
    _id: 'prop-101',
    landlord: {
      _id: 'user-landlord-1',
      name: 'Rajesh Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      occupation: 'Property Owner (10+ Yrs)',
      phone: '+91 98765 43210',
      isVerified: true,
    },
    title: 'Modern 1BHK Studio in Koramangala 4th Block',
    description: 'Chic, sunlit 1BHK flat with minimalist aesthetic, ergonomic workstation, 300 Mbps fiber internet, and full modular kitchen. Ideal for tech professionals and bachelors who value independence.',
    propertyType: '1bhk',
    targetTenant: 'bachelors_allowed',
    furnishing: 'fully_furnished',
    pricing: {
      monthlyRent: 26000,
      securityDeposit: 50000,
      maintenance: 2000,
      electricityBillRule: 'Sub-meter monthly',
      waterBillRule: 'Included in rent',
    },
    location: {
      address: '4th Block, 80 Feet Road',
      locality: 'Koramangala',
      city: 'Bengaluru',
      lat: 12.9352,
      lng: 77.6245,
    },
    amenities: ['wifi', 'ac', 'kitchen', 'parking_bike', 'washing_machine', 'refrigerator', 'power_backup', 'balcony'],
    mutualTerms: {
      noticePeriodDays: 30,
      lockInPeriodMonths: 3,
      rentDueDay: 5,
      visitorPolicy: 'Friends and guests welcome anytime with basic mutual respect',
      cookingPolicy: 'Veg & Non-Veg cooking allowed freely',
      petPolicy: 'Cats and small dogs allowed',
      smokingPolicy: 'Balcony smoking only',
      quietHours: '11:30 PM - 6:30 AM',
      customClauses: [
        'Zero brokerage guarantee',
        'Deposit refund within 48h of move-out inspection',
      ],
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    ],
    ratingAverage: 4.9,
    reviewCount: 12,
    isAvailable: true,
  },
  {
    _id: 'prop-102',
    landlord: {
      _id: 'user-landlord-2',
      name: 'Ananya Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      occupation: 'Architect & Landlord',
      phone: '+91 98111 22334',
      isVerified: true,
    },
    title: 'Spacious 3BHK Gated Haven with Balcony & Park View',
    description: 'Serene 3BHK apartment in upscale gated society with 24/7 security, club house, children play area, covered car parking, and lush greenery. Perfect for peaceful family living.',
    propertyType: '3bhk',
    targetTenant: 'families_only',
    furnishing: 'semi_furnished',
    pricing: {
      monthlyRent: 48000,
      securityDeposit: 100000,
      maintenance: 3500,
      electricityBillRule: 'Direct BESCOM bill',
      waterBillRule: 'Society meter',
    },
    location: {
      address: 'Green Glen Layout, Bellandur',
      locality: 'HSR Layout',
      city: 'Bengaluru',
      lat: 12.9121,
      lng: 77.6446,
    },
    amenities: ['ac', 'parking_car', 'kitchen', 'power_backup', 'security_guard', 'lift', 'balcony', 'gym'],
    mutualTerms: {
      noticePeriodDays: 45,
      lockInPeriodMonths: 6,
      rentDueDay: 1,
      visitorPolicy: 'Family visitors freely permitted',
      cookingPolicy: 'All cuisines permitted',
      petPolicy: 'Pet friendly community',
      smokingPolicy: 'Non-smoking premises',
      quietHours: '10:30 PM - 6:00 AM',
      customClauses: [
        'Dedicated EV 4-wheeler charging point in basement',
        'Annual maintenance contract covered by owner',
      ],
    },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    ],
    ratingAverage: 4.95,
    reviewCount: 26,
    isAvailable: true,
  },
  {
    _id: 'prop-103',
    landlord: {
      _id: 'user-landlord-1',
      name: 'Rajesh Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      occupation: 'Property Owner (10+ Yrs)',
      phone: '+91 98765 43210',
      isVerified: true,
    },
    title: 'Minimalist 2BHK Designer Flat in Indiranagar 100ft Rd',
    description: 'High ceiling 2BHK flat surrounded by trees on 12th Main Indiranagar. Walkable to metro, craft cafes, and co-working centers. Features teakwood furniture and smart locks.',
    propertyType: '2bhk',
    targetTenant: 'bachelors_allowed',
    furnishing: 'fully_furnished',
    pricing: {
      monthlyRent: 38000,
      securityDeposit: 75000,
      maintenance: 2500,
      electricityBillRule: 'BESCOM direct reading',
      waterBillRule: 'Included in rent',
    },
    location: {
      address: '12th Main, HAL 2nd Stage',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      lat: 12.9784,
      lng: 77.6408,
    },
    amenities: ['wifi', 'ac', 'kitchen', 'parking_car', 'parking_bike', 'washing_machine', 'refrigerator', 'power_backup', 'balcony'],
    mutualTerms: {
      noticePeriodDays: 30,
      lockInPeriodMonths: 3,
      rentDueDay: 5,
      visitorPolicy: 'No curfew & no moral policing on visitors',
      cookingPolicy: 'Veg & Non-Veg allowed freely',
      petPolicy: 'Cats allowed',
      smokingPolicy: 'Balcony smoking permitted',
      quietHours: '12:00 AM - 7:00 AM',
      customClauses: [
        'Dedicated 500 Mbps WiFi connection included in rent',
        'Smart digital door lock with unique PIN',
      ],
    },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    ],
    ratingAverage: 4.88,
    reviewCount: 18,
    isAvailable: true,
  },
  {
    _id: 'prop-104',
    landlord: {
      _id: 'user-landlord-3',
      name: 'Vikram Sethi',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      occupation: 'Tech Entrepreneur',
      phone: '+91 99222 33445',
      isVerified: true,
    },
    title: 'Skyline View 2BHK in Bandra West Pali Hill',
    description: 'Vibrant, open-concept 2BHK flat in prime Bandra location. Walking distance from Carter Road promenade, cafes, and creative studios. Features wooden flooring and French windows.',
    propertyType: '2bhk',
    targetTenant: 'anyone',
    furnishing: 'fully_furnished',
    pricing: {
      monthlyRent: 65000,
      securityDeposit: 150000,
      maintenance: 4000,
      electricityBillRule: 'Adani Electricity direct',
      waterBillRule: 'Included in rent',
    },
    location: {
      address: 'Pali Hill, Bandra West',
      locality: 'Bandra West',
      city: 'Mumbai',
      lat: 19.0596,
      lng: 72.8295,
    },
    amenities: ['wifi', 'ac', 'kitchen', 'parking_car', 'washing_machine', 'refrigerator', 'lift', 'balcony'],
    mutualTerms: {
      noticePeriodDays: 30,
      lockInPeriodMonths: 6,
      rentDueDay: 7,
      visitorPolicy: 'Unrestricted visitor access',
      cookingPolicy: 'All culinary choices welcomed',
      petPolicy: 'Pet friendly',
      smokingPolicy: 'Balcony area',
      quietHours: '11:00 PM - 7:00 AM',
      customClauses: [
        'Biometric digital lock installed',
        'Mutual 30-day exit clause for job relocation',
      ],
    },
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502005229762-ee152da92e06?auto=format&fit=crop&w=1200&q=80',
    ],
    ratingAverage: 4.9,
    reviewCount: 14,
    isAvailable: true,
  },
  {
    _id: 'prop-105',
    landlord: {
      _id: 'user-landlord-1',
      name: 'Rajesh Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      occupation: 'Property Owner (10+ Yrs)',
      phone: '+91 98765 43210',
      isVerified: true,
    },
    title: 'Sunny Studio Apartment Near Cyber City DLF Phase 5',
    description: 'Modern compact studio with floor-to-ceiling glass, dedicated work desk, kitchenette, and rapid metro connectivity. Built specifically for corporate professionals & bachelors.',
    propertyType: 'studio',
    targetTenant: 'bachelors_allowed',
    furnishing: 'fully_furnished',
    pricing: {
      monthlyRent: 22000,
      securityDeposit: 35000,
      maintenance: 1500,
      electricityBillRule: 'Standard prepaid meter',
      waterBillRule: 'Included in rent',
    },
    location: {
      address: 'DLF Phase 5, Golf Course Road',
      locality: 'DLF Phase 5',
      city: 'Delhi NCR',
      lat: 28.4595,
      lng: 77.0266,
    },
    amenities: ['wifi', 'ac', 'kitchen', 'parking_bike', 'washing_machine', 'power_backup', 'security_guard', 'lift'],
    mutualTerms: {
      noticePeriodDays: 30,
      lockInPeriodMonths: 2,
      rentDueDay: 5,
      visitorPolicy: 'Guests allowed freely',
      cookingPolicy: 'Veg & Non-Veg friendly',
      petPolicy: 'Small pets allowed',
      smokingPolicy: 'Non-smoking inside room',
      quietHours: '11:00 PM - 6:00 AM',
      customClauses: [
        '200 Mbps broadband included',
      ],
    },
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    ],
    ratingAverage: 4.7,
    reviewCount: 9,
    isAvailable: true,
  },
  {
    _id: 'prop-106',
    landlord: {
      _id: 'user-landlord-2',
      name: 'Ananya Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      occupation: 'Architect & Landlord',
      phone: '+91 98111 22334',
      isVerified: true,
    },
    title: 'Charming 2BHK in Viman Nagar with Garden Terrace',
    description: 'Airy corner apartment overlooking peaceful trees in Viman Nagar. Close to Pune airport, Symbiosis, and tech hubs. Suitable for small families or working roommates.',
    propertyType: '2bhk',
    targetTenant: 'anyone',
    furnishing: 'semi_furnished',
    pricing: {
      monthlyRent: 29000,
      securityDeposit: 60000,
      maintenance: 1800,
      electricityBillRule: 'MSEB Meter reading',
      waterBillRule: 'Included in rent',
    },
    location: {
      address: 'Datta Mandir Chowk',
      locality: 'Viman Nagar',
      city: 'Pune',
      lat: 18.5679,
      lng: 73.9143,
    },
    amenities: ['ac', 'parking_car', 'parking_bike', 'kitchen', 'power_backup', 'balcony', 'lift'],
    mutualTerms: {
      noticePeriodDays: 30,
      lockInPeriodMonths: 3,
      rentDueDay: 5,
      visitorPolicy: 'Family and friends allowed anytime',
      cookingPolicy: 'All food preparations welcome',
      petPolicy: 'Pet friendly property',
      smokingPolicy: 'Terrace allowed',
      quietHours: '11:00 PM - 7:00 AM',
      customClauses: [
        'Water purifier & geyser maintained by owner',
      ],
    },
    images: [
      'https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    ],
    ratingAverage: 4.8,
    reviewCount: 11,
    isAvailable: true,
  }
];

// Initialize local storage seed if not present
if (!localStorage.getItem('staypact_properties')) {
  localStorage.setItem('staypact_properties', JSON.stringify(SEED_PROPERTIES));
}

// Initial registered users store
if (!localStorage.getItem('staypact_users')) {
  localStorage.setItem('staypact_users', JSON.stringify([]));
}

// Initial sample pacts
if (!localStorage.getItem('staypact_agreements')) {
  const initialAgreements = [
    {
      _id: 'pact-89421',
      pactNumber: 'PACT-2026-89421',
      property: SEED_PROPERTIES[0],
      landlord: SEED_PROPERTIES[0].landlord,
      tenant: {
        _id: 'user-sample-tenant',
        name: 'Arjun Mehta',
        email: 'arjun.mehta@example.com',
        phone: '+91 99887 76655',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        occupation: 'Software Engineer',
        tenantType: 'bachelor',
        isVerified: true,
      },
      terms: {
        monthlyRent: 26000,
        securityDeposit: 50000,
        maintenance: 2000,
        startDate: '2026-09-10',
        endDate: '2027-08-10',
        durationMonths: 11,
        noticePeriodDays: 30,
        rentDueDay: 5,
        visitorPolicy: 'Friends and guests welcome anytime with basic mutual respect',
        cookingPolicy: 'Veg & Non-Veg cooking allowed freely',
        petPolicy: 'Cats and small dogs allowed',
        specialNegotiatedTerms: [
          'Landlord agrees to provide new ergonomic office chair before move-in date',
          'Tenant agrees to use felt pads under desk furniture to protect wooden floors',
          'Security deposit 100% refundable within 48 hours of move-out inspection',
        ],
      },
      landlordSignature: {
        signed: true,
        signedAt: '2026-08-25T10:30:00Z',
        signatureName: 'Rajesh Sharma',
        comments: 'Delighted to host Arjun. Mutual terms agreed in full.',
      },
      tenantSignature: {
        signed: true,
        signedAt: '2026-08-26T14:15:00Z',
        signatureName: 'Arjun Mehta',
        comments: 'Accepted terms gladly. Excited for the move-in!',
      },
      status: 'active',
      createdAt: '2026-08-25T10:00:00Z',
    }
  ];
  localStorage.setItem('staypact_agreements', JSON.stringify(initialAgreements));
}

// Initial sample bookings
if (!localStorage.getItem('staypact_bookings')) {
  localStorage.setItem('staypact_bookings', JSON.stringify([]));
}

// Global API Client Object
const API = {
  getToken() {
    return localStorage.getItem('staypact_token');
  },

  setAuth(token, user) {
    localStorage.setItem('staypact_token', token);
    localStorage.setItem('staypact_user', JSON.stringify(user));
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('staypact_user');
    if (!userStr) {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('staypact_token');
    localStorage.removeItem('staypact_user');
    window.location.href = 'login.html';
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${res.status}`);
    } catch (err) {
      // Graceful fallback to client local persistence
      return this.mockHandler(endpoint, options);
    }
  },

  // Mock handler for offline / standalone execution
  mockHandler(endpoint, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : {};

    const properties = JSON.parse(localStorage.getItem('staypact_properties') || '[]');
    const agreements = JSON.parse(localStorage.getItem('staypact_agreements') || '[]');
    const bookings = JSON.parse(localStorage.getItem('staypact_bookings') || '[]');
    const users = JSON.parse(localStorage.getItem('staypact_users') || '[]');

    // ==========================================
    // 1. Authentication Endpoints
    // ==========================================
    if (endpoint === '/auth/register' && method === 'POST') {
      const existing = users.find(u => u.email && u.email.toLowerCase() === (body.email || '').toLowerCase());
      if (existing) {
        return { success: false, message: 'An account with this email address already exists. Please sign in.' };
      }

      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(body.name)}&background=0D9488&color=ffffff&bold=true&rounded=true`;

      const newUser = {
        _id: 'user-' + Date.now(),
        name: body.name,
        email: body.email.toLowerCase(),
        password: body.password,
        phone: body.phone || '',
        role: body.role || 'tenant',
        tenantType: body.tenantType || (body.role === 'landlord' ? 'host' : 'bachelor'),
        occupation: body.occupation || (body.role === 'landlord' ? 'Property Host' : 'Resident'),
        avatar: avatarUrl,
        isVerified: true,
        savedProperties: [],
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('staypact_users', JSON.stringify(users));

      const token = 'token-' + Date.now();
      return { success: true, token, user: newUser, message: 'Registration successful' };
    }

    if (endpoint === '/auth/login' && method === 'POST') {
      const user = users.find(u => u.email && u.email.toLowerCase() === (body.email || '').toLowerCase());
      if (!user) {
        return { success: false, message: 'No registered account found with this email address. Please create an account.' };
      }
      if (user.password && user.password !== body.password) {
        return { success: false, message: 'Incorrect password. Please verify and try again.' };
      }

      const token = 'token-' + Date.now();
      return { success: true, token, user, message: 'Login successful' };
    }

    if (endpoint === '/auth/me' && method === 'GET') {
      const user = this.getCurrentUser();
      if (!user) return { success: false, message: 'Not authenticated' };
      return { success: true, user };
    }

    // ==========================================
    // 2. Properties Endpoints
    // ==========================================
    if (endpoint.startsWith('/properties/meta/featured')) {
      return {
        success: true,
        stats: { totalProperties: properties.length, totalCities: 6, activePacts: 480, satisfactionRate: '99.4%' },
        featured: properties.slice(0, 6),
      };
    }

    if (endpoint.startsWith('/properties') && method === 'GET') {
      const parts = endpoint.split('/');
      if (parts.length === 3 && parts[2] && !parts[2].includes('?')) {
        const prop = properties.find(p => p._id === parts[2]);
        return { success: true, data: prop || properties[0], reviews: [] };
      }
      return { success: true, count: properties.length, data: properties };
    }

    if (endpoint === '/properties' && method === 'POST') {
      const user = this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'Please log in to publish a property.' };
      }
      const newProp = {
        _id: 'prop-' + Date.now(),
        ...body,
        landlord: user,
        isAvailable: true,
        ratingAverage: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };
      properties.unshift(newProp);
      localStorage.setItem('staypact_properties', JSON.stringify(properties));
      return { success: true, data: newProp };
    }

    // ==========================================
    // 3. Bookings & Proposals
    // ==========================================
    if (endpoint === '/bookings' && method === 'POST') {
      const user = this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'Please log in or create an account to send a proposal.' };
      }
      const prop = properties.find(p => p._id === body.propertyId) || properties[0];
      const newBooking = {
        _id: 'booking-' + Date.now(),
        property: prop,
        tenant: user,
        landlord: prop.landlord,
        proposedMoveInDate: body.proposedStartDate,
        durationMonths: body.durationMonths || 11,
        occupantCount: body.occupantCount || 1,
        tenantCategory: body.tenantCategory || user.tenantType || 'bachelor',
        proposedMonthlyRent: body.proposedMonthlyRent || prop.pricing.monthlyRent,
        message: body.message || '',
        customTermsRequested: body.customTermsRequested || [],
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      bookings.unshift(newBooking);
      localStorage.setItem('staypact_bookings', JSON.stringify(bookings));
      return { success: true, message: 'Rental proposal submitted successfully!', data: newBooking };
    }

    if (endpoint === '/bookings/my') {
      const user = this.getCurrentUser();
      if (!user) return { success: true, data: [] };
      const myBookings = bookings.filter(b => b.tenant && (b.tenant._id === user._id || b.tenant.email === user.email));
      return { success: true, data: myBookings };
    }

    if (endpoint === '/bookings/received') {
      const user = this.getCurrentUser();
      if (!user) return { success: true, data: [] };
      const recBookings = bookings.filter(b => b.landlord && (b.landlord._id === user._id || b.landlord.email === user.email));
      return { success: true, data: recBookings };
    }

    if (endpoint.includes('/bookings/') && endpoint.endsWith('/status') && method === 'PUT') {
      const bookingId = endpoint.split('/')[2];
      const booking = bookings.find(b => b._id === bookingId);
      if (booking) {
        booking.status = body.status;
        if (body.status === 'accepted') {
          // Generate formal pact
          const newPact = {
            _id: 'pact-' + Date.now(),
            pactNumber: `PACT-${Date.now().toString().slice(-5)}`,
            property: booking.property,
            landlord: booking.landlord,
            tenant: booking.tenant,
            terms: {
              monthlyRent: booking.proposedMonthlyRent || booking.property.pricing.monthlyRent,
              securityDeposit: booking.property.pricing.securityDeposit,
              maintenance: booking.property.pricing.maintenance || 0,
              startDate: booking.proposedMoveInDate,
              endDate: new Date(Date.now() + 330 * 24 * 60 * 60 * 1000).toISOString(),
              durationMonths: booking.durationMonths || 11,
              noticePeriodDays: booking.property.mutualTerms?.noticePeriodDays || 30,
              rentDueDay: 5,
              visitorPolicy: booking.property.mutualTerms?.visitorPolicy || 'Mutual respect applies',
              cookingPolicy: booking.property.mutualTerms?.cookingPolicy || 'All cuisines permitted',
              petPolicy: booking.property.mutualTerms?.petPolicy || 'As agreed',
              specialNegotiatedTerms: booking.customTermsRequested || [],
            },
            landlordSignature: {
              signed: true,
              signedAt: new Date().toISOString(),
              signatureName: booking.landlord.name,
              comments: 'Terms approved by landlord',
            },
            tenantSignature: { signed: false },
            status: 'pending_signatures',
          };
          agreements.unshift(newPact);
          booking.agreementId = newPact._id;
          booking.status = 'agreement_generated';
          localStorage.setItem('staypact_agreements', JSON.stringify(agreements));
        }
        localStorage.setItem('staypact_bookings', JSON.stringify(bookings));
        return { success: true, booking };
      }
    }

    // ==========================================
    // 4. Agreements & Digital Signing
    // ==========================================
    if (endpoint.startsWith('/agreements/') && !endpoint.includes('my') && method === 'GET') {
      const pactId = endpoint.split('/')[2];
      const agreement = agreements.find(a => a._id === pactId || a.pactNumber === pactId) || agreements[0];
      return { success: true, data: agreement };
    }

    if (endpoint.includes('/sign') && method === 'POST') {
      const pactId = endpoint.split('/')[2];
      const agreement = agreements.find(a => a._id === pactId) || agreements[0];
      const user = this.getCurrentUser();
      
      if (user && user.role === 'landlord') {
        agreement.landlordSignature = { signed: true, signedAt: new Date().toISOString(), signatureName: body.signatureName || user.name };
      } else if (user) {
        agreement.tenantSignature = { signed: true, signedAt: new Date().toISOString(), signatureName: body.signatureName || user.name };
      }

      if (agreement.landlordSignature?.signed && agreement.tenantSignature?.signed) {
        agreement.status = 'active';
      }

      localStorage.setItem('staypact_agreements', JSON.stringify(agreements));
      return { success: true, data: agreement };
    }

    if (endpoint === '/agreements/my') {
      const user = this.getCurrentUser();
      if (!user) return { success: true, data: [] };
      const myAgreements = agreements.filter(a => 
        (a.tenant && (a.tenant._id === user._id || a.tenant.email === user.email)) ||
        (a.landlord && (a.landlord._id === user._id || a.landlord.email === user.email))
      );
      return { success: true, data: myAgreements.length > 0 ? myAgreements : agreements };
    }

    // Default response
    return { success: true, data: [] };
  }
};
