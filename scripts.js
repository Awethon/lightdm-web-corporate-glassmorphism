// Check for background files
function setupBackground() {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const videoExtensions = ['mp4', 'webm'];
  let backgroundElement = null;
  
  // Try to find a background file
  for (const ext of [...videoExtensions, ...imageExtensions]) {
    const url = `background.${ext}`;
    
    // Use fetch to check if the file exists
    fetch(url, { method: 'HEAD' })
      .then(response => {
        if (response.ok && !backgroundElement) {
          // Create the appropriate element based on extension
          if (videoExtensions.includes(ext)) {
            backgroundElement = document.createElement('video');
            backgroundElement.autoplay = true;
            backgroundElement.loop = true;
            backgroundElement.muted = true;
            backgroundElement.playsInline = true;
          } else {
            backgroundElement = document.createElement('img');
          }
          
          // Set common attributes
          backgroundElement.id = 'background';
          backgroundElement.src = url;
          document.body.insertBefore(backgroundElement, document.body.firstChild);
        }
      })
      .catch(() => {
        // Silently ignore file not found errors
      });
  }
}

// Update the time and date display
function updateTime() {
  const now = new Date();
  
  // Update time
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  document.getElementById('time-text').textContent = timeString;
  
  // Update date
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayOfWeek = days[now.getDay()];
  const month = months[now.getMonth()];
  const dayOfMonth = now.getDate();
  const dateString = `${dayOfWeek}, ${month} ${dayOfMonth}`;
  document.getElementById('date-text').textContent = dateString;
  
  requestAnimationFrame(updateTime);
}

// Settings menu functionality
function setupSettingsMenu() {
  const settingsButton = document.getElementById('settings-enter');
  const settingsMenu = document.getElementById('settings-menu');
  const powerItem = document.getElementById('power-item');
  const sessionSelector = document.getElementById('session-selector');
  
  // Toggle settings menu
  settingsButton.addEventListener('click', () => {
    settingsMenu.classList.toggle('hide');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!settingsMenu.contains(event.target) && event.target !== settingsButton && !settingsButton.contains(event.target)) {
      settingsMenu.classList.add('hide');
    }
  });
  
  // Power button functionality
  powerItem.addEventListener('click', () => {
    if (confirm('Are you sure you want to power off the system?')) {
      console.log('Power off requested');
      // Here you would typically call a system command to power off
      // For demo purposes, we'll just log it
    }
  });
  
  // Session selector functionality
  sessionSelector.addEventListener('change', () => {
    console.log(`Session changed to: ${sessionSelector.value}`);
    // Here you would typically save this selection for the login process
  });
}

// Initialize everything when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  setupBackground();
  updateTime();
  setupSettingsMenu();
});