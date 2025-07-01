// Selective UI updater for manually fixed segments with improved error handling
function selectiveUpdateFixedSegments() {
    console.log("🔍 Selectively updating fixed segments in UI...");
    
    try {
        // Only update segments that have actually been manually traced
        if (!streetNetwork.manualConnections || streetNetwork.manualConnections.size === 0) {
            console.log("No manual connections found - nothing to update");
            return;
        }
        
        // Get the list of streetKeys that have been manually fixed
        const fixedStreetKeys = [];
        streetNetwork.manualConnections.forEach((connection, connectionId) => {
            if (connection.streetKey) {
                fixedStreetKeys.push(connection.streetKey);
            }
        });
        
        console.log(`Found ${fixedStreetKeys.length} streetKeys with manual connections`);
        
        // Get all failure items
        const failureItems = document.querySelectorAll('.failure-item');
        console.log(`Found ${failureItems.length} failure items to check`);
        
        // For each fixed street key, look for a matching item
        let updatedCount = 0;
        
        fixedStreetKeys.forEach(fixedKey => {
            console.log(`Looking for UI elements matching fixed key: ${fixedKey}`);
            
            let foundForThisKey = false;
            
            // First, look through all items with buttons
            failureItems.forEach((item, index) => {
                try {
                    // Look for "Open Map Editor" button
                    const buttons = item.querySelectorAll('button');
                    if (buttons.length === 0) return; // Skip - already updated or no buttons
                    
                    // Check for matching button text
                    let matchFound = false;
                    
                    for (const button of buttons) {
                        // Safe check for button text
                        const buttonText = button.textContent || '';
                        if (buttonText.includes('Open Map Editor')) {
                            // This is an editor button - now check if it matches our fixed key
                            const header = item.querySelector('h3');
                            const headerText = header ? header.textContent : '';
                            
                            // First, try direct match in onclick if available
                            try {
                                if (button.onclick) {
                                    const onClickStr = button.onclick.toString();
                                    if (onClickStr.includes(fixedKey)) {
                                        console.log(`Found match by onclick for ${fixedKey}`);
                                        matchFound = true;
                                        break;
                                    }
                                }
                            } catch (e) {
                                console.log("Error checking onclick, continuing with other methods");
                            }
                            
                            // Next, try matching based on the text in the header
                            const normalizedFixedKey = fixedKey.replace(/_/g, ' ');
                            if (headerText.includes(normalizedFixedKey)) {
                                console.log(`Found match by header text for ${fixedKey}`);
                                matchFound = true;
                                break;
                            }
                        }
                    }
                    
                    if (matchFound) {
                        updateItemToFixed(item);
                        foundForThisKey = true;
                        updatedCount++;
                    }
                } catch (e) {
                    console.error(`Error processing item ${index}:`, e);
                }
            });
            
            if (!foundForThisKey) {
                console.log(`Could not find UI item for fixed key: ${fixedKey}`);
            }
        });
        
        console.log(`Updated ${updatedCount} items`);
    } catch (e) {
        console.error("Error in selectiveUpdateFixedSegments:", e);
    }
}

// Update a single item to show it's fixed
function updateItemToFixed(item) {
    try {
        console.log("Applying fixed styles to item", item);
        
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
    } catch (e) {
        console.error("Error updating item:", e);
    }
}
