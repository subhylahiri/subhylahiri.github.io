import { getJSON } from "./getJSON.js";

function buildPage(activeID, baseURL) {
    buildNav(activeID, baseURL);
    buildFoot();
}

function buildFoot() {
    let body = document.getElementsByTagName("body");
    let footDiv = document.createElement("div");
    footDiv.className = "footer";
    footDiv.innerHTML = '<address>Subhaneil Lahiri: <code>sulahiri at stanford dot edu</code>. ' +
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
    let navString = "<ul>";
    navData.forEach(entry => {
        navString += entryNav(entry, baseURL);
    });
    navDiv.innerHTML = `${navString}</ul>`;
    body[0].insertBefore(navDiv, headDiv[0])
    headDiv[0].style.paddingTop = "0em";
    let activeObj = document.getElementById(activeID);
    activeObj.className = "active";
}

function entryNav(entry, baseURL) {
    let listItem = `<li id="${entry.id}"><a href="`;
    if (entry.internal) {
        listItem += baseURL;
    }
    return `${listItem + entry.url}">${entry.name}</a></li>`
}

export { buildPage };