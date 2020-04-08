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
            paragraph.textContent = projectData.title;
            paragraph.after(projectPresentations(projectData, baseURL));
        }
    }
}

function projectPresentations(projectData, baseURL) {
    let listEntries = document.createElement("ul");
    listEntries.className = "materials";
    ["slides", "poster"].forEach(type => {
        projectData[type].forEach(entry => {
            listEntries.appendChild(presentationMaterials(entry, type, baseURL));
        });
    });
    return listEntries
}

function presentationMaterials(entry, type, baseURL) {
    let listItem = document.createElement("li");
    let link = document.createElement("a");

    link.textContent = entry.description;
    link.href = baseURL + entry.url;
    listItem.className = type;
    listItem.appendChild(link);
    listItem.textContent +=".";
    return listItem
}

export { presentationLinks };