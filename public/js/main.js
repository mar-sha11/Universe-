/**
 * UniVerse - Main JavaScript
 * Handles core app functionality
 */

// API Configuration
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : '/api';

// Authentication state
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌌 UniVerse initialized');
  
  // Check authentication
  checkAuth();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load page-specific content
  loadPageContent();
});

// Check if user is authenticated
async function checkAuth() {
  if (!authToken) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.data;
      updateUIForAuthenticatedUser();
    } else {
      // Token is invalid
      localStorage.removeItem('authToken');
      authToken = null;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
  }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
  if (!currentUser) return;

  // Update profile button
  const profileBtn = document.getElementById('profileBtn');
  if (profileBtn && currentUser.avatar) {
    profileBtn.querySelector('.icon').textContent = '👤';
  }

  // Show user-specific content
  console.log('Welcome back,', currentUser.firstName);
}

// Set up event listeners
function setupEventListeners() {
  // Notification button
  const notificationBtn = document.getElementById('notificationBtn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      showNotifications();
    });
  }

  // Profile button
  const profileBtn = document.getElementById('profileBtn');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      window.location.href = '/profile.html';
    });
  }

  // Create/FAB button
  const createBtn = document.getElementById('createBtn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      showCreateMenu();
    });
  }

  // Navigation items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Update active state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

// Load page-specific content
function loadPageContent() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  
  switch (page) {
    case 'index.html':
    case '':
      loadHomePage();
      break;
    case 'tribes.html':
      loadTribesPage();
      break;
    case 'gigs.html':
      loadGigsPage();
      break;
    case 'library.html':
      loadLibraryPage();
      break;
    case 'profile.html':
      loadProfilePage();
      break;
  }
}

// Page loaders
function loadHomePage() {
  console.log('📍 Home page loaded');
  // Additional home page logic
}

function loadTribesPage() {
  console.log('🌟 Tribes page loaded');
  // Load tribes
}

function loadGigsPage() {
  console.log('💼 Gigs page loaded');
  // Load gigs
}

function loadLibraryPage() {
  console.log('📚 Library page loaded');
  // Load library content
}

function loadProfilePage() {
  console.log('👤 Profile page loaded');
  // Load user profile
}

// Show notifications
function showNotifications() {
  // TODO: Implement notifications panel
  alert('Notifications feature coming soon!');
}

// Show create menu
function showCreateMenu() {
  const menu = document.createElement('div');
  menu.className = 'glass-modal';
  menu.style.position = 'fixed';
  menu.style.top = '50%';
  menu.style.left = '50%';
  menu.style.transform = 'translate(-50%, -50%)';
  menu.style.zIndex = '2000';
  
  menu.innerHTML = `
    <h3 style="margin-bottom: 1rem;">Create New</h3>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <button class="btn-primary" onclick="createGig()">💼 Post a Gig</button>
      <button class="btn-primary" onclick="createPost()">✍️ Create Post</button>
      <button class="btn-primary" onclick="createTribe()">🌟 Start a Tribe</button>
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `;
  
  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.style.position = 'fixed';
  backdrop.style.top = '0';
  backdrop.style.left = '0';
  backdrop.style.width = '100%';
  backdrop.style.height = '100%';
  backdrop.style.background = 'rgba(0, 0, 0, 0.7)';
  backdrop.style.zIndex = '1999';
  backdrop.onclick = closeModal;
  
  document.body.appendChild(backdrop);
  document.body.appendChild(menu);
  
  window.currentModal = { menu, backdrop };
}

// Close modal
function closeModal() {
  if (window.currentModal) {
    window.currentModal.menu.remove();
    window.currentModal.backdrop.remove();
    window.currentModal = null;
  }
}

// Create actions
function createGig() {
  closeModal();
  window.location.href = '/gigs.html?action=create';
}

function createPost() {
  closeModal();
  alert('Create post feature coming soon!');
}

function createTribe() {
  closeModal();
  window.location.href = '/tribes.html?action=create';
}

// Utility functions
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'glass-card-sm';
  toast.style.position = 'fixed';
  toast.style.top = '80px';
  toast.style.right = '20px';
  toast.style.padding = '16px 24px';
  toast.style.zIndex = '2000';
  toast.style.minWidth = '250px';
  toast.style.animation = 'slideInRight 0.3s ease';
  
  const colors = {
    info: '#3B82F6',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B'
  };
  
  toast.style.borderLeft = `4px solid ${colors[type] || colors.info}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Format date/time
function formatDate(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} mins ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  
  return then.toLocaleDateString();
}

// Export functions for global use
window.createGig = createGig;
window.createPost = createPost;
window.createTribe = createTribe;
window.closeModal = closeModal;
window.showToast = showToast;
window.formatDate = formatDate;
