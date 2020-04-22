import { getJSON } from "./getJSON.js";
import { Work, makeProjectLoop, readProjectsJSON, chooseWorkTypes } from "./works.js";

/** Append presentation to list of project's materials
 * @param {HTMLUListElement} list - UList to append item to
 */
Work.prototype.appendList = function appendList(list) {
    const link = this.link(this.description());
    list.appendChild(this.listItem(link, "."));
}

/** Read JSON file and pass to presentationJSON
 * @param {string[]} types - array of names of work types to include
 * @param {string} baseURL - URL relative to which local urls are interpreted
 *
 * Select projects by including/excluding headings with id's in HTML file
 */
function presentationLinks(types=["slides", "poster"], baseURL = "") {
    Work.baseURL = baseURL;
    chooseWorkTypes(types);
    getJSON(`${baseURL}data/works.json`)
        .then(readProjectsJSON)
        .then(makeProjectLoop("materials", true));
}

export { presentationLinks };