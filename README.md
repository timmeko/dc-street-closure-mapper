# DC Street Closure Mapper

A web-based tool for mapping and fixing street closures in Washington, DC. This tool allows users to:

1. Input street segments that will be closed
2. Visualize them on a map
3. Manually trace segments that can't be automatically processed
4. Export the results as GeoJSON for use in other applications

## Features

- Interactive map visualization using Leaflet
- Automatic street segment processing
- Manual drawing tools for fixing disconnected segments
- Export to GeoJSON for integration with other systems
- Responsive design that works on desktop and mobile

## Usage

1. Enter street segments in the format: `Street Name from Cross Street to Cross Street, Quadrant`
   Example: `14th Street from U Street to Independence Avenue, NW`

2. Click "Process Segments" to visualize the streets on the map
   
3. For any streets that couldn't be automatically processed, use the "Open Map Editor" button to manually trace them

4. Once all segments are processed, click "Export GeoJSON" to download the data

## Development

The application uses vanilla JavaScript with Leaflet for mapping and relies on a pre-processed street network graph of Washington, DC.

### Key Files

- `index.html` - Main application
- `street-network.js` - Core street network processing logic
- `force-update-ui.js` - UI state management for fixed segments
- `css-injector.js` - Dynamic styling for fixed segments
- Other JS files for specific functionality components

## License

MIT
