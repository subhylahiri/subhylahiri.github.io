import { getJSON, insertThings } from "./getJSON.js";
import { Project, Paper, makeProjectLoop } from "./works.js";

/** @classdesc Citation info for a paper */
class Publication extends Paper {
    /**
     * @param {string} type - type of work
     * @param {Object} entry - a JSON object containing properties
     */
    constructor(type, entry) {
        super(type, entry);
        /** field -> function to post-process spans for given field */
        this.spanMap = {"author": ["", "self", Publication.myName]};
    }
    /**
     * Put an object property in a span of that class
     * @param {string} field - name of field to put in span
     * @returns {HTMLSpanElement} span element containing field
     */
    span(field) {
        let span = document.createElement("span");
        span.className = field;
        span.textContent = this[field];
        if (field in this.spanMap) {
            spanMapper(span, ...this.spanMap[field]);
        }
        return span
    }
    /**
     * Produce List of elements to put in citation
     * @returns {HTMLElement[]} list of elements to put in citation
     */
    cite() {
        const link = this.link(this.span("ref"), " ", this.span("year"));
        return [this.span("author"), " ", this.span("title"), " ", link, "."]
    }
    /** Append citation to list of papers
     * @param {HTMLUListElement} parent UList to append item to
     */
    appendList(parent) {
        const citation = this.cite();
        if (citation.length) {
            parent.appendChild(this.listItem(...citation));
        }
    }
    /**
     * Compare two papers for sorting with reverse chronology
     * @param {Paper} paperA - first paper to compare
     * @param {Paper} paperB - second paper to compare
     * @returns {number} positive if paperA goes after paperB
     */
    static compare(paperA, paperB) {
        const yearDiff = paperB.year - paperA.year;
        return yearDiff ? yearDiff : paperB.month - paperA.month
    }
}

/** @classdesc Citation info for a journal article */
class Article extends Publication {
    /**
     * @param {string} type - type of work
     * @param {Object} entry - a JSON object containing properties
     */
    constructor(type, entry) {
        super(type, entry);
        /** function to post-process ref span */
        this.spanMap.ref = ["journal", "volume", /([^\d]+)(\d+)([^\d].*)/];
    }
    /**
     * Produce list of elements to put in citation
     * @returns {HTMLElement[]} list of elements to put in citation
     */
    cite() {
        let citation = super.cite()
        if (this.sameAs) {
            const preprint = Article.eprints[this.sameAs];
            citation.splice(-1, 0, ", ", preprint.link(preprint.span("ref")));
        }
        return citation
    }
}
/** Maps eprint ids to Preprint object
 * @type {Object.<string,Preprint>}
 */
Article.eprints = {};

/** @classdesc Citation info for a preprpint */
class Preprint extends Publication {
    /**
     * @param {string} type - type of work
     * @param {Object} entry - a JSON object containing properties
     */
    constructor(type, entry) {
        super(type, entry);
        /** function to post-process ref span */
        this.spanMap.ref = ["eprint"];
    }
    /**
     * Produce list of elements to put in citation
     * @returns {HTMLElement[]} list of elements to put in citation
     */
    cite() {
        return this.sameAs ? [] : super.cite()
    }
}

/**
 * Callback to pick out a part of a span's contents and put in a child span
 * @param {HTMLSpanElement} span - containing span
 * @param {string} spanClass - CSS class to use for span, "" to leave it as is
 * @param {string} partClass - CSS class of central part's span
 * @param {RegExp} pattern - pattern of part to pick out, with 3 capturing groups
 */
function spanMapper(span, spanClass, partClass, pattern) {
    if (spanClass) {
        span.className = spanClass;
    }
    if (partClass && pattern.test(span.textContent)) {
        const items = span.textContent.match(pattern);
        let part = document.createElement("span");
        part.className = partClass;
        part.textContent = items[2];
        span.textContent = "";
        insertThings(span, items[1], part, items[3]);
    }
}

/** Class to use for each entry type */
Project.worksMap = {
    "article": Article,
    "preprint": Preprint,
}
/** Titles of sections for each paper type */
const typeTitles = {
    "article": "Journal and conference papers",
    "preprint": "Preprints",
    "abstract": "Conference abstracts",
};

/** Pattern to match for my name */
Publication.myName = /(.*)(S[\w.]* Lahiri)(.*)/;

/**
 * Read JSON file and pass to presentationJSON
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function publicationLinks(baseURL = '') {
    getJSON(`${baseURL}data/works.json`)
        .then(collectPapers)
        .then(makeProjectLoop("papers", "", "title"));
}

/**
 * Process JSON data to collect paper lists as type id'd projects
 * @param {Object.<string,Object>} worksJSON - json dict: id -> project data
 * @returns {Object.<string,Project>} dict: type -> all works of that type
 */
function collectPapers(worksJSON) {
    let papers = {};
    typesLoop(papers, (_proj, type) => papers[type + "s"] = new Project());
    typesLoop(papers, (proj, type) => proj.title = typeTitles[type]);
    for (const projectID in worksJSON) {
        const project = new Project(worksJSON[projectID]);
        typesLoop(papers, (proj, type) => proj[type].push(...project[type]));
    }
    typesLoop(papers, (proj, type) => proj[type].sort(Publication.compare));
    Article.eprints = objectify(papers.preprints.preprint);
    return papers;
}

/**
 * Loop over paper types to update project for that paper type
 * @param {Object.<string,Project>} papers - dict: type -> all works of that type
 * @param {typeFunc} callback - Function to update project for one paper type
 */
function typesLoop(papers, callback) {
    for (const type in Project.worksMap) {
        callback(papers[type + "s"], type);
    }
}

/**
 * Function to update project for one paper type
 * @callback typeFunc
 * @param {Project} proj - project with all papers of one type
 * @param {string} type - name of paper type
 */

/**
 * Convert array of works to object indexed by id's
 * @param {Publication[]} workArray - array of Work objects
 * @returns {Object.<string,Publication>}
 */
function objectify(workArray) {
    let workObject = {};
    workArray.forEach(entry => workObject[entry.id] = entry);
    return workObject
}

export { publicationLinks };