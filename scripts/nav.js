import { getJSON } from "./getJSON.js";

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
    let myName = document.createTextNode("Subhaneil Lahiri: ");
    let spacer = document.createTextNode(". ");

    email.textContent = "sulahiri at stanford dot edu";
    source.textContent = "[Source]";
    source.href = "https://github.com/subhylahiri/subhylahiri.github.io";
    source.title = "Source code on GitHub";

    [myName, email, spacer.cloneNode(), source, spacer].forEach(elem => {
        address.appendChild(elem);
    });
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
        .then((navData) => {
            insertNav(readTabData(navData), activeID, baseURL);
        });
}

/**
 * @class {Object} Tab
 * @classdesc A tab in the navigation bar
 * @property {string} id - identifier of list item
 * @property {string} name - display name of tab
 * @property {string} url - URL of page to link to
 * @property {boolean} internal - is the URL local?
 */
class Tab {
    constructor(entry) {
        Object.assign(this, entry);
    }
    /**
     * Append Tab into UList
     * @param {HTMLUListElement} parent - UList to append entry to
     * @param {string} baseURL - URL relative to which local urls are interpreted
     */
    appendTab(parent, baseURL="") {
        let listItem = document.createElement("li");
        listItem.id = this.id;
        let link = document.createElement("a");
        link.textContent = this.name;
        link.href = this.url;
        if (this.internal) {
            link.href = baseURL + link.href;
        }
        listItem.appendChild(link);
        parent.appendChild(listItem);
    }
}

/**
 * Convert JSON array of objects to Tab objects
 * @param {Object[]} navData - JSON array of tabs
 * @returns {Tab[]} - corresponding array of Tab objects
 */
function readTabData(navData) {
    return navData.map(entry => new Tab(entry))
}

/**
 * Create and insert list of nav-bar tabs
 * @param {Tab[]} navData - array of nav-bar entries from JSON
 * @param {string} activeID - id of current  nav-bar tab
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function insertNav(navData, activeID, baseURL="") {
    let body = document.getElementsByTagName("body");
    let headDiv = document.getElementsByClassName("header");
    let navDiv = document.createElement("div");
    navDiv.className = "nav";
    let navList = document.createElement("ul");
    navData.forEach((entry) => {
        entry.appendTab(navList, baseURL);
    });
    navDiv.appendChild(navList);
    body[0].insertBefore(navDiv, headDiv[0])
    headDiv[0].style.paddingTop = "0em";
    let activeObj = document.getElementById(activeID);
    activeObj.className = "active";
}

export { buildPage };