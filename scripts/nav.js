import { getJSON } from "./getJSON.js";

function buildPage(activeID, baseURL) {
    buildNav(activeID, baseURL);
    buildFoot();
}

function buildFoot() {
    let body = document.getElementsByTagName("body");
    let foot = document.createElement("div");
    foot.className = "footer";

    let address = document.createElement("address");
    let email = document.createElement("code");
    let source = document.createElement('a');
    let myName = document.createTextNode("Subhaneil Lahiri: ")
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
    let navList = document.createElement("ul");
    navData.forEach(entry => {
        navList.appendChild(entryNav(entry, baseURL));
    });
    navDiv.appendChild(navList);
    body[0].insertBefore(navDiv, headDiv[0])
    headDiv[0].style.paddingTop = "0em";
    let activeObj = document.getElementById(activeID);
    activeObj.className = "active";
}

function entryNav(entry, baseURL) {
    let listItem = document.createElement("li");
    listItem.id = entry.id;
    let link = document.createElement("a");
    link.textContent = entry.name;
    link.href = entry.url;
    if (entry.internal) {
        link.href = baseURL + link.href;
    }
    listItem.appendChild(link);
    return listItem
}

export { buildPage };