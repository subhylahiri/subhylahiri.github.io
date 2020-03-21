import { getJSON } from "./nav.js";

function projectLinks(baseURL) {
    if (baseURL === undefined) {
        baseURL = '';
    }
    getJSON(`${baseURL}data/works.json`)
        .then((worksData) => {
            for (const project in worksData) {
                let paragraph = document.getElementById(project);
                if (paragraph) {
                    paragraph.insertAdjacentHTML('afterend', projectWorks(worksData[project], baseURL));
                }
            }
        })
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
    let typeName = type.charAt(0).toUpperCase() + type.substring(1)
    let work = `<li><a class="icon ${type}" href="`
    if (type === "slides" || type === "poster") {
        work += baseURL;
    }
    work += `${entry.url}" title="${entry.description}"`;
    if (type === "article" || type === "preprint") {
        work += `cite="${entry.description}"`;
    }
    return work + `>${typeName}</a></li> `
}

function presentationLinks(baseURL) {
    if (baseURL === undefined) {
        baseURL = '';
    }
    getJSON(`${baseURL}data/works.json`)
        .then((worksData) => {
            for (const project in worksData) {
                const projectData = worksData[project];
                let paragraph = document.getElementById(project);
                if ((projectData.slides || projectData.poster) && paragraph) {
                    paragraph.className = "presentation";
                    paragraph.innerHTML = projectData.title;
                    paragraph.insertAdjacentHTML('afterend', projectPresentations(projectData, baseURL));
                }
            }
        })
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