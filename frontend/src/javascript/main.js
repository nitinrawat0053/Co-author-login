/**
 * SDG Co-Author Platform - Main JavaScript File
 * Handles authentication, role selection, and UI interactions
 *
 * @author SDG Policy Team
 * @version 1.0.0
 * @description Main application logic for the co-author login system
 */

// =============================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// =============================================================================

let selectedRole = "lead-author";
let isLoading = false;

const CONFIG = {
  roles: {
    "lead-author": "Lead Author Workspace",
    "co-author": "Co-Author Workspace",
    reviewer: "Review Dashboard",
    researcher: "Research Tools",
  },
  storage: {
    rememberEmailKey: "sdg_remember_email",
    rolePreferenceKey: "sdg_preferred_role",
  },
  api: {
    timeout: 2000,
    retryAttempts: 3,
  },
};

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

/**
 * Initialize the application with all necessary setup
 */
function initializeApp() {
  try {
    setupEventListeners();
    setupAccessCodeFormatter();
    loadStoredPreferences();
    animateOnLoad();

    console.log("SDG Co-Author Platform initialized successfully");
  } catch (error) {
    console.error("Failed to initialize application:", error);
    showError("Application failed to initialize. Please refresh the page.");
  }
}

/**
 * Setup event listeners for various UI elements
 */
function setupEventListeners() {
  // Form submission
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleCredentialLogin);
  }

  // Access code input formatting
  const accessCodeInput = document.getElementById("accessCode");
  if (accessCodeInput) {
    accessCodeInput.addEventListener("input", formatAccessCode);
    accessCodeInput.addEventListener("paste", handleAccessCodePaste);
    accessCodeInput.addEventListener("keyup", handleAccessCodeComplete);
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts);

  // Form validation on input
  setupFormValidation();

  // Role button keyboard navigation
  setupRoleButtonNavigation();

  // Window events
  window.addEventListener("beforeunload", handleBeforeUnload);
  window.addEventListener("online", handleOnlineStatus);
  window.addEventListener("offline", handleOfflineStatus);
}

// =============================================================================
// ROLE SELECTION FUNCTIONALITY
// =============================================================================

/**
 * Handle role selection
 * @param {HTMLElement} button - The clicked role button
 * @param {string} role - The selected role
 */
function selectRole(button, role) {
  if (isLoading) return;

  try {
    // Update UI state
    updateRoleSelection(button, role);

    // Store preference
    storeRolePreference(role);

    // Update form elements
    updateUIForRole(role);

    // Log selection
    console.log("Role selected:", role);

    // Provide accessibility feedback
    announceToScreenReader(`Selected role: ${role.replace("-", " ")}`);
  } catch (error) {
    console.error("Error selecting role:", error);
    showError("Failed to select role. Please try again.");
  }
}

/**
 * Update role selection UI
 * @param {HTMLElement} selectedButton - The selected button
 * @param {string} role - The selected role
 */
function updateRoleSelection(selectedButton, role) {
  // Remove active class from all buttons
  document.querySelectorAll(".role-btn").forEach((btn) => {
    btn.classList.remove("active");
    btn.setAttribute("aria-pressed", "false");
  });

  // Add active class to selected button
  selectedButton.classList.add("active");
  selectedButton.setAttribute("aria-pressed", "true");
  selectedRole = role;

  // Visual feedback animation
  selectedButton.style.transform = "scale(0.95)";
  setTimeout(() => {
    selectedButton.style.transform = "";
  }, 150);
}

/**
 * Update UI elements based on selected role
 * @param {string} role - The selected role
 */
function updateUIForRole(role) {
  const submitBtn = document.getElementById("submitBtn");
  const roleDescription = CONFIG.roles[role];

  if (submitBtn && roleDescription) {
    const loadingElement = submitBtn.querySelector(".loading");
    submitBtn.innerHTML = `Access ${roleDescription}`;
    if (loadingElement) {
      submitBtn.appendChild(loadingElement);
    }
  }
}

// =============================================================================
// AUTHENTICATION HANDLERS
// =============================================================================

/**
 * Handle institutional SSO login
 */
function handleInstitutionalLogin() {
  if (isLoading) return;

  try {
    console.log("Initiating institutional SSO login");
    showLoadingState("institutional");

    // Simulate SSO authentication process
    setTimeout(() => {
      hideLoadingState();
      if (Math.random() > 0.3) {
        // 70% success rate for demo
        showSuccess("Institutional access verified! Welcome to the platform.");
        setTimeout(() => {
          redirectToWorkspace();
        }, 2000);
      } else {
        showError(
          "Institutional login failed. Please contact your IT administrator."
        );
      }
    }, 2500);
  } catch (error) {
    console.error("Institutional login error:", error);
    hideLoadingState();
    showError("Login service temporarily unavailable. Please try again.");
  }
}

/**
 * Handle OAuth authentication
 * @param {string} provider - OAuth provider (google, microsoft, etc.)
 */
function handleOAuth(provider) {
  if (isLoading) return;

  try {
    console.log(`Initiating OAuth with ${provider} for role: ${selectedRole}`);
    showLoadingState(provider);

    // Validate provider
    if (!["google", "microsoft"].includes(provider)) {
      throw new Error("Invalid OAuth provider");
    }

    // Simulate OAuth flow
    setTimeout(() => {
      hideLoadingState();
      if (Math.random() > 0.2) {
        // 80% success rate for demo
        showSuccess(
          `Successfully authenticated with ${provider}! Setting up your ${selectedRole} workspace...`
        );

        // Store successful login method
        storeLoginMethod(provider);

        setTimeout(() => {
          redirectToWorkspace();
        }, 2000);
      } else {
        showError(
          `${provider} authentication failed. Please try again or contact support.`
        );
      }
    }, 2000);
  } catch (error) {
    console.error(`OAuth ${provider} error:`, error);
    hideLoadingState();
    showError("Authentication service error. Please try again.");
  }
}

/**
 * Handle credential-based login
 * @param {Event} event - Form submission event
 */
function handleCredentialLogin(event) {
  event.preventDefault();

  if (isLoading) return;

  try {
    const formData = getFormData();

    console.log("Credential login attempt:", {
      email: formData.email,
      role: selectedRole,
      accessCodeLength: formData.accessCode.length,
    });

    // Validate form data
    if (!validateFormData(formData)) {
      return;
    }

    showFormLoadingState();

    // Simulate authentication process
    setTimeout(() => {
      hideFormLoadingState();

      // Simulate access code validation
      if (isValidAccessCode(formData.accessCode)) {
        showSuccess(
          `Access granted! Welcome ${formData.email}. Preparing your ${selectedRole} workspace...`
        );

        // Save remember me preference
        if (formData.remember) {
          storeRememberPreference(formData.email);
        }

        // Store successful login
        storeLoginMethod("credentials");

        setTimeout(() => {
          redirectToWorkspace();
        }, 2000);
      } else {
        showError(
          "Invalid access code. Please check your 6-digit project code and try again."
        );
      }
    }, 1800);
  } catch (error) {
    console.error("Credential login error:", error);
    hideFormLoadingState();
    showError("Login failed. Please check your information and try again.");
  }
}

// =============================================================================
// FORM DATA HANDLING
// =============================================================================

/**
 * Get form data from inputs
 * @returns {Object} Form data object
 */
function getFormData() {
  return {
    email: document.getElementById("email")?.value.trim() || "",
    password: document.getElementById("password")?.value || "",
    accessCode: document.getElementById("accessCode")?.value.trim() || "",
    remember: document.getElementById("remember")?.checked || false,
  };
}

/**
 * Validate form data
 * @param {Object} formData - Form data to validate
 * @returns {boolean} Whether form data is valid
 */
function validateFormData(formData) {
  const errors = [];

  if (!formData.email || !isValidEmail(formData.email)) {
    errors.push("Please enter a valid email address.");
  }

  if (!formData.password || formData.password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  if (!formData.accessCode || !isValidAccessCode(formData.accessCode)) {
    errors.push("Please enter a valid 6-digit access code.");
  }

  if (errors.length > 0) {
    showError(errors.join(" "));
    return false;
  }

  return true;
}

/**
 * Setup real-time form validation
 */
function setupFormValidation() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const accessCodeInput = document.getElementById("accessCode");

  if (emailInput) {
    emailInput.addEventListener("blur", validateEmailField);
    emailInput.addEventListener("input", clearFieldError);
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", validatePasswordField);
  }

  if (accessCodeInput) {
    accessCodeInput.addEventListener("input", validateAccessCodeField);
  }
}

/**
 * Validate email field
 * @param {Event} event - Input event
 */
function validateEmailField(event) {
  const email = event.target.value.trim();
  const isValid = isValidEmail(email);

  updateFieldValidation(event.target, isValid);

  if (email && !isValid) {
    setFieldError(event.target, "Please enter a valid email address");
  }
}

/**
 * Validate password field
 * @param {Event} event - Input event
 */
function validatePasswordField(event) {
  const password = event.target.value;
  const isValid = password.length >= 6;

  updateFieldValidation(event.target, isValid);
}

/**
 * Validate access code field
 * @param {Event} event - Input event
 */
function validateAccessCodeField(event) {
  const accessCode = event.target.value.trim();
  const isValid = isValidAccessCode(accessCode) || accessCode.length < 6;

  updateFieldValidation(event.target, isValid);
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if access code is valid
 * @param {string} accessCode - Access code to validate
 * @returns {boolean} Whether access code is valid
 */
function isValidAccessCode(accessCode) {
  return (
    /^\d{6}$/.test(accessCode) &&
    accessCode !== "000000" &&
    accessCode !== "123456"
  );
}

/**
 * Update field validation visual state
 * @param {HTMLElement} field - Input field
 * @param {boolean} isValid - Whether field is valid
 */
function updateFieldValidation(field, isValid) {
  field.classList.remove("valid", "invalid");

  if (field.value) {
    field.classList.add(isValid ? "valid" : "invalid");
  }
}

/**
 * Set field error message
 * @param {HTMLElement} field - Input field
 * @param {string} message - Error message
 */
function setFieldError(field, message) {
  clearFieldError({ target: field });

  const errorElement = document.createElement("div");
  errorElement.className = "field-error";
  errorElement.textContent = message;
  errorElement.id = `${field.id}-error`;

  field.parentNode.appendChild(errorElement);
  field.setAttribute("aria-describedby", errorElement.id);
}

/**
 * Clear field error message
 * @param {Event} event - Input event
 */
function clearFieldError(event) {
  const field = event.target;
  const existingError = field.parentNode.querySelector(".field-error");

  if (existingError) {
    existingError.remove();
    field.removeAttribute("aria-describedby");
  }
}

// =============================================================================
// INPUT FORMATTING
// =============================================================================

/**
 * Format access code input (numbers only, max 6 digits)
 * @param {Event} event - Input event
 */
function formatAccessCode(event) {
  let value = event.target.value.replace(/\D/g, "");
  if (value.length > 6) {
    value = value.substring(0, 6);
  }
  event.target.value = value;
}

/**
 * Handle access code paste event
 * @param {Event} event - Paste event
 */
function handleAccessCodePaste(event) {
  setTimeout(() => {
    formatAccessCode(event);
  }, 0);
}

/**
 * Handle access code completion
 * @param {Event} event - Keyup event
 */
function handleAccessCodeComplete(event) {
  if (event.target.value.length === 6) {
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
      submitBtn.focus();
    }
  }
}

/**
 * Setup access code input formatting
 */
function setupAccessCodeFormatter() {
  const accessCodeInput = document.getElementById("accessCode");
  if (accessCodeInput) {
    // Add pattern attribute for mobile keyboards
    accessCodeInput.setAttribute("pattern", "\\d{6}");
    accessCodeInput.setAttribute("inputmode", "numeric");
  }
}

// =============================================================================
// KEYBOARD AND ACCESSIBILITY
// =============================================================================

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardShortcuts(event) {
  // Ctrl/Cmd + Enter to submit form
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    const form = document.querySelector(".login-form");
    if (form && !isLoading) {
      form.dispatchEvent(new Event("submit", { bubbles: true }));
    }
  }

  // Escape key to clear error messages
  if (event.key === "Escape") {
    hideMessages();
  }

  // Arrow keys for role navigation
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
    handleRoleNavigation(event);
  }
}

/**
 * Setup role button keyboard navigation
 */
function setupRoleButtonNavigation() {
  const roleButtons = document.querySelectorAll(".role-btn");
  roleButtons.forEach((button, index) => {
    button.setAttribute("tabindex", index === 0 ? "0" : "-1");
    button.addEventListener("keydown", handleRoleButtonKeydown);
  });
}

/**
 * Handle role button keydown events
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleRoleButtonKeydown(event) {
  const buttons = Array.from(document.querySelectorAll(".role-btn"));
  const currentIndex = buttons.indexOf(event.target);
  let nextIndex = currentIndex;

  switch (event.key) {
    case "ArrowLeft":
    case "ArrowUp":
      event.preventDefault();
      nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
      break;
    case "ArrowRight":
    case "ArrowDown":
      event.preventDefault();
      nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      event.target.click();
      return;
  }

  if (nextIndex !== currentIndex) {
    buttons[currentIndex].setAttribute("tabindex", "-1");
    buttons[nextIndex].setAttribute("tabindex", "0");
    buttons[nextIndex].focus();
  }
}

/**
 * Handle role navigation with arrow keys
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleRoleNavigation(event) {
  if (
    document.activeElement &&
    document.activeElement.classList.contains("role-btn")
  ) {
    // Already handled by setupRoleButtonNavigation
    return;
  }
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// =============================================================================
// LOADING STATES
// =============================================================================

/**
 * Show loading state for OAuth buttons
 * @param {string} provider - Provider name
 */
function showLoadingState(provider) {
  isLoading = true;
  const btn = document.querySelector(`.${provider}`);
  if (btn) {
    btn.style.opacity = "0.7";
    btn.style.pointerEvents = "none";
    btn.classList.add("loading-state");
    btn.setAttribute("aria-busy", "true");

    const originalText = btn.innerHTML;
    btn.setAttribute("data-original", originalText);

    const loadingText = originalText
      .replace("Continue with", "Connecting to")
      .replace("Institutional SSO", "Connecting to SSO");
    btn.innerHTML = loadingText;
  }
}

/**
 * Hide loading state for OAuth buttons
 */
function hideLoadingState() {
  isLoading = false;
  const btns = document.querySelectorAll(".auth-btn");
  btns.forEach((btn) => {
    btn.style.opacity = "1";
    btn.style.pointerEvents = "auto";
    btn.classList.remove("loading-state");
    btn.setAttribute("aria-busy", "false");

    const originalText = btn.getAttribute("data-original");
    if (originalText) {
      btn.innerHTML = originalText;
      btn.removeAttribute("data-original");
    }
  });
}

/**
 * Show loading state for form submission
 */
function showFormLoadingState() {
  isLoading = true;
  const loading = document.getElementById("loginLoading");
  const submitBtn = document.getElementById("submitBtn");

  if (loading) loading.style.display = "inline-block";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");
  }
}

/**
 * Hide loading state for form submission
 */
function hideFormLoadingState() {
  isLoading = false;
  const loading = document.getElementById("loginLoading");
  const submitBtn = document.getElementById("submitBtn");

  if (loading) loading.style.display = "none";
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.setAttribute("aria-busy", "false");
  }
}

// =============================================================================
// MESSAGE HANDLING
// =============================================================================

/**
 * Show success message
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
  const successMsg = document.getElementById("successMessage");
  const errorMsg = document.getElementById("errorMessage");

  if (errorMsg) errorMsg.style.display = "none";
  if (successMsg) {
    successMsg.textContent = message;
    successMsg.style.display = "block";
    successMsg.setAttribute("role", "status");
    successMsg.setAttribute("aria-live", "polite");

    // Scroll to message if needed
    successMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Announce to screen readers
    announceToScreenReader(message);
  }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  const successMsg = document.getElementById("successMessage");
  const errorMsg = document.getElementById("errorMessage");

  if (successMsg) successMsg.style.display = "none";
  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.style.display = "block";
    errorMsg.setAttribute("role", "alert");
    errorMsg.setAttribute("aria-live", "assertive");

    // Scroll to message if needed
    errorMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Announce to screen readers
    announceToScreenReader(`Error: ${message}`);
  }
}

/**
 * Hide all messages
 */
function hideMessages() {
  const successMsg = document.getElementById("successMessage");
  const errorMsg = document.getElementById("errorMessage");

  if (successMsg) successMsg.style.display = "none";
  if (errorMsg) errorMsg.style.display = "none";
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Handle forgot password
 */
function handleForgotPassword() {
  const email = document.getElementById("email")?.value.trim();
  let message =
    "Password reset instructions will be sent to your registered email address.";

  if (email && isValidEmail(email)) {
    message = `Password reset instructions will be sent to ${email}.`;
  }

  message +=
    "\n\nIf you need immediate assistance, please contact your project coordinator.";

  if (confirm(message + "\n\nProceed with password reset?")) {
    console.log("Password reset requested for:", email || "unknown email");
    showSuccess(
      "Password reset request submitted. Check your email for instructions."
    );
  }
}

/**
 * Show terms of service
 */
function showTerms() {
  const terms = `Terms of Service:

1. This platform is for authorized SDG policy collaboration only.
2. Users must maintain confidentiality of shared documents.
3. All contributions are subject to review and approval.
4. Misuse of access will result in account suspension.
5. Data protection and privacy regulations apply.

For full terms and conditions, contact your administrator.`;

  alert(terms);
}

/**
 * Show privacy policy
 */
function showPrivacy() {
  const privacy = `Privacy Policy:

• We collect minimal data necessary for platform operation
• Your contributions are stored securely and encrypted
• Data is shared only with authorized project members
• We comply with GDPR and data protection regulations
• Session data is automatically cleared on logout

For detailed privacy information, contact your administrator.`;

  alert(privacy);
}

// =============================================================================
// STORAGE AND PREFERENCES
// =============================================================================

/**
 * Store role preference
 * @param {string} role - Selected role
 */
function storeRolePreference(role) {
  try {
    localStorage.setItem(CONFIG.storage.rolePreferenceKey, role);
  } catch (error) {
    console.warn("Failed to store role preference:", error);
  }
}

/**
 * Store remember preference
 * @param {string} email - User email
 */
function storeRememberPreference(email) {
  try {
    localStorage.setItem(CONFIG.storage.rememberEmailKey, email);
  } catch (error) {
    console.warn("Failed to store remember preference:", error);
  }
}

/**
 * Store login method for analytics
 * @param {string} method - Login method used
 */
function storeLoginMethod(method) {
  try {
    const loginData = {
      method: method,
      role: selectedRole,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem("sdg_login_data", JSON.stringify(loginData));
  } catch (error) {
    console.warn("Failed to store login method:", error);
  }
}

/**
 * Load stored preferences
 */
function loadStoredPreferences() {
  try {
    // Load remembered email
    const rememberedEmail = localStorage.getItem(
      CONFIG.storage.rememberEmailKey
    );
    if (rememberedEmail) {
      const emailInput = document.getElementById("email");
      const rememberCheckbox = document.getElementById("remember");

      if (emailInput) emailInput.value = rememberedEmail;
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }

    // Load preferred role
    const preferredRole = localStorage.getItem(
      CONFIG.storage.rolePreferenceKey
    );
    if (preferredRole && CONFIG.roles[preferredRole]) {
      const roleButton = document.querySelector(
        `[onclick="selectRole(this, '${preferredRole}')"]`
      );
      if (roleButton) {
        selectRole(roleButton, preferredRole);
      }
    }
  } catch (error) {
    console.warn("Failed to load stored preferences:", error);
  }
}

// =============================================================================
// NETWORK AND BROWSER EVENTS
// =============================================================================

/**
 * Handle online status
 */
function handleOnlineStatus() {
  console.log("Connection restored");
  hideMessages();

  const offlineIndicator = document.querySelector(".offline-indicator");
  if (offlineIndicator) {
    offlineIndicator.remove();
  }
}

/**
 * Handle offline status
 */
function handleOfflineStatus() {
  console.warn("Connection lost");
  showError("No internet connection. Please check your network and try again.");

  // Add offline indicator
  if (!document.querySelector(".offline-indicator")) {
    const indicator = document.createElement("div");
    indicator.className = "offline-indicator";
    indicator.textContent = "📵 Offline";
    indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 9999;
        `;
    document.body.appendChild(indicator);
  }
}

/**
 * Handle before page unload
 * @param {Event} event - Before unload event
 */
function handleBeforeUnload(event) {
  if (isLoading) {
    event.preventDefault();
    event.returnValue =
      "Authentication in progress. Are you sure you want to leave?";
    return event.returnValue;
  }
}

// =============================================================================
// NAVIGATION AND REDIRECTION
// =============================================================================

/**
 * Redirect to workspace based on selected role
 */
function redirectToWorkspace() {
  console.log(`Redirecting to ${selectedRole} workspace...`);

  const workspaceUrls = {
    "lead-author": "/workspace/lead-author",
    "co-author": "/workspace/co-author",
    reviewer: "/workspace/reviewer",
    researcher: "/workspace/researcher",
  };

  const targetUrl = workspaceUrls[selectedRole] || "/workspace/dashboard";

  // For demo purposes, show confirmation instead of actual redirect
  const proceedToWorkspace = confirm(
    `Ready to access your ${selectedRole} workspace!\n\n` +
      `Target: ${targetUrl}\n\n` +
      "In production, this would redirect automatically.\n" +
      "Click OK to simulate the redirect."
  );

  if (proceedToWorkspace) {
    console.log(`Simulating redirect to: ${targetUrl}`);
    showSuccess(`Welcome to your ${selectedRole} workspace!`);

    // In production, uncomment the line below:
    // window.location.href = targetUrl;
  }
}

// =============================================================================
// ANIMATIONS AND VISUAL EFFECTS
// =============================================================================

/**
 * Animate elements on page load
 */
function animateOnLoad() {
  const container = document.querySelector(".login-container");
  if (container) {
    container.style.opacity = "0";
    container.style.transform = "translateY(20px)";

    setTimeout(() => {
      container.style.transition = "all 0.6s ease";
      container.style.opacity = "1";
      container.style.transform = "translateY(0)";
    }, 100);
  }

  // Animate role buttons with stagger effect
  const roleButtons = document.querySelectorAll(".role-btn");
  roleButtons.forEach((button, index) => {
    button.style.opacity = "0";
    button.style.transform = "translateY(10px)";

    setTimeout(() => {
      button.style.transition = "all 0.4s ease";
      button.style.opacity = "1";
      button.style.transform = "translateY(0)";
    }, 200 + index * 100);
  });

  // Animate form elements
  const formElements = document.querySelectorAll(".form-group");
  formElements.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transform = "translateX(-10px)";

    setTimeout(() => {
      element.style.transition = "all 0.4s ease";
      element.style.opacity = "1";
      element.style.transform = "translateX(0)";
    }, 400 + index * 100);
  });
}

// =============================================================================
// ERROR HANDLING AND DEBUGGING
// =============================================================================

/**
 * Global error handler
 */
window.addEventListener("error", function (event) {
  console.error("Global error:", event.error);

  if (!document.querySelector('.error-message[style*="block"]')) {
    showError(
      "An unexpected error occurred. Please refresh the page and try again."
    );
  }
});

/**
 * Promise rejection handler
 */
window.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled promise rejection:", event.reason);
  event.preventDefault();
});

// =============================================================================
// DEVELOPMENT AND TESTING UTILITIES
// =============================================================================

/**
 * Development mode utilities (only available in development)
 */
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  window.SDGDebug = {
    selectRole: (role) => {
      const button = document.querySelector(
        `[onclick="selectRole(this, '${role}')"]`
      );
      if (button) selectRole(button, role);
    },
    fillTestData: () => {
      document.getElementById("email").value = "test@sdgpolicy.org";
      document.getElementById("password").value = "testpassword123";
      document.getElementById("accessCode").value = "123789";
    },
    triggerAuth: (provider) => {
      if (provider === "credentials") {
        document
          .querySelector(".login-form")
          .dispatchEvent(new Event("submit"));
      } else {
        handleOAuth(provider);
      }
    },
    clearStorage: () => {
      localStorage.clear();
      sessionStorage.clear();
      console.log("Storage cleared");
    },
  };

  console.log("Development utilities available: window.SDGDebug");
}

// =============================================================================
// EXPORT FOR TESTING (Node.js environment)
// =============================================================================

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    selectRole,
    handleOAuth,
    handleInstitutionalLogin,
    isValidEmail,
    isValidAccessCode,
    validateFormData,
    formatAccessCode,
  };
}
