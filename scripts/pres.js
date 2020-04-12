import { getJSON } from "./getJSON.js";
import { readWorks, Project, Work } from "./works.js";

/** Append presentation to list of project's materials
 * @param {HTMLUListElement} parent UList to append item to
 */
Work.prototype.appendList = function(parent) {
    let listItem = document.createElement("li");
    let link = document.createElement("a");
    link.textContent = this.title;
    link.href = this.getURL();
    listItem.className = this.type;
    listItem.appendChild(link);
    listItem.appendChild(document.createTextNode("."));
    parent.appendChild(listItem);
}

/**
 * Read JSON file and pass to presentationJSON
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function presentationLinks(baseURL = '') {
    getJSON(`${baseURL}data/works.json`)
        .then((worksData) => {
            presentationJSON(readWorks(worksData), baseURL);
        })
}

/**
 * Process JSON data to add presentation list to each project id'd paragraph
 * @param {Object.<string,Project>} worksData - json dict: project id -> title, work types
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
 * @param {Project} projectData - dict: work types -> array of works
 * @param {string} baseURL - URL relative to which local urls are interpreted
 * @returns {HTMLUListElement} list of presentations
 */
function projectPresentations(projectData, baseURL) {
    let listEntries = document.createElement("ul");
    listEntries.className = "materials";
    ["slides", "poster"].forEach(type => {
        projectData[type].forEach(entry => {
            entry.appendList(listEntries);
            // listEntries.appendChild(presentationMaterials(entry, type, baseURL));
        });
    });
    return listEntries
}

/**
 * Create an li element for one presentation
 * @param {Work} entry - one slide/poster entry from json
 * @param {string} type - type of presentation (slides | poster)
 * @param {string} baseURL - URL relative to which local urls are interpreted
 * @returns {HTMLLIElement} list entry for a presentation
 */
function presentationMaterials(entry, type, baseURL) {
    let listItem = document.createElement("li");
    let link = document.createElement("a");

    link.textContent = entry.title;
    link.href = baseURL + entry.url;
    listItem.className = type;
    listItem.appendChild(link);
    listItem.appendChild(document.createTextNode("."));
    return listItem
}

export { presentationLinks };