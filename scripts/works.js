import { getJSON } from "./getJSON.js";

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
            paragraph.after(projectWorks(worksData[project], baseURL));
        }
    }
}

/**
 * Create UList of works for one project
 * @param {Object} projectData - dict: work types -> array of works
 * @param {string} baseURL - URL relative to which local urls are interpreted
 * @returns {HTMLUListElement} - UList of works for one project
 */
function projectWorks(projectData, baseURL) {
    let listEntries = document.createElement("ul");
    listEntries.className = "project_links";
    ["article", "preprint", "slides", "poster"].forEach(type => {
        projectData[type].forEach(entry => {
            listEntries.appendChild(projectEntry(entry, type, baseURL));
        });
    });
    return listEntries
}

/**
 * Create icon li element for one work
 * @param {Object} entry - dict of info about work
 * @param {string} type - type of work
 * @param {string} baseURL - URL relative to which local urls are interpreted
 * @returns {HTMLLIElement} - icon li element for one work
 */
function projectEntry(entry, type, baseURL) {
    const description = makeDescription(entry, type);
    let listItem = document.createElement("li");
    let link = document.createElement("a");

    link.className = "icon";
    link.title = description;
    link.href = makeURL(entry, type, baseURL);
    listItem.className = type;
    listItem.appendChild(link);
    return listItem
}

/**
 * Make description of work for paper/presentation work types
 * @param {Object} entry - dict of info about work
 * @param {string} type - type of work
 * @returns {string} - description of work
 */
function makeDescription(entry, type) {
    if (isInternal(type)) {
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
    if (type === "slides" || type === "poster") {
        return true
    } else if (type === "article" || type === "preprint") {
        return false
    } else {
        throw `Unknown work type: ${type}`
    }
}

export { projectLinks };