import { getJSON } from "./getJSON.js";

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

export { presentationLinks };