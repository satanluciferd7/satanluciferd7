/* ===================================
   NEPAL PORTAL - ROLE & PERMISSION SYSTEM
   User roles: Guest, User, Moderator, Admin, Owner
   =================================== */

'use strict';

/* ===== USER ROLES & PERMISSIONS ===== */
const UserRoles = {
  GUEST: 'guest',           // Not logged in
  USER: 'user',             // Regular registered user
  MODERATOR: 'moderator',   // Can moderate content
  ADMIN: 'admin',           // Full admin access
  OWNER: 'owner'            // Site owner - full control
};

const Permissions = {
  // Define what each role can do
  [UserRoles.GUEST]: [
    'view_posts',
    'view_problems',
    'view_news',
    'search',
    'view_guides'
  ],

  [UserRoles.USER]: [
    'view_posts',
    'view_problems',
    'view_news',
    'search',
    'view_guides',
    'create_post',
    'create_problem',
    'create_comment',
    'create_news',
    'upvote_post',
    'downvote_post',
    'flag_content',
    'save_offline',
    'edit_own_profile'
  ],

  [UserRoles.MODERATOR]: [
    'view_posts',
    'view_problems',
    'view_news',
    'search',
    'view_guides',
    'create_post',
    'create_problem',
    'create_comment',
    'create_news',
    'upvote_post',
    'downvote_post',
    'flag_content',
    'save_offline',
    'edit_own_profile',
    'moderate_posts',        // Can delete/hide posts
    'moderate_comments',     // Can delete comments
    'moderate_problems',     // Can verify problems
    'ban_users',             // Can restrict users
    'view_reports',          // See flagged content
    'resolve_flags'          // Mark flags as handled
  ],

  [UserRoles.ADMIN]: [
    'view_posts',
    'view_problems',
    'view_news',
    'search',
    'view_guides',
    'create_post',
    'create_problem',
    'create_comment',
    'create_news',
    'upvote_post',
    'downvote_post',
    'flag_content',
    'save_offline',
    'edit_own_profile',
    'moderate_posts',
    'moderate_comments',
    'moderate_problems',
    'ban_users',
    'view_reports',
    'resolve_flags',
    'access_admin_panel',    // Full admin access
    'manage_users',          // Change user roles
    'manage_content',        // Edit/delete any content
    'view_analytics',        // See all analytics
    'manage_settings',       // Change site settings
    'verify_officials',      // Mark as government official
    'manage_moderators'      // Assign moderator roles
  ],

  [UserRoles.OWNER]: [
    // Owner has ALL permissions
    'view_posts',
    'view_problems',
    'view_news',
    'search',
    'view_guides',
    'create_post',
    'create_problem',
    'create_comment',
    'create_news',
    'upvote_post',
    'downvote_post',
    'flag_content',
    'save_offline',
    'edit_own_profile',
    'moderate_posts',
    'moderate_comments',
    'moderate_problems',
    'ban_users',
    'view_reports',
    'resolve_flags',
    'access_admin_panel',
    'manage_users',
    'manage_content',
    'view_analytics',
    'manage_settings',
    'verify_officials',
    'manage_moderators',
    'delete_accounts',       // Delete user accounts
    'access_server_logs',    // See server logs
    'manage_database',       // Full database access
    'system_configuration'   // Change system settings
  ]
};

/* ===== RBAC SYSTEM ===== */
const RBACSystem = {
  // Get current user role
  getCurrentRole() {
    const session = JSON.parse(localStorage.getItem('np_session') || 'null');
    if (!session) return UserRoles.GUEST;
    
    // Check user role
    const userRoles = JSON.parse(localStorage.getItem('np_user_roles') || '{}');
    return userRoles[session.email] || UserRoles.USER;
  },

  // Check if current user has permission
  hasPermission(permission) {
    const role = this.getCurrentRole();
    const rolePermissions = Permissions[role] || [];
    return rolePermissions.includes(permission);
  },

  // Check if current user has role
  hasRole(role) {
    return this.getCurrentRole() === role;
  },

  // Check multiple permissions (AND logic)
  hasAllPermissions(...permissions) {
    return permissions.every(p => this.hasPermission(p));
  },

  // Check multiple permissions (OR logic)
  hasAnyPermission(...permissions) {
    return permissions.some(p => this.hasPermission(p));
  },

  // Get all permissions for current role
  getAllPermissions() {
    const role = this.getCurrentRole();
    return Permissions[role] || [];
  },

  // Assign role to user
  assignRole(email, role) {
    const session = JSON.parse(localStorage.getItem('np_session') || 'null');
    const currentRole = this.getCurrentRole();

    // Only Owner/Admin can assign roles
    if (!['owner', 'admin'].includes(currentRole)) {
      console.error('Only Owner/Admin can assign roles');
      return false;
    }

    const userRoles = JSON.parse(localStorage.getItem('np_user_roles') || '{}');
    userRoles[email] = role;
    localStorage.setItem('np_user_roles', JSON.stringify(userRoles));

    // Log action
    this.logAction(`Assigned role ${role} to ${email}`);
    return true;
  },

  // Get user role
  getUserRole(email) {
    const userRoles = JSON.parse(localStorage.getItem('np_user_roles') || '{}');
    return userRoles[email] || UserRoles.USER;
  },

  // Get all users with roles
  getAllUsers() {
    const userRoles = JSON.parse(localStorage.getItem('np_user_roles') || '{}');
    return Object.entries(userRoles).map(([email, role]) => ({ email, role }));
  },

  // Log actions for audit
  logAction(action) {
    const session = JSON.parse(localStorage.getItem('np_session') || 'null');
    const logs = JSON.parse(localStorage.getItem('np_audit_logs') || '[]');
    
    logs.push({
      timestamp: new Date().toISOString(),
      user: session?.email || 'unknown',
      action
    });

    // Keep only last 1000 logs
    if (logs.length > 1000) logs = logs.slice(-1000);
    
    localStorage.setItem('np_audit_logs', JSON.stringify(logs));
  }
};

/* ===== UI HELPERS ===== */
// Show element only if user has permission
function showIfPermitted(elementId, permission) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = RBACSystem.hasPermission(permission) ? 'block' : 'none';
  }
}

// Hide element if user doesn't have permission
function hideIfNotPermitted(elementId, permission) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = !RBACSystem.hasPermission(permission) ? 'none' : 'block';
  }
}

// Disable button if no permission
function disableIfNotPermitted(buttonId, permission) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = !RBACSystem.hasPermission(permission);
    if (button.disabled) {
      button.style.opacity = '0.5';
      button.style.cursor = 'not-allowed';
      button.title = 'You do not have permission';
    }
  }
}

// Check permission before action
function requirePermission(permission, actionName = 'Action') {
  if (!RBACSystem.hasPermission(permission)) {
    showAlert(`You don't have permission to ${actionName}`, 'error');
    return false;
  }
  return true;
}

// Get role badge
function getRoleBadge(email = null) {
  const role = email ? RBACSystem.getUserRole(email) : RBACSystem.getCurrentRole();
  
  const badges = {
    [UserRoles.GUEST]: { icon: '👤', color: '#8b949e', label: 'Guest' },
    [UserRoles.USER]: { icon: '👤', color: '#3399ff', label: 'Member' },
    [UserRoles.MODERATOR]: { icon: '⛔', color: '#f4a300', label: 'Moderator' },
    [UserRoles.ADMIN]: { icon: '🛡️', color: '#ff6b6b', label: 'Admin' },
    [UserRoles.OWNER]: { icon: '👑', color: '#fbbf24', label: 'Owner' }
  };

  return badges[role] || badges[UserRoles.USER];
}

// Display role badge in HTML
function displayRoleBadge(email = null) {
  const badge = getRoleBadge(email);
  return `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 50px; background: rgba(${hex2rgb(badge.color)}, 0.15); color: ${badge.color}; font-size: 0.75rem; font-weight: 600;">
    ${badge.icon} ${badge.label}
  </span>`;
}

// Helper: Convert hex to rgb
function hex2rgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

/* ===== VERIFICATION SYSTEM ===== */
const Verification = {
  // Verify user as government official
  verifyOfficial(email, position, organization) {
    // Only Owner/Admin can verify officials
    if (!RBACSystem.hasPermission('verify_officials')) {
      console.error('You cannot verify officials');
      return false;
    }

    const verified = JSON.parse(localStorage.getItem('np_verified_officials') || '{}');
    verified[email] = {
      position,
      organization,
      verifiedAt: new Date().toISOString(),
      verifiedBy: JSON.parse(localStorage.getItem('np_session')).email
    };

    localStorage.setItem('np_verified_officials', JSON.stringify(verified));
    RBACSystem.logAction(`Verified official: ${email} as ${position} at ${organization}`);
    return true;
  },

  // Check if user is verified official
  isOfficialVerified(email) {
    const verified = JSON.parse(localStorage.getItem('np_verified_officials') || '{}');
    return !!verified[email];
  },

  // Get official info
  getOfficialInfo(email) {
    const verified = JSON.parse(localStorage.getItem('np_verified_officials') || '{}');
    return verified[email] || null;
  },

  // Get all verified officials
  getAllVerified() {
    return JSON.parse(localStorage.getItem('np_verified_officials') || '{}');
  },

  // Revoke verification
  revokeVerification(email) {
    if (!RBACSystem.hasPermission('verify_officials')) {
      console.error('You cannot revoke verification');
      return false;
    }

    const verified = JSON.parse(localStorage.getItem('np_verified_officials') || '{}');
    delete verified[email];
    localStorage.setItem('np_verified_officials', JSON.stringify(verified));
    RBACSystem.logAction(`Revoked verification for: ${email}`);
    return true;
  }
};

/* ===== INITIAL SETUP ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Set owner on first load
  const isFirstLoad = !localStorage.getItem('np_system_initialized');
  if (isFirstLoad) {
    localStorage.setItem('np_system_initialized', 'true');
    
    // Set default owners (can be changed later)
    const defaultOwners = ['satan.lucifer.d7@gmail.com', '9848536908'];
    const userRoles = JSON.parse(localStorage.getItem('np_user_roles') || '{}');
    defaultOwners.forEach(owner => {
      userRoles[owner] = UserRoles.OWNER;
    });
    localStorage.setItem('np_user_roles', JSON.stringify(userRoles));
    
    console.log(`✅ System initialized. Owners: ${defaultOwners.join(', ')}`);
  }

  // Update UI based on permissions
  updateUIPermissions();
});

// TODO: In production, replace localStorage-based RBAC with a secure backend auth API.
// This file currently stores roles locally for demo/MVP purposes. A server-side
// implementation should be used before public deployment.


// Update UI elements based on user permissions
function updateUIPermissions() {
  const role = RBACSystem.getCurrentRole();

  // Show/hide admin button in profile dropdown
  const adminLink = document.querySelector('.profile-dropdown-item[href="admin.html"]');
  if (adminLink) {
    adminLink.style.display = RBACSystem.hasPermission('access_admin_panel') ? 'block' : 'none';
  }

  // Show/hide create post button
  const createPostBtn = document.getElementById('createPostBtn');
  if (createPostBtn) {
    createPostBtn.style.display = RBACSystem.hasPermission('create_post') ? 'block' : 'none';
  }

  // Show/hide create problem button
  const createProblemBtn = document.getElementById('createProblemBtn');
  if (createProblemBtn) {
    createProblemBtn.style.display = RBACSystem.hasPermission('create_problem') ? 'block' : 'none';
  }

  // Update navbar with role indicator
  const navbar = document.querySelector('.nav-actions');
  if (navbar && role !== UserRoles.GUEST) {
    const roleIndicator = document.createElement('div');
    roleIndicator.id = 'roleIndicator';
    roleIndicator.innerHTML = getRoleBadge();
    roleIndicator.style.marginRight = '10px';
    
    const existing = document.getElementById('roleIndicator');
    if (existing) existing.remove();
    navbar.insertBefore(roleIndicator, navbar.firstChild);
  }

  // Update profile dropdown with role info
  const dropLocation = document.getElementById('dropLocation');
  if (dropLocation && role !== UserRoles.GUEST) {
    const roleBadge = getRoleBadge();
    dropLocation.innerHTML = `<span style="color: var(--text-muted);">Role:</span> ${roleBadge}`;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RBACSystem, Verification, UserRoles, Permissions };
}
