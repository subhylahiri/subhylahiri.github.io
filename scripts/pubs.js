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
         * @type {Object.<string,(string|RegExp)[]>}
         */
        this.spanMap = {"author": ["author", "self", Publication.myName]};
    }
    /** Put an object property in a span of that class
     * @param {string} field - name of field to put in span
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
}
/** Pattern to match for my name */
Publication.myName = /(.*)([\w\W])(.*)/;

/** @classdesc Citation info for a journal article */
class Article extends Publication {
    /**
     * @param {string} type - type of work
     * @param {Object} entry - a JSON object containing properties
     */
    constructor(type, entry) {
        super(type, entry);
        /** parameters of function to post-process ref span */
        this.spanMap.ref = ["journal", "volume", Article.volRef];
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

/** Callback to pick out a part of a span's contents and put in a child span
 * @param {HTMLSpanElement} span - containing span
 * @param {string} spanClass - CSS class to use for span, "" to leave it as is
 * @param {string} partClass - CSS class of central part's span
 * @param {RegExp} pattern - pattern of part to pick out, with 3 capturing groups
 */
function spanMapper(span, spanClass, partClass, pattern) {
    span.className = spanClass;
    if (partClass && pattern.test(span.textContent)) {
        let items = span.textContent.match(pattern).slice(1);
        items.splice(1, 0, document.createElement("span"));
        items[1].className = partClass;
        items[1].textContent = items.splice(2, 1)[0];
        span.textContent = "";
        insertThings(span, ...items);
    }
}

/** Convert array of works to object indexed by id's
 * @param {Publication[]} workArray - array of Work objects
 * @returns {Object.<string,Publication>} dict of work objects
 */
function objectify(workArray) {
    let workObject = {};
    workArray.forEach(entry => workObject[entry.id] = entry);
    return workObject
}

/** Loop over paper types to update project for that paper type
 * @param {Object.<string,Project>} papers - dict: type -> all works of that type
 * @param {typeFunc} callback - Function to update project for one paper type
 */
function typesLoop(papers, callback) {
    for (const type in Project.worksMap) {
        callback(papers[type + "s"], type);
    }
}
/** Function to update project for one paper type
 * @callback typeFunc
 * @param {Project} proj - project with all papers of one type
 * @param {string} type - name of paper type
 */

/** Process JSON data to collect paper lists as type id'd projects
 * @param {Object.<string,Object>} worksJSON - json dict: id -> project data
 * @returns {Object.<string,Project>} dict: type -> all works of that type
 */
function collectByType(worksJSON) {
    let papers = {};
    typesLoop(papers, (_proj, type) => papers[type + "s"] = new Project());
    for (const projectID in worksJSON) {
        const project = new Project(worksJSON[projectID]);
        typesLoop(papers, (proj, type) => proj[type].push(...project[type]));
    }
    typesLoop(papers, (proj, type) => proj[type].sort(Publication.compare));
    Article.eprints = objectify(papers.preprints.preprint);
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