/**
 * Progressive Web App (PWA) Configuration
 * Handles service worker registration and PWA features
 */

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available
              showUpdateNotification();
            }
          });
        });
      })
      .catch(error => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

// Show update notification
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'glass-card';
  notification.style.position = 'fixed';
  notification.style.bottom = '120px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.padding = '16px 24px';
  notification.style.zIndex = '1001';
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.gap = '16px';
  notification.style.maxWidth = '90%';
  
  notification.innerHTML = `
    <span>New version available!</span>
    <button class="btn-primary" onclick="updateApp()" style="padding: 8px 16px;">
      Update
    </button>
  `;
  
  document.body.appendChild(notification);
}

// Update app
window.updateApp = function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    });
  }
};

// Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('💾 Install prompt available');
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button
  showInstallButton();
});

// Show install button
function showInstallButton() {
  const installBtn = document.createElement('button');
  installBtn.className = 'btn-primary';
  installBtn.style.position = 'fixed';
  installBtn.style.bottom = '120px';
  installBtn.style.left = '50%';
  installBtn.style.transform = 'translateX(-50%)';
  installBtn.style.zIndex = '1001';
  installBtn.style.padding = '12px 24px';
  installBtn.textContent = '📱 Install App';
  
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      deferredPrompt = null;
      installBtn.remove();
    }
  });
  
  document.body.appendChild(installBtn);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    installBtn.style.opacity = '0';
    installBtn.style.transition = 'opacity 0.5s ease';
    setTimeout(() => installBtn.remove(), 500);
  }, 10000);
}

// Track app install
window.addEventListener('appinstalled', () => {
  console.log('✅ UniVerse app installed');
  if (window.showToast) {
    showToast('App installed successfully!', 'success');
  }
  deferredPrompt = null;
});

// Handle offline/online status
window.addEventListener('online', () => {
  console.log('🌐 Back online');
  if (window.showToast) {
    showToast('You are back online', 'success');
  }
});

window.addEventListener('offline', () => {
  console.log('📡 You are offline');
  if (window.showToast) {
    showToast('You are offline. Some features may be limited.', 'warning');
  }
});

// Check if running as PWA
function isRunningAsPWA() {
  return (window.matchMedia('(display-mode: standalone)').matches) || 
         (window.navigator.standalone) || 
         document.referrer.includes('android-app://');
}

if (isRunningAsPWA()) {
  console.log('📱 Running as PWA');
  document.body.classList.add('pwa-mode');
}

// Battery API (if available)
if ('getBattery' in navigator) {
  navigator.getBattery().then(battery => {
    const updateBatteryStatus = () => {
      console.log(`🔋 Battery: ${Math.round(battery.level * 100)}%`);
      
      // Warn if battery is low
      if (battery.level < 0.15 && !battery.charging) {
        if (window.showToast) {
          showToast('Low battery. Consider saving your work.', 'warning');
        }
      }
    };
    
    updateBatteryStatus();
    battery.addEventListener('levelchange', updateBatteryStatus);
    battery.addEventListener('chargingchange', updateBatteryStatus);
  });
}

// Network information (if available)
if ('connection' in navigator) {
  const connection = navigator.connection;
  
  const updateNetworkStatus = () => {
    const effectiveType = connection.effectiveType;
    console.log(`📶 Network: ${effectiveType}`);
    
    // Warn if on slow connection
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      if (window.showToast) {
        showToast('Slow network detected. Content may load slowly.', 'warning');
      }
    }
  };
  
  updateNetworkStatus();
  connection.addEventListener('change', updateNetworkStatus);
}
