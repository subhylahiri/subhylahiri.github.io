import { getJSON, insertThings } from "./getJSON.js";
/**
 *  Create and insert nav-bar and footer
 * @param {string} activeID  - id of current nav-bar tab
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function buildPage(activeID, baseURL) {
    buildNav(activeID, baseURL);
    buildFoot();
}

/** Create and insert footer */
function buildFoot() {
    let body = document.getElementsByTagName("body");
    let foot = document.createElement("div");
    foot.className = "footer";

    let address = document.createElement("address");
    let email = document.createElement("code");
    let source = document.createElement('a');

    email.textContent = "sulahiri at stanford dot edu";
    source.textContent = "[Source]";
    source.href = "https://github.com/subhylahiri/subhylahiri.github.io";
    source.title = "Source code on GitHub";

    insertThings(address, "Subhaneil Lahiri: ", email, ". ", source, ".");
    foot.appendChild(address);
    body[0].appendChild(foot);
}

/**
 * Read JSON file and pass to insertNav
 * @param {string} activeID - id of current  nav-bar tab
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function buildNav(activeID, baseURL = '') {
    getJSON(`${baseURL}data/nav.json`)
        .then(navData => insertNav(navData, activeID, baseURL));
}

/**
 * A tab in the navigation bar
 * @typedef {Object} Tab
 * @property {string} id - identifier of list item
 * @property {string} name - display name of tab
 * @property {string} url - URL of page to link to
 * @property {boolean} internal - is the URL local?
 */

/**
 * Create and insert list of nav-bar tabs
 * @param {Tab[]} navData - array of nav-bar entries from JSON
 * @param {string} activeID - id of current  nav-bar tab
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function insertNav(navData, activeID, baseURL) {
    let body = document.getElementsByTagName("body");
    let headDiv = document.getElementsByClassName("header");
    let navDiv = document.createElement("div");
    navDiv.className = "nav";
    let navList = document.createElement("ul");
    navData.forEach(entry => entryNav(navList, entry, baseURL));
    navDiv.appendChild(navList);
    body[0].insertBefore(navDiv, headDiv[0])
    headDiv[0].style.paddingTop = "0em";
    let activeObj = document.getElementById(activeID);
    activeObj.className = "active";
}
/**
 * Create a list entry for nav-bar tab
 * @param {HTMLUListElement} navList - list of nav-bar tabs
 * @param {Tab} entry - dict with id, name and url
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function entryNav(navList, entry, baseURL) {
    let listItem = document.createElement("li");
    let link = document.createElement("a");
    link.textContent = entry.name;
    link.href = entry.url;
    if (entry.internal) {
        link.href = baseURL + link.href;
    }
    listItem.id = entry.id;
    listItem.appendChild(link);
    navList.appendChild(listItem);
}

export { buildPage };