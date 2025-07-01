// Enhanced display functions for failures
function enhancedDisplayFailures(results) {
    if (!results || !results.failures || !results.failures.length) {
        document.getElementById('failures-container').innerHTML = '<p>No disconnected segments to report.</p>';
        document.getElementById('failed-segments-text').value = '';
        return;
    }
    
    console.log(`Displaying ${results.failures.length} failures`);
    
    // Debug: Log the structure of the failures
    if (results.failures.length > 0) {
        console.log('Sample failure object structure:', results.failures[0]);
    }
    
    const failuresContainer = document.getElementById('failures-container');
    failuresContainer.innerHTML = '';
    
    // Also collect the raw text for the failed segments
    let failedSegmentsText = '';
    
    // Placeholder check pattern
    const isPlaceholder = (text) => /Main Street from Cross\d to Cross\d/.test(text);
    
    // Create a tracker to store all ID mappings
    if (!window.failureItemsMap) {
        window.failureItemsMap = new Map();
    }
    
    results.failures.forEach((failure, index) => {
        // Get the streetKey from failure (handle different formats)
        let streetKey;
        if (failure.streetKey) {
            streetKey = failure.streetKey;
        } else if (failure.details && failure.details.parsed && failure.details.parsed.main) {
            streetKey = failure.details.parsed.main.normalized + ' ' + failure.details.parsed.main.quadrant;
        }
        
        // Check if this segment has been manually fixed
        const isReplaced = streetKey && (
            (results.manuallyFixed && results.manuallyFixed.has(streetKey)) ||
            (streetNetwork.replacedSegments && streetNetwork.replacedSegments.has(streetKey))
        );
        
        const failureDiv = document.createElement('div');
        failureDiv.className = 'failure-item';
        
        // Get the display text for the segment
        let displayText = '';
        
        // Check for different possible segment text fields
        if (failure.originalInput) {
            displayText = failure.originalInput;
        } else if (failure.inputText) {
            displayText = failure.inputText;
        } else if (failure.segment && !isPlaceholder(failure.segment)) {
            displayText = failure.segment;
        } else if (failure.input && !isPlaceholder(failure.input)) {
            displayText = failure.input;
        }
        // Extract from intersection error
        else if (failure.error && failure.error.includes('intersection between')) {
            const match = failure.error.match(/between\s+([^\s]+(?:\s+[^\s]+)*)\s+and\s+([^\s]+(?:\s+[^\s]+)*)/i);
            if (match && match.length >= 3) {
                const mainStreet = match[1];
                const crossStreet = match[2];
                displayText = `${mainStreet} from ? to ${crossStreet}`;
            }
        }
        // Extract from parse error, but avoid the placeholder
        else if (failure.error && failure.error.includes('Could not parse')) {
            const match = failure.error.match(/['"](.[^'"]*)['"]/);
            if (match && match[1] && !isPlaceholder(match[1])) {
                displayText = match[1];
            } else if (streetKey) {
                // Last resort - use the streetKey if it's not a placeholder-like value
                const formattedKey = streetKey.replace(/_/g, ' ');
                if (!isPlaceholder(formattedKey)) {
                    displayText = formattedKey;
                } else {
                    displayText = 'Unknown segment';
                }
            } else {
                displayText = 'Unknown segment';
            }
        }
        
        // Fallback
        if (!displayText) {
            displayText = 'Unknown segment';
        }
        
        // Generate a deterministic ID for this failure item
        let itemId;
        if (streetKey) {
            // Use streetKey for ID if available
            itemId = `failure-item-${streetKey.replace(/[^a-zA-Z0-9]/g, '-')}`;
        } else {
            // Otherwise use a hash of the display text
            const textHash = displayText.split('').reduce((acc, char) => 
                (acc * 31 + char.charCodeAt(0)) & 0xffffffff, 0);
            itemId = `failure-item-text-${textHash}`;
        }
        
        // Set the ID on the element
        failureDiv.id = itemId;
        
        // Store in our map for later reference
        if (streetKey) {
            window.failureItemsMap.set(streetKey, itemId);
            // Also add data attribute
            failureDiv.setAttribute('data-street-key', streetKey);
        }
        
        // Create the header with a badge if replaced
        const header = document.createElement('h3');
        header.textContent = displayText;
        
        if (isReplaced) {
            const badge = document.createElement('span');
            badge.className = 'replaced-badge';
            badge.textContent = 'FIXED';
            header.appendChild(badge);
            
            // Add fixed class to the item
            failureDiv.classList.add('fixed-segment');
            failureDiv.style.backgroundColor = '#e0f2e9';
            failureDiv.style.borderLeft = '3px solid #2a8d40';
        }
        
        failureDiv.appendChild(header);
        
        // Add the error message
        const message = document.createElement('p');
        message.textContent = failure.error || 'Unknown error';
        failureDiv.appendChild(message);
        
        // Always add to failed segments text if not manually fixed
        if (!isReplaced && displayText !== 'Unknown segment') {
            failedSegmentsText += displayText + '\n';
        }
        
        // Add action buttons if not replaced
        if (!isReplaced) {
            const actionButtons = document.createElement('div');
            actionButtons.className = 'action-buttons';
            
            // Create the "Open Map Editor" button
            const editButton = document.createElement('button');
            editButton.className = 'btn btn-warning';
            editButton.textContent = 'Open Map Editor and Trace Yourself';
            
            // Add a data attribute for this specific button's item ID
            editButton.setAttribute('data-item-id', itemId);
            if (streetKey) {
                editButton.setAttribute('data-street-key', streetKey);
            }
            editButton.setAttribute('data-display-text', displayText);
            
            editButton.addEventListener('click', function() {
                // Record this element ID for later update
                window.lastClickedItemId = itemId;
                window.lastClickedItem = failureDiv;
                console.log(`Stored clicked item: ${itemId} for ${displayText}`);
                
                if (streetKey) {
                    startDrawingMode(streetKey, displayText);
                } else {
                    // If no streetKey, still allow drawing but create a temp key
                    const tempKey = 'temp_segment_' + Date.now();
                    startDrawingMode(tempKey, displayText);
                }
            });
            
            actionButtons.appendChild(editButton);
            failureDiv.appendChild(actionButtons);
        } else {
            // For replaced items, show the success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.innerHTML = `
                <span style="color: #2a8d40; font-weight: bold;">✓ Manually Fixed</span> 
                <span style="color: #666; font-size: 0.8rem; margin-left: 5px;">${new Date().toLocaleTimeString()}</span>
            `;
            failureDiv.appendChild(successMsg);
        }
        
        failuresContainer.appendChild(failureDiv);
    });
    
    // Update the failed segments text area
    document.getElementById('failed-segments-text').value = failedSegmentsText.trim();
    console.log('Failed segments text area populated with:', failedSegmentsText);
    
    // Re-tag all items with data attributes
    if (typeof tagFailureItems === 'function') {
        setTimeout(tagFailureItems, 100);
    }
}

// Enhanced displaySuccessfulSegments function to show all types of successful segments
function enhancedDisplaySuccessfulSegments(results) {
    const listElement = document.getElementById('successful-segments-list');
    
    if (!results || !results.features || results.features.length === 0) {
        listElement.innerHTML = '<li>No successful segments to display</li>';
        return;
    }
    
    listElement.innerHTML = '';
    
    // Display regular successful segments
    results.features.forEach(feature => {
        const listItem = document.createElement('li');
        listItem.textContent = `${feature.properties.main_street} from ${feature.properties.from_street} to ${feature.properties.to_street}`;
        listElement.appendChild(listItem);
    });
    
    // Also add manually fixed segments if available through manualConnections
    if (results.manualConnections && results.manualConnections.length > 0) {
        results.manualConnections.forEach(connection => {
            // Find the original failure to get its display name
            const failure = results.failures.find(f => {
                if (f.streetKey === connection.streetKey) return true;
                
                // For failures without streetKey directly stored
                if (f.details && f.details.parsed && f.details.parsed.main) {
                    const computedKey = f.details.parsed.main.normalized + ' ' + f.details.parsed.main.quadrant;
                    return computedKey === connection.streetKey;
                }
                return false;
            });
            
            if (failure) {
                // Try different ways to get the display text
                let displayText = '';
                if (failure.segment) {
                    displayText = failure.segment;
                } else if (failure.input) {
                    displayText = failure.input;
                } else if (failure.originalInput) {
                    displayText = failure.originalInput;
                } else if (failure.inputText) {
                    displayText = failure.inputText;
                } else {
                    displayText = `Street segment (ID: ${connection.streetKey})`;
                }
                
                const listItem = document.createElement('li');
                listItem.textContent = `${displayText} (Manually Fixed)`;
                listItem.style.color = '#2a8d40';
                listItem.style.fontWeight = 'bold';
                listElement.appendChild(listItem);
            }
        });
    }
    
    // Check for manually fixed segments that might not be in manualConnections
    if (results.manuallyFixed && results.manuallyFixed.size > 0) {
        results.failures.forEach(failure => {
            // Get the streetKey for this failure
            let streetKey;
            if (failure.streetKey) {
                streetKey = failure.streetKey;
            } else if (failure.details && failure.details.parsed && failure.details.parsed.main) {
                streetKey = failure.details.parsed.main.normalized + ' ' + failure.details.parsed.main.quadrant;
            }
            
            // If this segment is manually fixed but not already listed in manualConnections
            if (streetKey && results.manuallyFixed.has(streetKey) && 
                (!results.manualConnections || !results.manualConnections.some(c => c.streetKey === streetKey))) {
                
                // Try different ways to get the display text
                let displayText = '';
                if (failure.segment) {
                    displayText = failure.segment;
                } else if (failure.input) {
                    displayText = failure.input;
                } else if (failure.originalInput) {
                    displayText = failure.originalInput;
                } else if (failure.inputText) {
                    displayText = failure.inputText;
                } else {
                    displayText = `Street segment (ID: ${streetKey})`;
                }
                
                const listItem = document.createElement('li');
                listItem.textContent = `${displayText} (Manually Fixed)`;
                listItem.style.color = '#2a8d40';
                listItem.style.fontWeight = 'bold';
                listElement.appendChild(listItem);
            }
        });
    }
}
