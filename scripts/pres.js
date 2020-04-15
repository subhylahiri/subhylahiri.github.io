import { getJSON } from "./getJSON.js";
import { readWorks, Project, Work, loopJSON } from "./works.js";

/**
 * Append presentation to list of project's materials
 * @param {HTMLUListElement} parent UList to append item to
 */
Work.prototype.appendList = function(parent) {
    const link = this.link(this.title);
    parent.appendChild(this.listItem(link, "."));
}
/** Class to use for each entry type */
Project.worksMap = {
    "slides": Work,
    "poster": Work,
}

/**
 * Read JSON file and pass to presentationJSON
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function presentationLinks(baseURL = '') {
    Work.baseURL = baseURL;
    getJSON(`${baseURL}data/works.json`)
        .then(worksData => loopJSON(worksData, projectPresentations));
}

/**
 * Create UList of presentations for one project
 * @param {HTMLParagraphElement} paragraph - before list of presentations
 * @param {Project} projectData - object with: work types -> array of works
 */
function projectPresentations(paragraph, projectData) {
    let listEntries = document.createElement("ul");
    listEntries.className = "materials";
    for (const type in Project.worksMap) {
        projectData[type].forEach(entry => entry.appendList(listEntries));
    }
    paragraph.className = "presentation";
    paragraph.textContent = projectData.title;
    paragraph.after(listEntries);
}

export { presentationLinks };