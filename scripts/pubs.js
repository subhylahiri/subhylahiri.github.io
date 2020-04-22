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
        /** parameters of function to post-process spans for given field
         * @type {Object.<string,string[]>
         * values: span's class, part's class, regex's static name
         */
        this.spanMap = {"author": ["author", "self", "myName"]};
    }
    /** Put an object property in a span of that class
     * @param {string} field - name of field to put in span
     */
    span(field) {
        let span = document.createElement("span");
        span.className = field;
        span.textContent = this[field];
        if (field in this.spanMap) {
            let partClass, patternName, pattern;
            [span.className, partClass, patternName] = this.spanMap[field];
            pattern = this.constructor[patternName];
            if (partClass && pattern.test(this[field])) {
                Publication.checkRecursion(field);
                let pref, suff;
                [, pref, this[partClass], suff] = this[field].match(pattern);
                span.textContent = "";
                insertThings(span, pref, this.span(partClass), suff);
                Publication.checkRecursion();
            }
        }
        return span
    }
    /** Produce list of elements to put in citation */
    cite() {
        const link = this.link(this.span("ref"), " ", this.span("year"));
        return [this.span("author"), " ", this.span("title"), " ", link, "."]
    }
    /** Append citation to list of papers
     * @param {HTMLUListElement} list - UList to append item to
     */
    appendList(list) {
        const citation = this.cite();
        if (citation.length) {
            list.appendChild(this.listItem(...citation));
        }
    }
    /** Compare two papers for sorting with reverse chronology
     * @param {Publication} paperA - first paper to compare
     * @param {Publication} paperB - second paper to compare
     */
    static compare(paperA, paperB) {
        const yearDiff = paperB.year - paperA.year;
        return yearDiff ? yearDiff : paperB.month - paperA.month
    }
    /** Check for long recursion
     * @param {...string} name - context for error message
     */
    static checkRecursion(name) {
        if (name) {
            Publication.recursion.push(name);
            if (Publication.recursion.length > 10) {
                throw `Recursive field/part names: ${Publication.recursion}`;
            }
        } else {
            Publication.recursion.pop();
        }
    }
}
/** Pattern to match for my name */
Publication.myName = /(.*)([\w\W])(.*)/;
/** @type {string[]} watch out for infinite loops */
Publication.recursion = [];

/** @classdesc Citation info for a journal article */
class Article extends Publication {
    /**
     * @param {string} type - type of work
     * @param {Object} entry - a JSON object containing properties
     */
    constructor(type, entry) {
        super(type, entry);
        /** parameters of function to post-process ref span */
        this.spanMap.ref = ["journal", "volume", "volRef"];
    }
    /** Produce list of elements to put in citation */
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
/** Pattern for volume in journal ref */
Article.volRef = /([^\d]+)(\d+)([^\d].*)/;

/** @classdesc Citation info for a preprpint */
class Preprint extends Publication {
    /**
     * @param {string} type - type of work
     * @param {Object} entry - a JSON object containing properties
     */
    constructor(type, entry) {
        super(type, entry);
        /** parameters of function to post-process ref span */
        this.spanMap.ref = ["eprint"];
    }
    /** Produce list of elements to put in citation */
    cite() {
        return this.sameAs ? [] : super.cite()
    }
}

/** @classdesc A conference abstract */
class Abstract extends Publication {
    /**
     * @param {string} type - type of work
     * @param {Object} entry - a JSON object containing properties
     */
    constructor(type, entry) {
        super(type, entry);
        /** parameters of function to post-process ref span */
        this.spanMap.ref = ["venue"];
    }
    /** URL of a copy of this work */
    getURL() { return Abstract.baseURL + this.url; }
}

/** Class to use for each entry type */
Project.worksMap = {
    "article": Article,
    "preprint": Preprint,
    "abstract": Abstract,
}

/** Object carrying project objects
 * @typedef {import("./works.js").ProjectJSON} ProjectJSON
 * @typedef {import("./works.js").ProjectHolder} ProjectHolder
 */

/** Loop over paper types to update/create project for that paper type
 * @param {ProjectHolder} papers - dict: type -> Project(all works of that type)
 * @param {Function} callback - Function to do something for one paper type
 * @param {Boolean} create - Create project for that paper type? Or update it?
 */
function typesLoop(papers, callback, create=false) {
    let typeFunc;
    if (create) {
        typeFunc = (type) => papers[type + "s"] = callback(type);
    } else {
        typeFunc = (type) => callback(papers[type + "s"][type], type);
    }
    for (const type in Project.worksMap) {
        typeFunc(type);
    }
}

/** Process JSON data to collect paper lists as type id'd projects
 * @param {ProjectJSON} worksJSON - json dict: id -> project data
 * @returns {ProjectHolder} dict: type -> Project(all works of that type)
 */
function collectByType(worksJSON) {
    let papers = {};
    typesLoop(papers, () => new Project(), true);
    for (const projectID in worksJSON) {
        const project = new Project(worksJSON[projectID]);
        typesLoop(papers, (list, type) => list.push(...project[type]));
    }
    typesLoop(papers, (list) => list.sort(Publication.compare));
    Article.eprints = {};
    for (const entry of papers.preprints.preprint) {
        Article.eprints[entry.id] = entry;
    }
    return papers;
}

/** Read JSON file and pass to presentationJSON
 * @param {string} myName - My name: "{given initials} {family name}" space separated
 * @param {string} baseURL - URL relative to which local urls are interpreted
 *
 * Select types by including/excluding headings with id's in HTML file
 */
function publicationLinks(myName="[\\w\\W]", baseURL = "") {
    Publication.myName = new RegExp(`(.*)(${myName.replace(/ /g, "[\\w.]* ")})(.*)`);
    Publication.baseURL = baseURL;
    getJSON(`${baseURL}data/works.json`)
        .then(collectByType)
        .then(makeProjectLoop("papers"));
}

export { publicationLinks };