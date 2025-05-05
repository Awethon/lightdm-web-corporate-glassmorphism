// Check for background files
function setupBackground() {
  const backgroundFile = "backgrounds/background.mp4"
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const videoExtensions = ['mp4', 'webm'];
  
  const ext = backgroundFile.split('.').pop().toLowerCase();


  if (videoExtensions.includes(ext)) {
    const video = document.querySelector('video.background');
    if (video) {
      video.src = backgroundFile;
      video.classList.remove('hidden');
    }
  } else if (imageExtensions.includes(ext)) {
    const img = document.querySelector('img.background');
    if (img) {
      img.src = backgroundFile;
      img.classList.remove('hidden');
    }
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
  document.getElementById('fallback-time').textContent = timeString;

  // Update date
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayOfWeek = days[now.getDay()];
  const month = months[now.getMonth()];
  const dayOfMonth = now.getDate();
  const dateString = `${dayOfWeek}, ${month} ${dayOfMonth}`;
  document.getElementById('date-text').textContent = dateString;
  document.getElementById('fallback-date').textContent = dateString;

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
      window.lightdm.shutdown();
    }
  });
}

function fetchOSDataAndUpdateUI() {
  /* Default User Section */
  const usernameElem = document.querySelector("#selected-user-username");
  const picContainerElem = document.querySelector("#selected-user-pfp-container");
  const pfpElem = picContainerElem.querySelector("img");
  const loginForm = document.getElementById('login-form');
  const userSelectionPanel = document.getElementById('user-selection-panel');
  const usersTable = document.getElementById('users-table');
  const passwordInput = document.getElementById('password-input');

  const users = window.lightdm.users;
  let selectedUser = users[0]; // Default selected user
  
  // Setup user selection panel
  setupUserSelectionPanel();
  
  function setupUserSelectionPanel() {
    // Clear previous content
    usersTable.innerHTML = '';
    
    // Create user items for each user
    users.forEach(user => {
      const userItem = document.createElement('div');
      userItem.className = 'user-item';
      userItem.dataset.username = user.username;
      
      const pfpContainer = document.createElement('div');
      pfpContainer.className = 'user-item-pfp-container';
      
      const pfp = document.createElement('img');
      pfp.className = 'user-item-pfp';
      pfp.src = user.image || 'default-pfp.jpeg'; // Use default if no image
      pfp.alt = user.display_name || user.username;
      pfp.draggable = false;
      
      const name = document.createElement('div');
      name.className = 'user-item-name unselectable';
      name.textContent = user.display_name || user.username || 'Unknown User';
      
      pfpContainer.appendChild(pfp);
      userItem.appendChild(pfpContainer);
      userItem.appendChild(name);
      
      // Add click event to select this user
      userItem.addEventListener('click', () => {
        selectUser(user);
        toggleUserSelectionPanel();
      });
      
      usersTable.appendChild(userItem);
    });
    
    // Add click event to the profile picture to show user selection
    picContainerElem.addEventListener('click', toggleUserSelectionPanel);
  }
  
  function toggleUserSelectionPanel() {
    // Toggle visibility with animation
    if (userSelectionPanel.classList.contains('hidden')) {
      // Show user selection panel
      loginForm.classList.add('hidden');
      
      // Wait for login form animation to complete before showing the user selection panel
      setTimeout(() => {
        userSelectionPanel.classList.remove('hidden');
      }, 150);
    } else {
      // Hide user selection panel
      userSelectionPanel.classList.add('hidden');
      
      // Wait for user selection panel animation to complete before showing the login form
      setTimeout(() => {
        loginForm.classList.remove('hidden');
        // Focus on password input after transition
        passwordInput.focus();
      }, 150);
    }
  }
  
  function selectUser(user) {
    selectedUser = user;
    updateUIWithSelectedUser();
  }
  
  function updateUIWithSelectedUser() {
    // Display selected user name
    const nameToDisplay = getNameToDisplay(selectedUser);
    usernameElem.innerHTML = nameToDisplay;
    
    // Display selected user profile picture
    if (selectedUser.image) {
      pfpElem.src = selectedUser.image;
    } else {
      pfpElem.src = 'default-pfp.jpeg'; // Default image
    }
  }
  
  function getNameToDisplay(user) {
    if (user.display_name) {
      return user.display_name;
    }
    else if (user.username) {
      return user.username;
    }
    else {
      return "Unknown Name";
    }
  }
  
  // Initialize UI with default selected user
  updateUIWithSelectedUser();
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

 
  function sessionNameToUseFunc() {
    if (selectedUser.session) {
      return selectedUser.session;
    }
    else if (availableSessions.length > 0) {
      return availableSessions[0].key;
    }
    else {
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
    console.log("Authentication complete callback triggered");
    console.log(`Authentication result: ${window.lightdm.is_authenticated ? "SUCCESS" : "FAILED"}`);
    
    if (window.lightdm.is_authenticated) {
      const selectedSessionName = sessionSelector.value;
      console.log(`Selected session name: ${selectedSessionName}`);
      
      const selectedSession = availableSessions.find(s => s.name == selectedSessionName);
      console.log(`Selected session key: ${selectedSession.key}`);
      
      document.querySelector("#main-screen").classList.add("invisible");
      console.log("Main screen hidden, waiting to start session...");
      
      await window.wait(1000);
      console.log(`Starting session with key: ${selectedSession.key ?? "default"}`);
      window.lightdm.start_session(selectedSession.key ?? null);
    }
    else {
      console.log("Authentication failed, resetting password field");
      passwordInputElem.disabled = false;
      passwordInputElem.focus();
      passwordInputElem.select();
    }
  });

  passwordInputElem.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      console.log(`Authentication process starting for user: ${selectedUser.username}`);
      console.log(`Selected user display name: ${selectedUser.display_name}`);
      console.log(`Selected user session: ${selectedUser.session}`);
      
      window.lightdm.cancel_authentication();
      await window.wait(200);
      console.log(`Calling authenticate with username: ${selectedUser.username ?? "null"}`);
      window.lightdm.authenticate(selectedUser.username ?? null);
      await window.wait(200);
      
      const password = passwordInputElem.value ?? "";
      console.log(`Password entered: ${password.replace(/./g, '*')}`);
      console.log(`Password length: ${password.length}`);
      
      passwordInputElem.blur();
      passwordInputElem.disabled = true;
      console.log("Sending password to lightdm.respond()");
      window.lightdm.respond(password);
    }
  });


  /* Authentication Section END */
}

function mockData() {
  // Mock data for users - only includes fields actually used in the code
  const mockUsers = [{
      username: "user1",
      display_name: "Patrick Bateman",
      image: "default-pfp.jpeg",
      session: "gnome"
    },
    {
      username: "user2",
      display_name: "User Two",
      image: "default-pfp.jpeg",
      session: "kde-plasma"
    },
    {
      username: "admin",
      display_name: "Administrator",
      image: "default-pfp.jpeg",
      session: "xfce"
    },
    {
      username: "guest",
      display_name: "Guest User",
      image: "default-pfp.jpeg",
      session: "gnome"
    },
    {
      username: "dev",
      display_name: "Developer",
      image: "default-pfp.jpeg",
      session: "xfce"
    },
    {
      username: "test",
      display_name: "Test User",
      image: "default-pfp.jpeg",
      session: "kde-plasma"
    }
  ];

  // Mock data for sessions - only includes fields actually used in the code
  const mockSessions = [{
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
      connect: function (callback) {
        this.callbacks.push(callback);
      },
      emit: function () {
        this.callbacks.forEach(callback => callback());
      }
    },

    // Authentication methods
    authenticate: function (username) {
      console.log(`[MOCK] Authenticating user: ${username}`);
      console.log(`[MOCK] Available users: ${this.users.map(u => u.username).join(', ')}`);
      return true;
    },

    respond: function (password) {
      console.log("[MOCK] Password received, validating...");
      console.log(`[MOCK] Password length: ${password.length}`);
      console.log(`[MOCK] Expected valid password: "password"`);

      // Accept only "password" as the valid password for all users
      this.is_authenticated = (password === "password");

      if (this.is_authenticated) {
        console.log("[MOCK] Authentication successful");
      }
      else {
        console.log(`[MOCK] Authentication failed - password "${password}" does not match "password"`);
      }

      console.log("[MOCK] Triggering authentication_complete callbacks");
      this.authentication_complete.emit();
    },

    cancel_authentication: function () {
      console.log("[MOCK] Authentication cancelled");
      this.is_authenticated = false;
      return true;
    },

    // Session methods
    start_session: function (session_key) {
      if (!this.is_authenticated) {
        console.error("[MOCK] Cannot start session: not authenticated");
        return false;
      }

      const session = session_key || this.default_session;
      console.log(`[MOCK] Starting session: ${session}`);
      console.log(`[MOCK] Available sessions: ${this.sessions.map(s => `${s.name}(${s.key})`).join(', ')}`);
      console.log(`[MOCK] Default session: ${this.default_session}`);
      
      // Check if the provided session exists
      const sessionExists = this.sessions.some(s => s.key === session);
      console.log(`[MOCK] Session '${session}' exists: ${sessionExists}`);
      
      return true;
    }
  };

  // Helper function for simulating asynchronous operations - used in the code
  window.wait = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  console.log("LightDM mock initialized");
}

// Initialize everything when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // mockData(); /* Uncomment to test in your browser */
  setupBackground();
  updateTime();
  setupSettingsMenu();
  setupOnScreenConsole();
  fetchOSDataAndUpdateUI();
});

// Setup the on-screen console functionality
function setupOnScreenConsole() {
  const console = document.getElementById('on-screen-console');
  const consoleContent = document.getElementById('console-content');
  const consoleClear = document.getElementById('console-clear');
  const consoleToggle = document.getElementById('console-toggle');
  
  // Override console methods to capture logs
  const originalConsoleLog = window.console.log;
  const originalConsoleWarn = window.console.warn;
  const originalConsoleError = window.console.error;
  
  // Save console history
  const consoleHistory = [];
  const MAX_HISTORY = 100;
  
  // Toggle console visibility
  consoleToggle.addEventListener('click', () => {
    if (console.classList.contains('hidden')) {
      console.classList.remove('hidden');
      consoleToggle.textContent = '▼';
      consoleToggle.title = 'Hide console';
    } else {
      console.classList.add('hidden');
      consoleToggle.textContent = '▲';
      consoleToggle.title = 'Show console';
    }
  });
  
  // Add keyboard shortcut (Ctrl+`) to toggle console
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '`') {
      e.preventDefault();
      console.classList.toggle('hidden');
      if (console.classList.contains('hidden')) {
        consoleToggle.textContent = '▲';
        consoleToggle.title = 'Show console';
      } else {
        consoleToggle.textContent = '▼';
        consoleToggle.title = 'Hide console';
      }
    }
  });
  
  // Clear console
  consoleClear.addEventListener('click', () => {
    consoleContent.innerHTML = '';
    consoleHistory.length = 0;
  });
  
  // Format and add log to the console
  function addLogToConsole(type, ...args) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    // Convert arguments to string representation
    let logText = '';
    args.forEach(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          logText += JSON.stringify(arg) + ' ';
        } catch (e) {
          logText += arg + ' ';
        }
      } else {
        logText += arg + ' ';
      }
    });
    
    // Add timestamp
    const now = new Date();
    const timestamp = [
      now.getHours().toString().padStart(2, '0'),
      now.getMinutes().toString().padStart(2, '0'),
      now.getSeconds().toString().padStart(2, '0')
    ].join(':');
    
    entry.textContent = `[${timestamp}] ${logText}`;
    consoleContent.appendChild(entry);
    
    // Store in history
    consoleHistory.push({ type, text: logText, timestamp });
    if (consoleHistory.length > MAX_HISTORY) {
      consoleHistory.shift();
    }
    
    // Auto-scroll to bottom
    consoleContent.scrollTop = consoleContent.scrollHeight;
    
    // Show console if hidden (for errors)
    if (type === 'error' && console.classList.contains('hidden')) {
      console.classList.remove('hidden');
      consoleToggle.textContent = '▼';
      consoleToggle.title = 'Hide console';
    }
  }
  
  // Override console methods
  window.console.log = function(...args) {
    originalConsoleLog.apply(window.console, args);
    addLogToConsole('log', ...args);
  };
  
  window.console.warn = function(...args) {
    originalConsoleWarn.apply(window.console, args);
    addLogToConsole('warn', ...args);
  };
  
  window.console.error = function(...args) {
    originalConsoleError.apply(window.console, args);
    addLogToConsole('error', ...args);
  };
  
  // Show console with initial message
  console.classList.remove('hidden');
  window.console.log('On-screen console initialized. Press Ctrl+` to toggle visibility.');
}
