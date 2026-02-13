// Generate a short title from the first user message (max 50 chars)
function generateTitle(message) {
    const words = message.split(' ');
    let title = words.slice(0, 5).join(' ');
    if (title.length > 50) title = title.substring(0, 47) + '...';
    return title || 'New Chat';
}

module.exports = generateTitle;