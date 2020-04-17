/**
 * Get path of current page
 */
function getDir() {
    const loc = window.location.pathname;
    const dir = loc.substring(0, loc.lastIndexOf('/'));
    return `${dir}/`
}

/**
 * Load data from a JSON file
 * @param {string} dataURL - URL relative to which local urls are interpreted
 */
async function getJSON(dataURL) {
    const response = await fetch(getDir() + dataURL);
    return await response.json();
}

/**
 * Insert some element(s) into another
 * @param {HTMLElement} parent - element to insert things into
 * @param {...(HTMLElement|string|number)} elements - things to insert into parent
 */
function insertThings(parent, ...elements) {
    for (const item of elements) {
        if (["string", "number"].includes(typeof item)) {
            parent.appendChild(document.createTextNode(item));
        } else {
            parent.appendChild(item);
        }
    }
}

export { getDir, getJSON, insertThings };