import { getJSON } from "./getJSON.js";
import { readWorks, Project, Work } from "./works.js";

/** Append presentation to list of project's materials
 * @param {HTMLUListElement} parent UList to append item to
 */
Work.prototype.appendList = function(parent) {
    let link = this.link(document.createTextNode(this.title));
    let listItem = this.listItem(link, document.createTextNode("."));
    parent.appendChild(listItem);
}

/**
 * Read JSON file and pass to presentationJSON
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function presentationLinks(baseURL = '') {
    Work.baseURL = baseURL;
    getJSON(`${baseURL}data/works.json`)
        .then(worksData => presentationJSON(readWorks(worksData)));
}

/**
 * Process JSON data to add presentation list to each project id'd paragraph
 * @param {Object.<string,Project>} worksData - json dict: project id -> title, work types
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function presentationJSON(worksData) {
    for (const project in worksData) {
        const projectData = worksData[project];
        let paragraph = document.getElementById(project);
        if ((projectData.slides || projectData.poster) && paragraph) {
            paragraph.className = "presentation";
            paragraph.textContent = projectData.title;
            paragraph.after(projectPresentations(projectData));
        }
    }
}

/**
 * Create UList of presentations for one project
 * @param {Project} projectData - dict: work types -> array of works
 * @param {string} baseURL - URL relative to which local urls are interpreted
 * @returns {HTMLUListElement} list of presentations
 */
function projectPresentations(projectData) {
    let listEntries = document.createElement("ul");
    listEntries.className = "materials";
    ["slides", "poster"].forEach(type => {
        projectData[type].forEach(entry => {
            entry.appendList(listEntries);
        });
    });
    return listEntries
}

export { presentationLinks };