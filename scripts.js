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
	// TODO: make custom confirmation window
    if (confirm('Are you sure you want to power off the system?')) {
      console.log('Power off requested');
      // Here you would typically call a system command to power off
      // For demo purposes, we'll just log it
    }
  });
}

function fetchOSDataAndUpdateUI() {
	/* Default User Section */
	const usernameElem = document.querySelector("#selected-user-username")
	const picContainerElem = document.querySelector("#selected-user-pfp-container");
	const pfpElem = picContainerElem.querySelector("img");
	
	const users = window.lightdm.users;
	const defaultUser = users[0]; /* TODO: make it stateful, make users list and fill it */
	
	// fuck JS
    function nameToDisplayFunc() {
	  if (defaultUser.display_name) {
		return defaultUser.display_name;
	  } else if (defaultUser.username) {
		  return defaultUser.username;
	  } else {
		  return "Unknown Name";
	  }
	}
	
	const nameToDisplay = nameToDisplayFunc();
	
	usernameElem.innerHTML = nameToDisplay;
	if (defaultUser.image) { pfpElem.src = defaultUser.image; }
	/* Default User Section END */
	
	/* Sessions Section */
	const sessionSelector = document.querySelector("#session-selector");
	const availableSessions = window.lightdm.sessions;
	
	sessionSelector.innerHTML = '';
	for (const s of availableSessions) {
		const sessionOption = document.createElement('option');
		sessionOption.value = s.name;
		sessionOption.textContent = s.name;
		sessionSelector.appendChild(sessionOption);
	}
	
	// fuck JS
	function sessionNameToUseFunc() { 
	  if (defaultUser.session) {
		  return defaultUser.session;
	  } else if (availableSessions.length > 0) {
		  return availableSessions[0].key;
	  } else {
		  return window.lightdm.default_session;
	  }
	}
	
	const preSelectedSessionNameToUse = sessionNameToUseFunc();
	const preSelectedSessionToUse = availableSessions.find(s => s.key == preSelectedSessionNameToUse);
	sessionSelector.value = preSelectedSessionToUse.name;
	/* Sessions Section END */
	
	/* Authentication Section */
	const passwordInputElem = document.querySelector("#password-input");
	
	window.lightdm.authentication_complete.connect(async () => {
      if (window.lightdm.is_authenticated) {
        const selectedSessionName = sessionSelector.value;
		const selectedSession = availableSessions.find(s => s.name == selectedSessionName);
		document.querySelector("#main-screen").classList.add("hidden");
		await window.wait(1000);
		window.lightdm.start_session(selectedSession.key ?? null);
      } else {
        passwordInputElem.disabled = false;
		passwordInputElem.focus();
		passwordInputElem.select();
      }
    });
	
	passwordInputElem.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			
			window.lightdm.cancel_authentication();
			window.lightdm.authenticate(defaultUser.username ?? null);
			const password = passwordInputElem.value ?? "";
			passwordInputElem.blur();
			passwordInputElem.disabled = true;
			window.lightdm.respond(password);
		}
	});

    
	/* Authentication Section END */
}

function mockData() {
  // Mock data for users - only includes fields actually used in the code
  const mockUsers = [
    {
      username: "user1",
      display_name: "Patrick Bateman",
      image: null,
      session: "gnome"
    },
    {
      username: "user2", 
      display_name: "User Two",
      image: null,
      session: "kde-plasma"
    },
    {
      username: "admin",
      display_name: "Administrator",
      image: null,
      session: "xfce"
    }
  ];

  // Mock data for sessions - only includes fields actually used in the code
  const mockSessions = [
    {
      key: "gnome",
      name: "GNOME"
    },
    {
      key: "kde-plasma",
      name: "KDE Plasma"
    },
    {
      key: "xfce",
      name: "XFCE"
    }
  ];

  // Mock LightDM interface with only the properties and methods used in the code
  window.lightdm = {
    // Properties
    users: mockUsers,
    sessions: mockSessions,
    default_session: "gnome",
    is_authenticated: false,

    // Signal callback handlers - only authentication_complete is used
    authentication_complete: {
      callbacks: [],
      connect: function(callback) {
        this.callbacks.push(callback);
      },
      emit: function() {
        this.callbacks.forEach(callback => callback());
      }
    },

    // Authentication methods
    authenticate: function(username) {
      console.log(`Authenticating user: ${username}`);
      return true;
    },

    respond: function(password) {
      console.log("Password received, validating...");
      
      // Accept only "password" as the valid password for all users
      this.is_authenticated = (password === "password");
      
      if (this.is_authenticated) {
        console.log("Authentication successful");
      } else {
        console.log("Authentication failed");
      }
      
      this.authentication_complete.emit();
    },

    cancel_authentication: function() {
      console.log("Authentication cancelled");
      this.is_authenticated = false;
      return true;
    },

    // Session methods
    start_session: function(session_key) {
      if (!this.is_authenticated) {
        console.error("Cannot start session: not authenticated");
        return false;
      }

      const session = session_key || this.default_session;
      console.log(`Starting session: ${session}`);
      return true;
    }
  };

  // Helper function for simulating asynchronous operations - used in the code
  window.wait = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  console.log("LightDM mock initialized");
}

// Initialize everything when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  mockData();
  // setupBackground();
  updateTime();
  setupSettingsMenu();
  fetchOSDataAndUpdateUI();
});