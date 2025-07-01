// DC Street Network Graph
class StreetNetwork {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.graph = new Map();
        this.disconnectedSegments = new Map();
        this.replacedSegments = new Set();
        this.manualConnections = new Map();
        this.loaded = false;
        this.lastResults = null;
    }
    
    // Process a list of street segments
    processSegments(segmentTexts) {
        console.log(`Processing ${segmentTexts.length} segments`);
        
        const results = {
            features: [],
            disconnectedFeatures: [],
            failures: [],
            manuallyFixed: new Set(),
            manualConnections: []
        };
        
        // Here we'd normally process each segment
        // This is a placeholder implementation for now
        segmentTexts.forEach(segmentText => {
            // For demo purposes, just add a failure
            results.failures.push({
                input: segmentText,
                streetKey: segmentText.replace(/[^a-zA-Z0-9]/g, '_'),
                error: "Could not parse segment text. Expected format: 'Main Street from Cross1 to Cross2'"
            });
        });
        
        console.log(`Processed segments: ${results.features.length} successful, ${results.failures.length} failures`);
        return results;
    }
    
    // Create a new node
    createNode(coordinates) {
        const nodeId = 'manual_node_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        
        // Add node to the nodes Map
        this.nodes.set(nodeId, {
            id: nodeId,
            coordinates: coordinates
        });
        
        console.log(`Created new node ${nodeId} at coordinates [${coordinates}]`);
        return nodeId;
    }
    
    // Add a manual connection between nodes
    addManualConnection(streetKey, nodePath) {
        if (!nodePath || nodePath.length < 2) {
            console.error("Cannot create manual connection: invalid node path");
            return null;
        }
        
        // Generate connection ID
        const connectionId = 'manual_connection_' + Date.now();
        
        // Create edges between consecutive nodes
        const edges = [];
        for (let i = 0; i < nodePath.length - 1; i++) {
            const edgeId = `${connectionId}_edge_${i}`;
            const sourceNode = this.nodes.get(nodePath[i]);
            const targetNode = this.nodes.get(nodePath[i + 1]);
            
            if (!sourceNode || !targetNode) {
                console.error(`Cannot create edge: nodes not found`);
                continue;
            }
            
            // Create the edge
            const edge = {
                id: edgeId,
                source: nodePath[i],
                target: nodePath[i + 1],
                coordinates: [sourceNode.coordinates, targetNode.coordinates],
                manual: true,
                streetKey: streetKey
            };
            
            // Add to edges map
            this.edges.set(edgeId, edge);
            edges.push(edgeId);
            
            // Update graph adjacency list
            if (!this.graph.has(nodePath[i])) {
                this.graph.set(nodePath[i], []);
            }
            if (!this.graph.has(nodePath[i + 1])) {
                this.graph.set(nodePath[i + 1], []);
            }
            
            this.graph.get(nodePath[i]).push(edgeId);
            this.graph.get(nodePath[i + 1]).push(edgeId);
        }
        
        // Store the manual connection
        if (!this.manualConnections) {
            this.manualConnections = new Map();
        }
        
        this.manualConnections.set(connectionId, {
            id: connectionId,
            streetKey: streetKey,
            nodePath: nodePath,
            edges: edges
        });
        
        console.log(`Created manual connection ${connectionId} for street ${streetKey} with ${edges.length} edges`);
        return connectionId;
    }
    
    // Replace disconnected segments with a manual connection
    replaceDisconnectedSegments(streetKey, connectionId) {
        // Mark the street as replaced
        if (!this.replacedSegments) {
            this.replacedSegments = new Set();
        }
        this.replacedSegments.add(streetKey);
        
        // If using lastResults, mark it there too
        if (this.lastResults) {
            if (!this.lastResults.manuallyFixed) {
                this.lastResults.manuallyFixed = new Set();
            }
            this.lastResults.manuallyFixed.add(streetKey);
        }
        
        console.log(`Marked street ${streetKey} as replaced by connection ${connectionId}`);
        return true;
    }
    
    // Check if a segment has been replaced
    isSegmentReplaced(streetKey) {
        // Check if the results have a manuallyFixed set that contains this streetKey
        if (this.lastResults && 
            this.lastResults.manuallyFixed && 
            this.lastResults.manuallyFixed.has(streetKey)) {
            return true;
        }
        // Otherwise check if the replacedSegments set has this key
        return this.replacedSegments && this.replacedSegments.has(streetKey);
    }
    
    // Get all features for export
    getExportFeatures(results) {
        // Create a GeoJSON FeatureCollection
        const exportData = {
            type: "FeatureCollection",
            features: []
        };
        
        // Add all features from results
        if (results && results.features) {
            exportData.features = [...results.features];
        }
        
        // Add any manual connections as features
        if (this.manualConnections) {
            this.manualConnections.forEach(connection => {
                // Create a LineString from the node coordinates
                const coordinates = connection.nodePath.map(nodeId => {
                    const node = this.nodes.get(nodeId);
                    return node ? node.coordinates : null;
                }).filter(coord => coord !== null);
                
                if (coordinates.length > 1) {
                    exportData.features.push({
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: coordinates
                        },
                        properties: {
                            id: connection.id,
                            streetKey: connection.streetKey,
                            type: "manual_connection"
                        }
                    });
                }
            });
        }
        
        return exportData;
    }
}

// Create a global instance of the street network
const streetNetwork = new StreetNetwork();
