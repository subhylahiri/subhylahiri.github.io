import { getJSON } from "./getJSON.js";

const externals = ["article", "preprint"];
const internals = ["slides", "poster"];

/**
 * Read JSON file and pass to projectJSON
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function projectLinks(baseURL = '') {
    getJSON(`${baseURL}data/works.json`)
        .then((worksData) => {
            projectJSON(worksData, baseURL);
        });
}

/**
 * Process JSON data to add works list to each project id'd paragraph
 * @param {Object} worksData - json dict: project id -> title, work types
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function projectJSON(worksData, baseURL) {
    for (const project in worksData) {
        let paragraph = document.getElementById(project);
        if (paragraph) {
            paragraph.className = "project";
            projectWorks(paragraph, worksData[project], baseURL);
        }
    }
}

/**
 * Create UList of works for one project
 * @param {HTMLParagraphElement} paragraph - paragraph before UList of works for project
 * @param {Object} projectData - dict: work types -> array of works
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function projectWorks(paragraph, projectData, baseURL) {
    let list = document.createElement("ul");
    list.className = "project_links";
    for (const type of externals.concat(internals)) {
        projectData[type].forEach(entry => {
            projectEntry(list, entry, type, baseURL);
        });
    }
    paragraph.after(list);
}

/**
 * Create icon li element for one work
 * @param {HTMLUListElement} list - UList of works for one project
 * @param {Object} entry - dict of info about work
 * @param {string} type - type of work
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function projectEntry(list, entry, type, baseURL) {
    let listItem = document.createElement("li");
    let link = document.createElement("a");

    link.className = "icon";
    link.title = makeDescription(entry);
    link.href = makeURL(entry, type, baseURL);
    listItem.className = type;
    listItem.appendChild(link);
    list.appendChild(listItem);
}

/**
 * Make description of work for paper/presentation work types
 * @param {Object} entry - dict of info about work
 * @returns {string} - description of work
 */
function makeDescription(entry) {
    if ("description" in entry) {
        return entry.description
    }
    return `“${entry.title}”, ${entry.ref} (${entry.year})`;
}
/**
 * Make URL of work for local/global work types
 * @param {Object} entry - dict of info about work
 * @param {string} type - type of work
 * @param {string} baseURL - URL relative to which local urls are interpreted
 * @returns {string} - URL of work
 */
function makeURL(entry, type, baseURL) {
    if (isInternal(type)) {
        return baseURL + entry.url
    }
    return entry.url
}

/**
 * Is the work type one with a local URL?
 * @param {string} type - type of work
 * @returns {boolean} - does it have a local URL?
 */
function isInternal(type) {
    if (internals.includes(type)) {
        return true
    } else if (externals.includes(type)) {
        return false
    } else {
        throw `Unknown work type: ${type}`
    }
}

export { projectLinks };