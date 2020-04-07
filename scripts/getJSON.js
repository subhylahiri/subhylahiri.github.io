
function getDir() {
    let loc = window.location.pathname;
    let dir = loc.substring(0, loc.lastIndexOf('/'));
    return `${dir}/`
}

async function getJSON(dataURL) {
    const response = await fetch(getDir() + dataURL);
    return await response.json();
}

export { getDir, getJSON };