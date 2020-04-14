
/**
 * @classdesc A piece of work: paper or presentation
 */
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
    getURL() {
        return Work.baseURL + this.url;
    }
    description() {
        return this.title;
    }
    /**
     * Create a link element to this work
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
    /**
     * Create a list item for this work
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

/**
 * @classdesc Citation info for a paper
 */
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
    getURL() {
        return this.url;
    }
    description() {
        return `“${this.title}”, ${this.ref} (${this.year})`;
    }
}

/**
 * @classdesc All of the works associated with a project
 */
class Project {
    /**
     * @param {Object} projectData - JSON object containing works data
     */
    constructor(projectData) {
        this.title = projectData.title;
        for (const type in Project.worksMap) {
            this[type] = projectData[type].map(Project.makeWork(type));
        }
    }
    /**
     * Create a function to convert JSON object to Work object
     * @param {string} type - type of work to create
     * @returns {Function} converter function
     */
    static makeWork(type) {
        return entry => new Project.worksMap[type](type, entry)
    }
}
/** Class to use for each entry type */
Project.worksMap = {
    "article": Paper,
    "preprint": Paper,
    "slides": Work,
    "poster": Work,
}

/**
 * Convert JSON dict of objects to Project objects
 * @param {Object} worksData - JSON dict of projects and works
 * @returns {Object.<string,Project>} - corresponding dict of Project objects
 */
function readWorks(worksData) {
    let projects = {};
    for (const projID in worksData) {
        projects[projID] = new Project(worksData[projID]);
    }
    return projects
}

/**
 * Insert some element(s) into another
 * @param {HTMLElement} parent - element to insert things into
 * @param {...(HTMLElement|string|number)} elements - things to insert into parent
 */
function insertThings(parent, ...elements) {
    elements.forEach(item => {
        if (["string", "number"].includes(typeof item)) {
            parent.appendChild(document.createTextNode(item));
        } else {
            parent.appendChild(item);
        }
    });
}

export { readWorks, Project, Paper, Work, insertThings }
