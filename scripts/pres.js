import { getJSON } from "./getJSON.js";
import { Project, Work, makeProjectLoop, readProjectsJSON } from "./works.js";

/**
 * Append presentation to list of project's materials
 * @param {HTMLUListElement} parent UList to append item to
 */
Work.prototype.appendList = function appendList(parent) {
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
        .then(readProjectsJSON)
        .then(makeProjectLoop("materials", "presentation", "title"));
}

export { presentationLinks };