import { getJSON } from "./getJSON.js";
import { readWorks, Project, Work } from "./works.js";

/** Append icon to list of project's works
 * @param {HTMLUListElement} parent UList to append item to
 */
Work.prototype.appendList = function(parent) {
    let link = this.link();
    link.className = "icon";
    parent.appendChild(this.listItem(link));
}

/**
 * Read JSON file and pass to projectJSON
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function projectLinks(baseURL = '') {
    Work.baseURL = baseURL;
    getJSON(`${baseURL}data/works.json`)
        .then(worksData => projectJSON(readWorks(worksData)));
}

/**
 * Process JSON data to add works list to each project id'd paragraph
 * @param {Object.<string,Project>} worksData - json dict: project id -> title, work types
 */
function projectJSON(worksData) {
    for (const project in worksData) {
        let paragraph = document.getElementById(project);
        if (paragraph) {
            paragraph.after(projectWorks(worksData[project]));
        }
    }
}

/**
 * Create UList of works for one project
 * @param {Project} projectData - dict: work types -> array of works
 * @returns {HTMLUListElement} - UList of works for one project
 */
function projectWorks(projectData) {
    let listEntries = document.createElement("ul");
    listEntries.className = "project_links";
    ["article", "preprint", "slides", "poster"].forEach(type => {
        projectData[type].forEach(entry => entry.appendList(listEntries));
    });
    return listEntries
}

export { projectLinks };