export const navigationConfig = [
  { 
    id: 'dashboard',
    href: '/dashboard', 
    icon: '📊', 
    label: 'Dashboard',
    enabled: true,
    requiredPermission: null, // Always visible
    tier: 'free',
    order: 1,
  },
  { 
    id: 'invoices',
    href: '/dashboard/invoices', 
    icon: '📝', 
    label: 'Invoices',
    enabled: true,
    requiredPermission: 'invoices:view',
    tier: 'free',
    order: 2,
    description: 'Create and manage invoices',
  },
  { 
    id: 'clients',
    href: '/dashboard/clients', 
    icon: '👥', 
    label: 'Clients',
    enabled: true,
    requiredPermission: 'clients:view',
    tier: 'free',
    order: 3,
    description: 'Manage your clients',
  },
  { 
    id: 'payments',
    href: '/dashboard/payments', 
    icon: '💳', 
    label: 'Payments',
    enabled: false, // Coming soon
    requiredPermission: 'payments:view',
    tier: 'free',
    order: 4,
    badge: 'Soon',
    description: 'Track payments',
  },
  { 
    id: 'analytics',
    href: '/dashboard/analytics', 
    icon: '📈', 
    label: 'Analytics',
    enabled: false, // Premium feature
    requiredPermission: 'analytics:view',
    tier: 'premium',
    order: 5,
    badge: 'Pro',
    description: 'View business analytics',
  },
  { 
    id: 'settings',
    href: '/dashboard/settings', 
    icon: '⚙️', 
    label: 'Settings',
    enabled: true,
    requiredPermission: null,
    tier: 'free',
    order: 99,
  },
];

/**
 * Filter navigation items based on user permissions and tier
 * @param {Object} user - User object with permissions and tier
 * @returns {Array} Filtered navigation items
 */

export const filterNavigation = (user) => {
    if(!user) return [];

    const userPermissions = user.permissions || ['invoices:view','clients:view', 'payments:view',];
    const userTier = user.subcription_tier || 'free';
    
    return navigationConfig.filter(item => {
        if(!item.enabled) return false;

        if(item.requiredPermission){
            if(!userPermissions.includes(item.requiredPermission)){
                return false;
            }
        }

        //in future tier subcruption logic
        if(item.tier !== userTier){  return false; }         

        return true;
    }).sort((a ,b) => a.order - b.order);
};

//get tier name for display

export const getTierName = (tier) => {
    const tiers = {
        free : 'Free',
        premium : 'Premium',
        enterprise : 'Enterprise'
    };

    return tiers[tier] || 'Free';
};

/**
 * Check if user has access to a specific tier
 */

export const hasAccessTier = (userTier , requiredTier) => {
    const tierLevels = {free : 0, premium : 1, enterprise : 2};
    return (tierLevels[userTier] || 0) >= (tierLevels[requiredTier] || 0);
};

