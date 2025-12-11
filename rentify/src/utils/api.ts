import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0d8d1b3e`;

// Get auth token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Set auth token in localStorage
export function setAuthToken(token: string) {
  localStorage.setItem('authToken', token);
}

// Clear auth token from localStorage
export function clearAuthToken() {
  localStorage.removeItem('authToken');
}

// Generic API request function
async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  useAuth = true
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (useAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`API Error [${endpoint}]:`, data);
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// ============= AUTH API =============

export async function signup(email: string, password: string, name: string) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  }, false);
}

export async function getCurrentUser() {
  return apiRequest('/auth/me');
}

export async function getUserById(userId: string) {
  return apiRequest(`/users/${userId}`);
}

// ============= ITEMS API =============

export async function getItems(category?: string, search?: string) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/items${query}`, {}, false);
}

export async function getItem(id: string) {
  return apiRequest(`/items/${id}`, {}, false);
}

export async function createItem(itemData: {
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  category: string;
  location: string;
  imageUrl?: string;
}) {
  return apiRequest('/items', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
}

export async function updateItem(id: string, itemData: Partial<any>) {
  return apiRequest(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  });
}

export async function uploadItemImage(itemId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${API_BASE_URL}/items/${itemId}/upload-image`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Upload error:', data);
    throw new Error(data.error || 'Upload failed');
  }

  return data;
}

// ============= RENTALS API =============

export async function getMyRentals() {
  return apiRequest('/rentals/my-rentals');
}

export async function getMyListings() {
  return apiRequest('/rentals/my-listings');
}

export async function createRental(rentalData: {
  itemId: string;
  startDate: string;
  endDate: string;
}) {
  return apiRequest('/rentals', {
    method: 'POST',
    body: JSON.stringify(rentalData),
  });
}

// ============= MESSAGES API =============

export async function getConversations() {
  return apiRequest('/messages/conversations');
}

export async function getMessages(otherUserId: string) {
  return apiRequest(`/messages/${otherUserId}`);
}

export async function sendMessage(receiverId: string, content: string) {
  return apiRequest('/messages', {
    method: 'POST',
    body: JSON.stringify({ receiverId, content }),
  });
}

// ============= CATEGORIES API =============

export async function getCategories() {
  return apiRequest('/categories', {}, false);
}

// ============= SEED DEMO DATA API =============

export async function seedDemoData() {
  return apiRequest('/seed-demo-data', {
    method: 'POST',
  }, false);
}
