import { insertThings } from "./getJSON.js";

/** @classdesc A piece of work: paper or presentation */
class Work {
    /**
     * @param {string} type - type of work
     * @param {Object} entry - a JSON object containing properties
     */
    constructor(type, entry) {
        /** type of work item */
        this.type = type;
        /** identifier of work item */
        this.id = "";
        /** display name of work item */
        this.title = "";
        /** URL of file to link to */
        this.url = "";
        if (entry) {
            Object.assign(this, entry);
        }
    }
    /** URL of a copy of this work */
    getURL() { return Work.baseURL + this.url; }
    /** Description of work for tool-tips */
    description() { return this.title; }
    /** Create a link element to this work
     * @param  {...(HTMLElement|string|number)} elements - things to put in link
     * @returns {HTMLAnchorElement} the link element
     */
    link(...elements) {
        let link = document.createElement("a");
        link.title = this.description();
        link.href = this.getURL();
        insertThings(link, ...elements);
        return link
    }
    /** Create a list item for this work
     * @param  {...(HTMLElement|string|number)} elements - things to put in li
     * @returns {HTMLAnchorElement} the link element
     */
    listItem(...elements) {
        let item = document.createElement("li");
        item.className = this.type;
        insertThings(item, ...elements);
        return item
    }
}
/** URL relative to which local urls are interpreted */
Work.baseURL = "";

/** @classdesc Citation info for a paper */
class Paper extends Work {
    /**
     * @param {string} type - type of work
     * @param {Object} entry - a JSON object containing properties
     */
    constructor(type, entry) {
        super(type, entry);
        if (entry === undefined) {
            /** list of paper authors */
            this.author = "";
            /** reference to journal/eprint */
            this.ref = "";
            /** year of publication */
            this.year = 0;
            /** month of publication */
            this.month = 0;
            /** id of corresponding article/preprint/false
             * @type {(string|boolean)}
             */
            this.sameAs = false;
        }
    }
    /** URL of a copy of this work */
    getURL() { return this.url; }
    /** Description of work for tool-tips */
    description() {
        return `“${this.title}”, ${this.ref} (${this.year})`;
    }
}

/** @classdesc A conference abstract */
class Abstract extends Paper {
    /** URL of a copy of this work */
    getURL() { return Abstract.baseURL + this.url; }
}

/** @classdesc All of the works associated with a project */
class Project {
    /**
     * @param {Object} projectJSON - JSON object containing works data
     */
    constructor(projectJSON) {
        /** The title of the project */
        this.title = "";
        /** @type {Paper[]} - List of articles for this project */
        this.article = [];
        /** @type {Paper[]} - List of preprints for this project */
        this.preprint = [];
        /** @type {Work[]} - List of slides for this project */
        this.slides = [];
        /** @type {Work[]} - List of posters for this project */
        this.poster = [];
        /** @type {Abstract[]} - List of abstracts for this project */
        this.abstract = [];
        if (projectJSON instanceof Project) {
            Object.assign(this, projectJSON);
        } else if (projectJSON) {
            this.title = projectJSON.title;
            for (const type in Project.worksMap) {
                this[type] = projectJSON[type].map(Project.workMaker(type));
            }
        }
    }
    /** Does the project have any works of the relevant types
     * @returns {Boolean} - are any relevant work arrays non-empty?
     */
    hasWorks() {
        return Object.keys(Project.worksMap).some(type => this[type])
    }
    /** Create a function to convert JSON object to Work object
     * @param {string} type - type of work to create
     * @returns {Function} converter function
     */
    static workMaker(type) {
        return entry => new Project.worksMap[type](type, entry)
    }
}
/** Class to use for each entry type */
Project.worksMap = {
    "article": Paper,
    "preprint": Paper,
    "slides": Work,
    "poster": Work,
    "abstract": Abstract,
}
/**
 * Choose which types of work will be included
 * @param {string[]} types - array of names of work types to include
 */
function chooseWorkTypes(types) {
    for (const type in Project.worksMap) {
        if (!types.includes(type)) {
            delete Project.worksMap[type];
        }
    }
}

/** Process JSON data into dict of id -> project object
 * @param {Object.<string,Object>} worksJSON - json dict: id -> project data
 * @returns {Object.<string,Project>} dict: id -> project object
 */
function readProjectsJSON(worksJSON) {
    let projects = {};
    for (const projectID in worksJSON) {
        projects[projectID] = new Project(worksJSON[projectID]);
    }
    return projects
}

/** Make a function to loop over projects in JSON data
 * @param {string} listClass - CSS class for UList
 * @param {string} textField - Project field for paragraph contents, if present
 * @returns {projectLoopJSON} function to loop over projects in JSON data
 */
function makeProjectLoop(listClass, textField) {
    /**
     * Process JSON data to add work list to each project id'd paragraph
     * @param {Object.<string,Project>} projectsData - json dict: id -> project
     */
    function projectLoopJSON(projectsData) {
        for (const projectID in projectsData) {
            const project = projectsData[projectID];
            let paragraph = document.getElementById(projectID);
            if (paragraph && project.hasWorks()) {
                let list = document.createElement("ul");
                for (const type in Project.worksMap) {
                    project[type].forEach(entry => entry.appendList(list));
                }
                if (listClass) { list.className = listClass; }
                if (textField) { paragraph.textContent = project[textField]; }
                paragraph.after(list);
            }
        }
    }
    return projectLoopJSON
}
/** Function to process JSON data to add work list to each project id'd paragraph
 * @callback projectLoopJSON
 * @param {Object.<string,Project>} worksJSON - json dict: id -> project
 */

export { readProjectsJSON, makeProjectLoop, chooseWorkTypes, Project, Abstract, Paper, Work }
