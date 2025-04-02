// Datos de la aplicación
const appData = {
    currentSection: 'usuarios',
    notifications: 3,
    users: [],
    settings: {
      nationality: 'es',
      usersPerLoad: 10
    },
    currentPage: 1
  };
  
  // Elementos del DOM
  const elements = {
    menuBtn: document.getElementById("menu-btn"),
    sidebar: document.getElementById("sidebar"),
    darkModeBtn: document.getElementById("dark-mode-btn"),
    notificationsBtn: document.getElementById("notifications-btn"),
    notificationBadge: document.querySelector(".notification-badge"),
    notificationsModal: document.getElementById("notifications-modal"),
    closeModalBtn: document.getElementById("close-modal"),
    menuItems: document.querySelectorAll(".menu-item"),
    sections: {
      dashboard: document.getElementById("dashboard-section"),
      usuarios: document.getElementById("usuarios-section"),
      configuracion: document.getElementById("configuracion-section")
    },
    stats: {
      totalUsers: document.getElementById("total-users"),
      adminUsers: document.getElementById("admin-users"),
      editorUsers: document.getElementById("editor-users")
    },
    searchInput: document.getElementById("user-search"),
    roleFilter: document.getElementById("role-filter"),
    loadMoreBtn: document.getElementById("load-more"),
    refreshBtn: document.getElementById("refresh-users"),
    settingsForm: document.getElementById("settings-form"),
    nationalitySelect: document.getElementById("user-nationality"),
    usersPerLoadInput: document.getElementById("users-per-load")
  };
  
  // Inicialización
  document.addEventListener("DOMContentLoaded", () => {
    initApp();
    loadUsers();
  });
  
  function initApp() {
    loadSettings();
    setupEventListeners();
    updateNotificationBadge();
  }
  
  function setupEventListeners() {
    // Menú móvil
    elements.menuBtn.addEventListener("click", toggleSidebar);
    
    // Dark mode
    elements.darkModeBtn.addEventListener("click", toggleDarkMode);
    
    // Notificaciones
    elements.notificationsBtn.addEventListener("click", showNotifications);
    elements.closeModalBtn.addEventListener("click", hideNotifications);
    
    // Menú principal
    elements.menuItems.forEach(item => {
      item.addEventListener("click", function(e) {
        e.preventDefault();
        changeSection(this.dataset.section);
      });
    });
    
    // Cerrar modal al hacer clic fuera
    elements.notificationsModal.addEventListener("click", function(e) {
      if (e.target === this) hideNotifications();
    });
    
    // Búsqueda y filtros
    elements.searchInput.addEventListener("input", filterUsers);
    elements.roleFilter.addEventListener("change", filterUsers);
    
    // Botones
    elements.loadMoreBtn.addEventListener("click", loadMoreUsers);
    elements.refreshBtn.addEventListener("click", refreshUsers);
    
    // Configuración
    elements.settingsForm.addEventListener("submit", saveSettings);
  }
  
  // Funciones de la API
  async function loadUsers() {
    try {
      showLoader();
      
      const response = await fetch(
        `https://randomuser.me/api/?results=${appData.settings.usersPerLoad}&nat=${appData.settings.nationality}`
      );
      const data = await response.json();
      
      appData.users = data.results.map(user => ({
        name: `${user.name.first} ${user.name.last}`,
        email: user.email,
        phone: user.phone,
        location: `${user.location.city}, ${user.location.country}`,
        picture: user.picture.large,
        role: getRandomRole(),
        color: getRoleColor(getRandomRole())
      }));
      
      renderUsers();
      updateStats();
      
    } catch (error) {
      showError("Error al cargar usuarios. Intenta nuevamente.");
      console.error("Error:", error);
    }
  }
  
  async function loadMoreUsers() {
    try {
      elements.loadMoreBtn.disabled = true;
      elements.loadMoreBtn.textContent = "Cargando...";
      
      const response = await fetch(
        `https://randomuser.me/api/?results=${appData.settings.usersPerLoad}&nat=${appData.settings.nationality}&page=${appData.currentPage + 1}`
      );
      const data = await response.json();
      
      const newUsers = data.results.map(user => ({
        name: `${user.name.first} ${user.name.last}`,
        email: user.email,
        phone: user.phone,
        location: `${user.location.city}, ${user.location.country}`,
        picture: user.picture.large,
        role: getRandomRole(),
        color: getRoleColor(getRandomRole())
      }));
      
      appData.users = [...appData.users, ...newUsers];
      appData.currentPage++;
      
      renderUsers();
      updateStats();
      
    } catch (error) {
      showError("Error al cargar más usuarios");
      console.error("Error:", error);
    } finally {
      elements.loadMoreBtn.disabled = false;
      elements.loadMoreBtn.textContent = "Cargar más usuarios";
    }
  }
  
  function refreshUsers() {
    appData.users = [];
    appData.currentPage = 1;
    loadUsers();
  }
  
  // Funciones de UI
  function renderUsers(usersToRender = appData.users) {
    const container = document.getElementById("users-container");
    
    if (usersToRender.length === 0) {
      container.innerHTML = `
        <div class="col-span-3 text-center py-8">
          <p>No se encontraron usuarios</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = usersToRender.map(user => `
      <div class="user-card bg-white dark:bg-gray-700 p-4 rounded-lg shadow hover:shadow-md">
        <div class="flex items-center space-x-4">
          <img src="${user.picture}" alt="${user.name}" class="w-12 h-12 rounded-full">
          <div>
            <h3 class="font-bold text-lg dark:text-white">${user.name}</h3>
            <a href="mailto:${user.email}" class="text-blue-600 dark:text-blue-400 hover:underline text-sm">${user.email}</a>
            <p class="text-gray-600 dark:text-gray-300 text-sm">${user.location}</p>
          </div>
        </div>
        <div class="flex justify-between items-center mt-2">
          <span class="inline-block px-3 py-1 ${user.color} rounded-full text-sm">
            ${user.role}
          </span>
          <a href="tel:${user.phone}" class="text-gray-600 dark:text-gray-300 hover:text-blue-500">
            📞
          </a>
        </div>
      </div>
    `).join("");
  }
  
  function filterUsers() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const roleFilter = elements.roleFilter.value;
    
    const filteredUsers = appData.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                           user.email.toLowerCase().includes(searchTerm);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
    
    renderUsers(filteredUsers);
  }
  
  // Funciones auxiliares
  function getRandomRole() {
    const roles = ['Admin', 'Editor', 'Usuario'];
    return roles[Math.floor(Math.random() * roles.length)];
  }
  
  function getRoleColor(role) {
    return {
      'Admin': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Editor': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Usuario': 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
    }[role];
  }
  
  function showLoader() {
    const container = document.getElementById("users-container");
    container.innerHTML = `
      <div class="col-span-3 text-center py-8">
        <p>Cargando usuarios...</p>
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mt-4"></div>
      </div>
    `;
  }
  
  function showError(message) {
    const container = document.getElementById("users-container");
    container.innerHTML = `
      <div class="col-span-3 text-center py-8 text-red-500">
        <p>${message}</p>
        <button onclick="location.reload()" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
          Reintentar
        </button>
      </div>
    `;
  }
  
  // Configuración
  function loadSettings() {
    const savedSettings = localStorage.getItem('panelSettings');
    if (savedSettings) {
      appData.settings = JSON.parse(savedSettings);
      elements.nationalitySelect.value = appData.settings.nationality;
      elements.usersPerLoadInput.value = appData.settings.usersPerLoad;
    }
  }
  
  function saveSettings(e) {
    e.preventDefault();
    
    appData.settings = {
      nationality: elements.nationalitySelect.value,
      usersPerLoad: elements.usersPerLoadInput.value
    };
    
    localStorage.setItem('panelSettings', JSON.stringify(appData.settings));
    showNotification("Configuración guardada correctamente");
    refreshUsers();
  }
  
  // Otras funciones
  function toggleSidebar() {
    elements.sidebar.classList.toggle("hidden");
    elements.menuBtn.setAttribute(
      "aria-expanded",
      elements.sidebar.classList.contains("hidden") ? "false" : "true"
    );
  }
  
  function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem('darkMode', document.body.classList.contains("dark-mode"));
  }
  
  function showNotifications() {
    elements.notificationsModal.classList.remove("hidden");
    appData.notifications = 0;
    updateNotificationBadge();
  }
  
  function hideNotifications() {
    elements.notificationsModal.classList.add("hidden");
  }
  
  function updateNotificationBadge() {
    if (appData.notifications > 0) {
      elements.notificationBadge.textContent = appData.notifications;
      elements.notificationBadge.classList.remove("hidden");
    } else {
      elements.notificationBadge.classList.add("hidden");
    }
  }
  
  function changeSection(section) {
    elements.menuItems.forEach(item => {
      item.classList.toggle("active", item.dataset.section === section);
    });
    
    Object.keys(elements.sections).forEach(key => {
      elements.sections[key].classList.toggle("hidden", key !== section);
    });
    
    if (section === 'dashboard') updateStats();
    appData.currentSection = section;
  }
  
  function updateStats() {
    elements.stats.totalUsers.textContent = appData.users.length;
    elements.stats.adminUsers.textContent = appData.users.filter(u => u.role === 'Admin').length;
    elements.stats.editorUsers.textContent = appData.users.filter(u => u.role === 'Editor').length;
  }
  
  function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg";
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  // Cargar dark mode si estaba activo
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add("dark-mode");
  }
