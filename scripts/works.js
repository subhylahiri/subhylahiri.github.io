import { getJSON } from "./getJSON.js";

function projectLinks(baseURL = '') {
    getJSON(`${baseURL}data/works.json`)
        .then((worksData) => {
            projectJSON(worksData, baseURL);
        });
}

function projectJSON(worksData, baseURL) {
    for (const project in worksData) {
        let paragraph = document.getElementById(project);
        if (paragraph) {
            paragraph.after(projectWorks(worksData[project], baseURL));
        }
    }
}

function projectWorks(projectData, baseURL) {
    let listEntries = document.createElement("ul");
    listEntries.className = "project_links";
    ["article", "preprint", "slides", "poster"].forEach(type => {
        projectData[type].forEach(entry => {
            listEntries.appendChild(projectEntry(entry, type, baseURL));
        });
    });
    return listEntries
}

function projectEntry(entry, type, baseURL) {
    const typeName = type.charAt(0).toUpperCase() + type.substring(1)
    const description = makeDescription(entry, type);
    let listItem = document.createElement("li");
    let link = document.createElement("a");

    link.className = "icon " + type;
    link.title = description;
    link.textContent = typeName;
    link.href = entry.url;
    if (isInternal(type)) {
        link.href = baseURL + link.href;
    }
    listItem.appendChild(link)
    return listItem
}

function makeDescription(entry, type) {
    if (isInternal(type)) {
        return entry.description
    }
    return `‘${entry.title}’, ${entry.ref} (${entry.year})`;
}

function isInternal(type) {
    if (type === "slides" || type === "poster") {
        return true
    } else if (type === "article" || type === "preprint") {
        return false
    } else {
        throw `Unknown work type: ${type}`
    }
}

export { projectLinks };