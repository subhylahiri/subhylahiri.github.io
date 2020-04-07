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
            paragraph.insertAdjacentHTML(
                'afterend', projectWorks(worksData[project], baseURL)
            );
        }
    }
}

function projectWorks(projectData, baseURL) {
    let listEntries = '<ul class="project_links">';
    ["article", "preprint", "slides", "poster"].forEach(type => {
        projectData[type].forEach(entry => {
            listEntries += projectEntry(entry, type, baseURL);
        });
    });
    return `${listEntries}</ul>`
}

function projectEntry(entry, type, baseURL) {
    const typeName = type.charAt(0).toUpperCase() + type.substring(1)
    const description = makeDescription(entry, type);
    let work = `<li><a class="icon ${type}" href="`
    if (isInternal(type)) {
        work += baseURL;
    }
    work += `${entry.url}" title="${description}"`;
    return work + `>${typeName}</a></li> `
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