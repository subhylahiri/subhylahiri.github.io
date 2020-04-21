import { getJSON } from "./getJSON.js";
import { Work, makeProjectLoop, readProjectsJSON, Project, Paper, Abstract } from "./works.js";

/** Append icon to list of project's works
 * @param {HTMLUListElement} parent UList to append item to
 */
Work.prototype.appendList = function appendList(parent) {
    let link = this.link();
    link.className = "icon";
    parent.appendChild(this.listItem(link));
}
/** Class to use for each entry type */
Project.worksMap = {
    "article": Paper,
    "preprint": Paper,
    "slides": Work,
    "poster": Work,
    "abstract": Abstract,
}

/** Read JSON file and pass to projectJSON
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function projectLinks(baseURL = '') {
    Work.baseURL = baseURL;
    getJSON(`${baseURL}data/works.json`)
        .then(readProjectsJSON)
        .then(makeProjectLoop("project_links"));
}

export { projectLinks };