// Enhanced GeoJSON export function
function enhancedExportGeoJSON() {
    // Check if we have any data to export
    if (!streetNetwork.lastResults) {
        console.log("Checking for street network results to export...");
        updateStatus("No processed data to export. Process segments first.", "error");
        return;
    }
    
    console.log(`Preparing to export features...`);
    
    try {
        // Get all features for export
        const exportData = streetNetwork.getExportFeatures(streetNetwork.lastResults);
        
        if (!exportData.features || exportData.features.length === 0) {
            updateStatus("No features to export", "error");
            return;
        }
        
        // Create a downloadable link
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "dc-street-closures.geojson");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        updateStatus(`GeoJSON exported successfully with ${exportData.features.length} features`, "success");
    } catch (error) {
        console.error("Error exporting GeoJSON:", error);
        updateStatus(`Export error: ${error.message}`, "error");
    }
}
