import { getJSON } from "./getJSON.js";

/**
 * Read JSON file and pass to presentationJSON
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function presentationLinks(baseURL = '') {
    getJSON(`${baseURL}data/works.json`)
        .then((worksData) => {
            presentationJSON(worksData, baseURL);
        })
}

/**
 * Process JSON data to add presentation list to each project id'd paragraph
 * @param {Object} worksData - json dict: project id -> title, work types
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
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

/**
 * Create UList of presentations for one project
 * @param {Object} projectData - dict: work types -> array of works
 * @param {string} baseURL - URL relative to which local urls are interpreted
 * @returns {HTMLUListElement} list of presentations
 */
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

/**
 * Create an li element for one presentation
 * @param {Object} entry - one slide/poster entry from json
 * @param {string} type - type of presentation (slides | poster)
 * @param {string} baseURL - URL relative to which local urls are interpreted
 * @returns {HTMLLIElement} list entry for a presentation
 */
function presentationMaterials(entry, type, baseURL) {
    let listItem = document.createElement("li");
    let link = document.createElement("a");

    link.textContent = entry.description;
    link.href = baseURL + entry.url;
    listItem.className = type;
    listItem.appendChild(link);
    listItem.appendChild(document.createTextNode("."));
    return listItem
}

export { presentationLinks };