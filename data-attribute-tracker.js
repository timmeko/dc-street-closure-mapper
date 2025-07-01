// Data attribute tracker for failure items
(function() {
    console.log("Initializing data attribute tracking for failure items");
    
    // Track which street keys have been manually fixed
    window.manuallyFixedKeys = new Set();
    
    // Tag all failure items with data attributes
    function tagFailureItems() {
        console.log("Tagging all failure items with data attributes...");
        const failureItems = document.querySelectorAll('.failure-item');
        
        failureItems.forEach((item, index) => {
            // Add a unique ID if it doesn't have one
            if (!item.id) {
                item.id = `failure-item-${index}`;
            }
            
            // Find the "Open Map Editor" button
            const editButton = item.querySelector('button');
            if (!editButton || !editButton.textContent || !editButton.textContent.includes('Open Map Editor')) return;
            
            // Try to extract the street key from the onclick handler
            try {
                // Check if onclick exists before attempting to call toString()
                if (!editButton.onclick) {
                    console.log(`Button #${index} doesn't have an onclick handler yet, skipping...`);
                    return;
                }
                
                const onClickStr = editButton.onclick.toString();
                const keyMatch = onClickStr.match(/startDrawingMode\(['"]([^'"]+)['"]/);
                
                if (keyMatch && keyMatch[1]) {
                    // Store the street key as a data attribute
                    item.setAttribute('data-street-key', keyMatch[1]);
                    console.log(`Tagged item #${index} with street key: ${keyMatch[1]}`);
                    
                    // Also store the display name
                    const header = item.querySelector('h3');
                    if (header) {
                        item.setAttribute('data-display-name', header.textContent.trim());
                    }
                    
                    // Add a click handler to the button that records which item was clicked
                    editButton.addEventListener('click', function() {
                        // Store which item was clicked in a global variable
                        window.lastClickedItemId = item.id;
                        console.log(`Recorded click on item: ${item.id} with street key: ${keyMatch[1]}`);
                    });
                }
            } catch (e) {
                console.error(`Error tagging item #${index}:`, e);
            }
        });
    }
    
    // Update a specific failure item to show it's fixed
    window.markItemAsFixed = function(itemId, streetKey) {
        console.log(`Marking item as fixed: ${itemId}, street key: ${streetKey}`);
        
        // Get the item by ID
        const item = document.getElementById(itemId);
        if (!item) {
            console.error(`Could not find item with ID: ${itemId}`);
            
            // Try finding by street key
            if (streetKey) {
                const altItem = document.querySelector(`[data-street-key="${streetKey}"]`);
                if (altItem) {
                    console.log(`Found item by street key instead: ${streetKey}`);
                    updateItemUI(altItem);
                    return true;
                }
            }
            return false;
        }
        
        // Update the item UI
        updateItemUI(item);
        return true;
    };
    
    // Mark an item as fixed by street key
    window.markItemFixedByKey = function(streetKey) {
        if (!streetKey) return false;
        
        console.log(`Looking for item with street key: ${streetKey}`);
        const item = document.querySelector(`[data-street-key="${streetKey}"]`);
        
        if (item) {
            console.log(`Found item with street key: ${streetKey}`);
            updateItemUI(item);
            return true;
        }
        
        console.error(`Could not find item with street key: ${streetKey}`);
        return false;
    };
    
    // Apply UI changes to show an item is fixed
    function updateItemUI(item) {
        console.log("Updating item UI to show fixed state:", item);
        
        // Record this street key as fixed
        const streetKey = item.getAttribute('data-street-key');
        if (streetKey) {
            window.manuallyFixedKeys.add(streetKey);
        }
        
        // Add green background
        item.style.backgroundColor = '#e0f2e9';
        item.style.borderLeft = '3px solid #2a8d40';
        item.classList.add('fixed-segment');
        
        // Update the header with a fixed badge
        const header = item.querySelector('h3');
        if (header && !header.querySelector('.replaced-badge')) {
            const badge = document.createElement('span');
            badge.className = 'replaced-badge';
            badge.textContent = 'FIXED';
            badge.style.marginLeft = '10px';
            badge.style.backgroundColor = '#2a8d40';
            badge.style.color = 'white';
            badge.style.padding = '3px 8px';
            badge.style.borderRadius = '10px';
            badge.style.fontSize = '0.8rem';
            header.appendChild(badge);
        }
        
        // Replace any buttons with success message
        const actionButtons = item.querySelector('.action-buttons');
        if (actionButtons) {
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.innerHTML = `
                <span style="color: #2a8d40; font-weight: bold;">✓ Manually Fixed</span> 
                <span style="color: #666; font-size: 0.8rem; margin-left: 5px;">${new Date().toLocaleTimeString()}</span>
            `;
            
            // Replace buttons with success message
            actionButtons.innerHTML = '';
            actionButtons.appendChild(successMsg);
        }
    }
    
    // Update all failure items based on fixed keys
    window.refreshFixedItems = function() {
        console.log("Refreshing fixed items...");
        
        if (!window.manuallyFixedKeys || window.manuallyFixedKeys.size === 0) {
            console.log("No manually fixed keys to refresh");
            return 0;
        }
        
        let updatedCount = 0;
        
        // Update all items with matching street keys
        window.manuallyFixedKeys.forEach(key => {
            const item = document.querySelector(`[data-street-key="${key}"]`);
            if (item) {
                updateItemUI(item);
                updatedCount++;
            }
        });
        
        console.log(`Refreshed ${updatedCount} fixed items`);
        return updatedCount;
    };
    
    // Function to update the last clicked item
    window.updateLastClickedItem = function() {
        if (window.lastClickedItem) {
            console.log("Updating last clicked item:", window.lastClickedItem);
            updateItemUI(window.lastClickedItem);
            return true;
        }
        
        if (window.lastClickedItemId) {
            const item = document.getElementById(window.lastClickedItemId);
            if (item) {
                console.log(`Found last clicked item by ID: ${window.lastClickedItemId}`);
                updateItemUI(item);
                return true;
            }
        }
        
        console.log("No last clicked item found to update");
        return false;
    };
    
    // Initialize by tagging all items
    // Run once on load and again when the document is fully ready
    tagFailureItems();
    
    document.addEventListener('DOMContentLoaded', function() {
        // Tag failure items when the DOM is fully loaded
        tagFailureItems();
        
        // Also set up a mutation observer to catch dynamically added items
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any failure items were added
                    const failuresContainer = document.getElementById('failures-container');
                    if (failuresContainer && failuresContainer.contains(mutation.target)) {
                        console.log("Detected changes in failures container, re-tagging items");
                        tagFailureItems();
                    }
                }
            });
        });
        
        // Start observing the failures container
        const failuresContainer = document.getElementById('failures-container');
        if (failuresContainer) {
            observer.observe(failuresContainer, { 
                childList: true,
                subtree: true
            });
        }
    });
    
    // Make the function available globally
    window.tagFailureItems = tagFailureItems;
})();
