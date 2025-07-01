// Function to update the simple-item-tracker after processing segments
function updateTrackersAfterProcessing() {
    console.log("Updating click trackers after processing segments...");
    
    try {
        // Wait a brief moment for DOM updates to complete
        setTimeout(function() {
            // Find all edit buttons
            const editButtons = document.querySelectorAll('.failure-item button');
            console.log(`Found ${editButtons.length} edit buttons to update`);
            
            editButtons.forEach((button, index) => {
                // Only process buttons with "Open Map Editor" text
                if (button.textContent && button.textContent.includes('Open Map Editor')) {
                    // Store the original onclick handler
                    const originalOnClick = button.onclick;
                    
                    // Replace with our tracking version
                    button.onclick = function(event) {
                        // Get the parent failure item
                        const failureItem = button.closest('.failure-item');
                        if (failureItem) {
                            // Store this item for later update
                            window.lastClickedItem = failureItem;
                            console.log("Stored clicked item for later update:", failureItem);
                        }
                        
                        // Call the original handler if it exists
                        if (originalOnClick) {
                            return originalOnClick.call(this, event);
                        }
                    };
                    
                    console.log(`Updated button #${index}`);
                }
            });
        }, 100);
    } catch (e) {
        console.error("Error updating trackers:", e);
    }
}
