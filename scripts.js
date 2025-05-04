// Check for background files
function setupBackground() {
  const backgroundFile = "background.mp4"
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
      pfp.src = user.image || 'pfp.jpeg'; // Use default if no image
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
      pfpElem.src = 'pfp.jpeg'; // Default image
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
    if (window.lightdm.is_authenticated) {
      const selectedSessionName = sessionSelector.value;
      const selectedSession = availableSessions.find(s => s.name == selectedSessionName);
      document.querySelector("#main-screen").classList.add("invisible");
      await window.wait(1000);
      window.lightdm.start_session(selectedSession.key ?? null);
    }
    else {
      passwordInputElem.disabled = false;
      passwordInputElem.focus();
      passwordInputElem.select();
    }
  });

  passwordInputElem.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      window.lightdm.cancel_authentication();
      window.lightdm.authenticate(selectedUser.username ?? null);
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
  const mockUsers = [{
      username: "user1",
      display_name: "Patrick Bateman",
      image: "pfp.jpeg",
      session: "gnome"
    },
    {
      username: "user2",
      display_name: "User Two",
      image: "pfp.jpeg",
      session: "kde-plasma"
    },
    {
      username: "admin",
      display_name: "Administrator",
      image: "pfp.jpeg",
      session: "xfce"
    },
    {
      username: "guest",
      display_name: "Guest User",
      image: "pfp.jpeg",
      session: "gnome"
    },
    {
      username: "dev",
      display_name: "Developer",
      image: "pfp.jpeg",
      session: "xfce"
    },
    {
      username: "test",
      display_name: "Test User",
      image: "pfp.jpeg",
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
      console.log(`Authenticating user: ${username}`);
      return true;
    },

    respond: function (password) {
      console.log("Password received, validating...");

      // Accept only "password" as the valid password for all users
      this.is_authenticated = (password === "password");

      if (this.is_authenticated) {
        console.log("Authentication successful");
      }
      else {
        console.log("Authentication failed");
      }

      this.authentication_complete.emit();
    },

    cancel_authentication: function () {
      console.log("Authentication cancelled");
      this.is_authenticated = false;
      return true;
    },

    // Session methods
    start_session: function (session_key) {
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
  fetchOSDataAndUpdateUI();
});