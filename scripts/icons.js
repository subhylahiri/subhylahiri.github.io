import { getJSON } from "./getJSON.js";
import { Work, makeProjectLoop, readProjectsJSON, chooseWorkTypes } from "./works.js";

/** Append icon to list of project's works
 * @param {HTMLUListElement} list - UList to append item to
 */
Work.prototype.appendList = function appendList(list) {
    let link = this.link();
    link.className = "icon";
    list.appendChild(this.listItem(link));
}

/** Read JSON file and pass to projectJSON
 * @param {string[]} types - array of names of work types to include
 * @param {string} baseURL - URL relative to which local urls are interpreted
 *
 * Select projects by including/excluding headings with id's in HTML file
 */
function projectLinks(types=["article", "preprint", "slides", "poster", "abstract"], baseURL = "") {
    Work.baseURL = baseURL;
    chooseWorkTypes(types);
    getJSON(`${baseURL}data/works.json`)
        .then(readProjectsJSON)
        .then(makeProjectLoop("project_links"));
}

export { projectLinks };