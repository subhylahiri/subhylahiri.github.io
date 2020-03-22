function buildPage(activeID, baseURL) {
    buildNav(activeID, baseURL);
    buildFoot();
}

function buildFoot() {
    let body = document.getElementsByTagName("body");
    let footDiv = document.createElement("div");
    footDiv.className = "footer";
    footDiv.innerHTML = '<address>Subhaneil Lahiri: <tt>sulahiri at stanford dot edu</tt>. ' +
        '<a href="https://github.com/subhylahiri/subhylahiri.github.io">[Source]</a>.</address>';
    body[0].appendChild(footDiv);
}

function buildNav(activeID, baseURL) {
    if (baseURL === undefined) {
        baseURL = '';
    }
    getJSON(`${baseURL}data/nav.json`)
        .then((navData) => {
            insertNav(navData, activeID, baseURL);
        });
}

function insertNav(navData, activeID, baseURL) {
    let body = document.getElementsByTagName("body");
    let headDiv = document.getElementsByClassName("header");
    let navDiv = document.createElement("div");
    navDiv.className = "nav";
    let navString = '<ul>';
    for (let i = 0; i < navData.length; i++) {
        navString += entryNav(navData[i], baseURL);
    }
    navDiv.innerHTML = navString + '</ul>';
    body[0].insertBefore(navDiv, headDiv[0])
    headDiv[0].style.paddingTop = "0em";
    let activeObj = document.getElementById(activeID);
    activeObj.className = "active";
}

function getDir() {
    let loc = window.location.pathname;
    let dir = loc.substring(0, loc.lastIndexOf('/'));
    return `${dir}/`
}

async function getJSON(dataURL) {
    const response = await fetch(getDir() + dataURL);
    return await response.json();
}

function entryNav(entry, baseURL) {
    let listItem = `<li id="${entry.id}"><a href="`;
    if (entry.internal) {
        listItem += baseURL;
    }
    return `${listItem + entry.url}">${entry.name}</a></li>`
}

export { getDir, getJSON, buildPage };