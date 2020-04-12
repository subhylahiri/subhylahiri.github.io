
/**
 * @classdesc A piece of work: paper or presentation
 * @class {Object} Work
 * @param {string} type - type of work
 * @param {Object} entry - a JSON object containing properties
 */
class Work {
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
    link() {
        let link = document.createElement("a");
        link.title = this.description();
        link.href = this.getURL();
        return link
    }
}
/** URL relative to which local urls are interpreted */
Work.baseURL = "";

/**
 * Citation info for a paper
 * @typedef {Work} Paper
 * @property {string} author - author list
 * @property {string} ref - reference to journal/eprint
 * @property {number} year - year of publication
 * @property {number} month - month of publication
 * @property {(string|boolean)} sameAs - corresponding article/preprint/false
 */
class Paper extends Work {
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
            /** corresponding article/preprint/false
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
    /**
     * Put an object property in a span of that class
     * @param {string} field - name of field to put in span
     * @returns {HTMLSpanElement} span element containing field
     */
    span(field) {
        let span = document.createElement("span");
        span.className = field;
        if (field in this) {
            span.textContent = this[field];
        }
        return span
    }
    /**
     * put authors in a span
     * @param {RegExp} myName - regex matching my name
     */
    authorSpan() {
        let span = this.span("author");
        if (Paper.myName.test(this.author)) {
            span.textContent = "";
            const items = this.author.match(Paper.myName);
            this.self = items[2];
            span.appendChild(document.createTextNode(items[1]));
            span.appendChild(this.span("self"));
            span.appendChild(document.createTextNode(items[3]));
        }
        return span
    }
    /**
     * Produce lList of elements to put in citation
     * @returns {HTMLElement[]} list of elements to put in citation
     */
    cite() {
        let link = this.link();
        [this.refSpan(), addSpace(), this.span("year")].forEach(element => {
            link.appendChild(element);
        });
        return [this.authorSpan(), addSpace(), this.span("title"), addSpace(), link]
    }
    /**
     * Compare two papers for sorting
     * @param {Paper} paperA - first paper to compare
     * @param {Paper} paperB - second paper to compare
     */
    static compare(paperA, paperB) {
        const yearDiff = paperB.year - paperA.year;
        return yearDiff === 0 ? paperB.month - paperA.month : yearDiff
    }
}
Paper.myName = /(.*)([^\w\W])(.*)/

class Article extends Paper {
    /**
     * Produce span for journal reference
     * @returns {HTMLSpanElement} span containing reference
     */
    refSpan() {
        let span = this.span("journal");
        const items = this.ref.match(/([^\d]+)(\d+)([^\d].*)/);
        this.volume = items[2];
        span.appendChild(document.createTextNode(items[1]));
        span.appendChild(this.span("volume"));
        span.appendChild(document.createTextNode(items[3]));
        return span
    }
    /**
     * Produce list of elements to put in citation
     * @returns {HTMLElement[]} list of elements to put in citation
     */
    cite(preprints) {
        let citation = super.cite()
        if (this.sameAs) {
            const preprint = getEprint(this.sameAs, preprints);
            this.eprint = preprint.ref;
            let link = preprint.link();
            link.appendChild(this.span("eprint"));
            citation.push(document.createTextNode(", "));
            citation.push(link);
        }
        citation.push(document.createTextNode("."));
        return citation
    }
}

class Preprint extends Paper {
    /**
     * Produce span for eprint reference
     * @returns {HTMLSpanElement} span containing reference
     */
    refSpan() {
        let span = this.span("eprint");
        span.textContent = this.ref;
        return span
    }
    /**
     * Produce list of elements to put in citation
     * @returns {HTMLElement[]} list of elements to put in citation
     */
    cite() {
        if (this.sameAs) {
            return []
        }
        let citation = super.cite();
        citation.push(document.createTextNode("."));
        return citation
    }
}

const worksMap = {
    "article": Article,
    "preprint": Preprint,
    "slides": Work,
    "poster": Work,
}

/**
 * All of the works associated with a project
 * @typedef {Object} Project
 * @property {string} title - name of project
 * @property {Paper[]} article - array of article objects
 * @property {Paper[]} preprint - array of preprint objects
 * @property {Work[]} slides - array of slides objects
 * @property {Work[]} poster - array of poster objects
 */
class Project {
    constructor(projectData) {
        /** Title of project */
        this.title = projectData.title;
        ["article", "preprint", "slides", "poster"].forEach(type => {
            this[type] = projectData[type].map(entry => new worksMap[type](type, entry));
        });
    }
}

/**
 * Convert JSON dict of objects to Project objects
 * @param {Object} worksData - JSON dict of works
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
 * Add a text element comprising a space
 * @returns {Text} a space
 */
function addSpace() {
    return document.createTextNode(" ");
}
/**
 * Get the preprint object from its id
 * @param {string} id - the id of the preprint object
 * @param {Paper[]} preprints - array of preprint objects
 * @returns {Paper} the preprint object with details
 */
function getEprint(id, preprints) {
    let theEntry = null;
    preprints.forEach(entry => {
        if (entry.id === id) {
            theEntry = entry;
        }
    });
    if (theEntry) {
        return theEntry
    }
    throw `Unknown eprint: ${id}`;
}

export { Work, Paper, Article, Preprint, Project, readWorks }
