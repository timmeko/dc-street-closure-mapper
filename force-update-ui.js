// Ultra-aggressive force update for failure items with style monitoring - WITH LOOP PROTECTION
(function() {
    console.log("🔒 Initializing persistent style enforcer for fixed items");
    
    // Store all fixed items in a global set for monitoring
    window.fixedItemIds = new Set();
    
    // Anti-loop protection
    let isRefreshing = false;
    let lastRefreshTime = 0;
    let refreshCount = 0;
    const MAX_REFRESHES = 3; // Maximum number of refreshes in a time period
    const REFRESH_COOLDOWN = 5000; // 5 seconds between refresh cycles
    
    // Force update for failure items with persistent style enforcement
    window.forceUpdateFailureItem = function(itemId, streetKey) {
        console.log(`⚡ FORCE UPDATING item ${itemId} for street ${streetKey}`);
        
        // Find the item by ID first
        let item = document.getElementById(itemId);
        
        // If not found by ID, try to find by street key
        if (!item && streetKey) {
            item = document.querySelector(`[data-street-key="${streetKey}"]`);
        }
        
        // If still not found, try to find by class and check for any text match
        if (!item) {
            const allItems = document.querySelectorAll('.failure-item');
            for (const element of allItems) {
                const header = element.querySelector('h3');
                if (header && header.textContent && 
                    ((streetKey && header.textContent.includes(streetKey)) || 
                     (itemId && element.id === itemId))) {
                    item = element;
                    break;
                }
            }
        }
        
        if (!item) {
            console.error(`🛑 Could not find item to update for ${itemId || streetKey}`);
            return false;
        }
        
        console.log(`🔍 Found item to update:`, item);
        
        // Store this ID in our fixed items set for persistent monitoring
        window.fixedItemIds.add(item.id);
        
        // Apply the ultra-aggressive styling
        applyAggressiveStyling(item);
        
        console.log(`✅ Successfully updated item UI for ${itemId || streetKey}`);
        return true;
    };
    
    // Function to apply aggressive styling that can't be overridden
    function applyAggressiveStyling(item) {
        if (!item) return;
        
        console.log(`Applying aggressive styling to:`, item);
        
        // 1. Add class and important inline styles
        item.classList.add('fixed-segment');
        
        // 2. Apply direct inline styles with !important
        item.setAttribute('style', 'background-color: #e0f2e9 !important; border-left: 3px solid #2a8d40 !important; border-radius: 4px !important;');
        
        // 3. Record this street key as fixed if available
        const streetKey = item.getAttribute('data-street-key');
        if (streetKey && window.manuallyFixedKeys) {
            window.manuallyFixedKeys.add(streetKey);
        }
        
        // 4. Update the header with a fixed badge
        const header = item.querySelector('h3');
        if (header) {
            // Remove any existing badge
            const existingBadge = header.querySelector('.replaced-badge');
            if (existingBadge) {
                existingBadge.remove();
            }
            
            // Add new badge with important styles
            const badge = document.createElement('span');
            badge.className = 'replaced-badge';
            badge.textContent = 'FIXED';
            badge.setAttribute('style', 'margin-left: 10px !important; background-color: #2a8d40 !important; color: white !important; padding: 3px 8px !important; border-radius: 10px !important; font-size: 0.8rem !important; display: inline-block !important;');
            header.appendChild(badge);
        }
        
        // 5. Replace any buttons with success message
        const actionButtons = item.querySelector('.action-buttons');
        if (actionButtons) {
            // Create success message with strong styling
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.setAttribute('style', 'padding: 5px 0 !important;');
            successMsg.innerHTML = `
                <span style="color: #2a8d40 !important; font-weight: bold !important;">✓ Manually Fixed</span> 
                <span style="color: #666 !important; font-size: 0.8rem !important; margin-left: 5px !important;">${new Date().toLocaleTimeString()}</span>
            `;
            
            // Replace buttons with success message
            actionButtons.innerHTML = '';
            actionButtons.appendChild(successMsg);
        }
    }
    
    // Refresh all fixed items with loop protection
    window.refreshAllFixedItems = function() {
        // Anti-loop protection
        const now = Date.now();
        if (isRefreshing) {
            console.log("Already refreshing, skipping...");
            return 0;
        }
        
        if (now - lastRefreshTime < REFRESH_COOLDOWN) {
            refreshCount++;
            if (refreshCount > MAX_REFRESHES) {
                console.log(`Refresh limit reached (${MAX_REFRESHES}), waiting for cooldown...`);
                return 0;
            }
        } else {
            refreshCount = 0;
        }
        
        lastRefreshTime = now;
        
        if (!window.fixedItemIds || window.fixedItemIds.size === 0) {
            console.log("No fixed items to refresh");
            return 0;
        }
        
        console.log(`Refreshing ${window.fixedItemIds.size} fixed items`);
        isRefreshing = true;
        let refreshed = 0;
        
        try {
            window.fixedItemIds.forEach(id => {
                const item = document.getElementById(id);
                if (item) {
                    applyAggressiveStyling(item);
                    refreshed++;
                }
            });
            
            console.log(`Refreshed ${refreshed} items`);
        } catch (e) {
            console.error("Error during refresh:", e);
        } finally {
            isRefreshing = false;
        }
        
        return refreshed;
    };
    
    // Simpler version with just a single observer setup
    function setupStyleMonitor() {
        // Only set up once
        if (window.styleMonitorActive) return;
        window.styleMonitorActive = true;
        
        let pendingRefresh = false;
        let lastMutation = 0;
        
        const observer = new MutationObserver(function(mutations) {
            // If we have fixed items, check if they need styling refresh
            if (window.fixedItemIds && window.fixedItemIds.size > 0) {
                // Throttle refresh to prevent loops
                const now = Date.now();
                if (!pendingRefresh && now - lastMutation > 1000) {
                    pendingRefresh = true;
                    lastMutation = now;
                    
                    // Delayed refresh to batch mutations
                    setTimeout(() => {
                        window.refreshAllFixedItems();
                        pendingRefresh = false;
                    }, 500);
                }
            }
        });
        
        // Start observing the document body for ONLY class and style changes
        observer.observe(document.body, {
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        console.log("Style monitor activated with loop protection");
        
        // One-time refresh after 2 seconds, no intervals
        setTimeout(function() {
            window.refreshAllFixedItems();
        }, 2000);
    }
    
    // Set up style monitor when document is ready
    if (document.readyState === 'complete') {
        setupStyleMonitor();
    } else {
        window.addEventListener('load', setupStyleMonitor);
    }
    
    // Also expose applyAggressiveStyling globally
    window.applyAggressiveStyling = applyAggressiveStyling;
})();
