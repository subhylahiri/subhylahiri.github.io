import { getJSON } from "./getJSON.js";

/**
 * @classdesc A tab in the navigation bar
 */
class Tab {
    /**
     * @param {Object} entry - a JSON object containing properties
     */
    constructor(entry) {
        /** identifier of list item */
        this.id = "";
        /** display name of tab */
        this.name = "";
        /** URL of page to link to */
        this.url = "";
        /** is the URL local? */
        this.internal = true;
        if (entry) {
            Object.assign(this, entry);
        }
    }
    /**
     * Append Tab into UList
     * @param {HTMLUListElement} parent - UList to append entry to
     */
    appendTab(parent) {
        let listItem = document.createElement("li");
        listItem.id = this.id;
        let link = document.createElement("a");
        link.textContent = this.name;
        link.href = (this.internal ? Tab.baseURL : "") + this.url;
        listItem.appendChild(link);
        parent.appendChild(listItem);
    }
}
/** URL relative to which local urls are interpreted */
Tab.baseURL = "";

/**
 * Convert JSON array of objects to Tab objects
 * @param {Object[]} navData - JSON array of tabs
 * @returns {Tab[]} - corresponding array of Tab objects
 */
function readTabData(navData) {
    return navData.map(entry => new Tab(entry))
}

/**
 *  Create and insert nav-bar and footer
 * @param {string} activeID  - id of current nav-bar tab
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function buildPage(activeID, baseURL = '') {
    buildNav(activeID, baseURL);
    buildFoot();
}

/** Create and insert footer */
function buildFoot() {
    const body = document.getElementsByTagName("body");
    let foot = document.createElement("div");
    foot.className = "footer";

    let address = document.createElement("address");
    let email = document.createElement("code");
    let source = document.createElement('a');
    const myName = document.createTextNode("Subhaneil Lahiri: ");
    const spacer = document.createTextNode(". ");

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
    Tab.baseURL = baseURL;
    getJSON(`${baseURL}data/nav.json`)
        .then(navData => insertNav(readTabData(navData), activeID));
}

/**
 * Create and insert list of nav-bar tabs
 * @param {Tab[]} navData - array of nav-bar entries from JSON
 * @param {string} activeID - id of current  nav-bar tab
 */
function insertNav(navData, activeID) {
    const body = document.getElementsByTagName("body");
    let headDiv = document.getElementsByClassName("header");
    let navDiv = document.createElement("div");
    navDiv.className = "nav";
    let navList = document.createElement("ul");
    navData.forEach(entry => entry.appendTab(navList));
    navDiv.appendChild(navList);
    body[0].insertBefore(navDiv, headDiv[0])
    headDiv[0].style.paddingTop = "0em";
    let activeObj = document.getElementById(activeID);
    activeObj.className = "active";
}

export { buildPage };