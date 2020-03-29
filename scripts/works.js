import { getJSON } from "./nav.js";

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
    if (!isInternal(type)) {
        work += ` cite="${description}"`;
    }
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

function presentationLinks(baseURL = '') {
    getJSON(`${baseURL}data/works.json`)
        .then((worksData) => {
            presentationJSON(worksData, baseURL);
        })
}

function presentationJSON(worksData, baseURL) {
    for (const project in worksData) {
        const projectData = worksData[project];
        let paragraph = document.getElementById(project);
        if ((projectData.slides || projectData.poster) && paragraph) {
            paragraph.className = "presentation";
            paragraph.innerHTML = projectData.title;
            paragraph.insertAdjacentHTML(
                'afterend', projectPresentations(projectData, baseURL)
            );
        }
    }
}

function projectPresentations(projectData, baseURL) {
    let listEntries = '<ul class="materials">';
    ["slides", "poster"].forEach(type => {
        projectData[type].forEach(entry => {
            listEntries += presentationMaterials(entry, type, baseURL)
        });
    });
    return `${listEntries}</ul>`
}

function presentationMaterials(entry, type, baseURL) {
    return `<li class="${type}"><a href="${baseURL + entry.url}">${entry.description}</a>.</li>`
}

export { projectLinks, presentationLinks };