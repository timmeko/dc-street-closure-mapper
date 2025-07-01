// CSS Injector - Force critical styles into the document
(function() {
    console.log("💉 Injecting critical CSS styles");
    
    // Anti-loop protection
    let lastInjection = 0;
    const MIN_INJECTION_INTERVAL = 3000; // Minimum 3 seconds between injections
    
    function injectStyles() {
        // Prevent too-frequent injections
        const now = Date.now();
        if (now - lastInjection < MIN_INJECTION_INTERVAL) {
            console.log("Injection cooldown active, skipping...");
            return;
        }
        lastInjection = now;
        
        // Create a style element
        const styleEl = document.createElement('style');
        styleEl.id = 'force-fixed-styles';
        styleEl.innerHTML = `
            /* Ultra-aggressive fixed segment styling */
            .failure-item.fixed-segment,
            .fixed-segment,
            div[id^="failure-item-"].fixed-segment,
            div[class*="failure-item"].fixed-segment {
                background-color: #e0f2e9 !important;
                border-left: 3px solid #2a8d40 !important;
                border-radius: 4px !important;
            }
            
            /* Badge styling that can't be overridden */
            .replaced-badge,
            span.replaced-badge,
            h3 > .replaced-badge {
                background-color: #2a8d40 !important;
                color: white !important;
                padding: 3px 8px !important;
                border-radius: 10px !important;
                font-size: 0.8rem !important;
                margin-left: 10px !important;
                display: inline-block !important;
            }
            
            /* Make sure the action buttons are hidden when replaced */
            .fixed-segment .action-buttons button {
                display: none !important;
            }
            
            /* Success message styling */
            .success-message,
            .fixed-segment .success-message {
                padding: 5px 0 !important;
                display: block !important;
            }
            
            .success-message span {
                display: inline-block !important;
            }
        `;
        
        // If a previous version exists, remove it
        const existingStyle = document.getElementById('force-fixed-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Add to document head
        document.head.appendChild(styleEl);
        console.log("Critical CSS styles injected");
    }
    
    // Inject now and after load - but only once
    injectStyles();
    
    // Wait for load before setting up the full styles
    window.addEventListener('load', function() {
        // Inject after a delay to ensure it takes precedence
        setTimeout(injectStyles, 500);
    });
    
    // Also make function available globally, but with protection
    window.injectFixedStyles = function() {
        injectStyles();
    };
})();
