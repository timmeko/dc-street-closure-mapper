// Update the timestamp in the title
function updateTimestamp() {
    // Get the current date and time
    const now = new Date();
    
    // Format the date and time
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Convert to 12-hour format
    const hours12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Create formatted timestamp
    const timestamp = `${month} ${day}, ${year}, ${hours12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    
    // Update the title
    document.title = `DC Street Closure Geocoder - Network Graph Version (${timestamp})`;
    
    console.log(`Updated timestamp to ${timestamp}`);
}
