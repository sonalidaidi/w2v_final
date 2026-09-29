export interface StoredRegistration {
  id: string;
  orgType: string;
  roleCategory: 'Provider' | 'Receiver';
  orgName: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  location: string;
  govRegNumber: string;
  proofFileName?: string;
  fpuType?: string;
  productCategory?: string;
  industryType?: string;
  materialRequired?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notification?: string;
}

export const determineRoleCategory = (orgType: string): 'Provider' | 'Receiver' => {
  if (orgType === 'INSTITUTIONAL KITCHEN' || orgType === 'FOOD PROCESSING UNIT') {
    return 'Provider';
  }
  return 'Receiver';
};

export const INITIAL_DEMO_REGISTRATIONS: StoredRegistration[] = [
  {
    id: 'reg-demo-fpu-sahyadri',
    orgType: 'FOOD PROCESSING UNIT',
    roleCategory: 'Provider',
    orgName: 'Sahyadri Agro-Processing Cluster Ltd',
    ownerName: 'Er. Amit Deshmukh',
    contactNumber: '+91 94228 11200',
    email: 'fpu.agro@w2v-ecosystem.org',
    password: 'password123',
    confirmPassword: 'password123',
    address: 'Plot B-14, Food Tech Zone, MIDC Butibori',
    city: 'Nagpur',
    state: 'Maharashtra',
    pinCode: '441122',
    location: 'Plot B-14, Food Tech Zone, MIDC Butibori, Nagpur',
    govRegNumber: 'MH-NGP-FPU-2023-4192',
    fpuType: 'Dairy & Fruit Processing',
    productCategory: 'Dairy, Fruit Pulp & Concentrates',
    status: 'VERIFIED',
    submittedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 44 * 86400000).toISOString(),
    reviewedBy: 'admin@w2v-ecosystem.org',
    notification: 'Your W2V registration has been approved. You can now log in to your account.',
  },
  {
    id: 'reg-demo-kitchen-vnit',
    orgType: 'INSTITUTIONAL KITCHEN',
    roleCategory: 'Provider',
    orgName: 'VNIT Central Dining & Mega Mess',
    ownerName: 'Prof. Rajesh K. Sharma',
    contactNumber: '+91 98221 44550',
    email: 'kitchen.vnit@w2v-ecosystem.org',
    password: 'password123',
    confirmPassword: 'password123',
    address: 'South Ambazari Road, VNIT Campus',
    city: 'Nagpur',
    state: 'Maharashtra',
    pinCode: '440010',
    location: 'South Ambazari Road, VNIT Campus, Nagpur',
    govRegNumber: 'MH-NGP-IK-2024-8841',
    status: 'VERIFIED',
    submittedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 29 * 86400000).toISOString(),
    reviewedBy: 'admin@w2v-ecosystem.org',
    notification: 'Your W2V registration has been approved. You can now log in to your account.',
  },
  {
    id: 'reg-demo-ngo-annapurna',
    orgType: 'NGO',
    roleCategory: 'Receiver',
    orgName: 'Annapurna Seva Samiti',
    ownerName: 'Sunita Joshi',
    contactNumber: '+91 98230 55412',
    email: 'ngo.annapurna@w2v-ecosystem.org',
    password: 'password123',
    confirmPassword: 'password123',
    address: 'Sitabuldi Community Hall, Wardha Road',
    city: 'Nagpur',
    state: 'Maharashtra',
    pinCode: '440012',
    location: 'Sitabuldi Community Hall, Wardha Road, Nagpur',
    govRegNumber: 'MH-NGP-NGO-2022-1049',
    status: 'VERIFIED',
    submittedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 59 * 86400000).toISOString(),
    reviewedBy: 'admin@w2v-ecosystem.org',
    notification: 'Your W2V registration has been approved. You can now log in to your account.',
  },
  {
    id: 'reg-demo-fpu-pending',
    orgType: 'FOOD PROCESSING UNIT',
    roleCategory: 'Provider',
    orgName: 'Vidarbha Bio-Agritech & Food Park',
    ownerName: 'Dr. Ramesh Patil',
    contactNumber: '+91 97654 32100',
    email: 'patil@vidarbha-bioagri.in',
    password: 'password123',
    confirmPassword: 'password123',
    address: 'Plot C-8, Agro Food Processing Cluster',
    city: 'Nagpur',
    state: 'Maharashtra',
    pinCode: '441108',
    location: 'Plot C-8, Agro Food Processing Cluster, Nagpur',
    govRegNumber: 'MH-NGP-FPU-2026-9041',
    fpuType: 'Grain Milling & Starch Extraction',
    productCategory: 'Flour, Bran & Starch Derivatives',
    status: 'PENDING',
    submittedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

const STORAGE_KEY = 'w2v_registered_organizations';

export const getStoredRegistrations = (): StoredRegistration[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check legacy key if any
      const legacyRaw = localStorage.getItem('w2v_pending_registrations');
      if (legacyRaw) {
        const legacyList = JSON.parse(legacyRaw);
        const mapped: StoredRegistration[] = legacyList.map((item: any, idx: number) => ({
          ...item,
          id: item.id || `reg-${Date.now()}-${idx}`,
          roleCategory: item.roleCategory || determineRoleCategory(item.orgType),
          status: item.status || 'PENDING',
        }));
        saveRegistrations(mapped);
        return mapped;
      }
      saveRegistrations(INITIAL_DEMO_REGISTRATIONS);
      return INITIAL_DEMO_REGISTRATIONS;
    }
    const list: StoredRegistration[] = JSON.parse(raw);
    // If the list is missing the FPU demo accounts, merge them in
    if (!list.some((r) => r.email === 'fpu.agro@w2v-ecosystem.org')) {
      const merged = [...INITIAL_DEMO_REGISTRATIONS, ...list.filter((r) => !INITIAL_DEMO_REGISTRATIONS.some((i) => i.id === r.id))];
      saveRegistrations(merged);
      return merged;
    }
    return list;
  } catch {
    return INITIAL_DEMO_REGISTRATIONS;
  }
};

export const saveRegistrations = (list: StoredRegistration[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // also sync back to w2v_pending_registrations for backwards compatibility
    localStorage.setItem('w2v_pending_registrations', JSON.stringify(list));
  } catch (err) {
    console.error('Error saving registrations to storage', err);
  }
};

export const findRegistrationByEmail = (email: string): StoredRegistration | undefined => {
  const all = getStoredRegistrations();
  const normalized = email.trim().toLowerCase();
  return all.find((r) => r.email.trim().toLowerCase() === normalized);
};

export const updateRegistrationPassword = (email: string, newPassword: string): boolean => {
  const all = getStoredRegistrations();
  const normalized = email.trim().toLowerCase();
  const index = all.findIndex((r) => r.email.trim().toLowerCase() === normalized);
  if (index === -1) return false;

  all[index].password = newPassword;
  all[index].confirmPassword = newPassword;
  saveRegistrations(all);
  return true;
};

export const approveRegistration = (id: string, adminEmail: string): StoredRegistration | null => {
  const all = getStoredRegistrations();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated: StoredRegistration = {
    ...all[index],
    status: 'VERIFIED',
    reviewedAt: new Date().toISOString(),
    reviewedBy: adminEmail,
    notification: 'Your W2V registration has been approved. You can now log in to your account.',
  };

  all[index] = updated;
  saveRegistrations(all);
  return updated;
};

export const rejectRegistration = (
  id: string,
  adminEmail: string,
  reason: string
): StoredRegistration | null => {
  const all = getStoredRegistrations();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated: StoredRegistration = {
    ...all[index],
    status: 'REJECTED',
    reviewedAt: new Date().toISOString(),
    reviewedBy: adminEmail,
    rejectionReason: reason,
    notification:
      'Your W2V registration was not approved. Please check the rejection reason or contact W2V support.',
  };

  all[index] = updated;
  saveRegistrations(all);
  return updated;
};
