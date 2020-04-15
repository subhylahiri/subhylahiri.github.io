import { getJSON } from "./getJSON.js";
import { Project, Work, loopJSON } from "./works.js";

/**
 * Append icon to list of project's works
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
        .then(worksData => loopJSON(worksData, projectWorks));
}

/**
 * Create UList of works for one project
 * @param {HTMLParagraphElement} paragraph - before list of presentations
 * @param {Project} projectData - object with: work types -> array of works
 */
function projectWorks(paragraph, projectData) {
    let listEntries = document.createElement("ul");
    listEntries.className = "project_links";
    for (const type in Project.worksMap) {
        projectData[type].forEach(entry => entry.appendList(listEntries));
    }
    paragraph.className = "project";
    paragraph.after(listEntries);
}

export { projectLinks };