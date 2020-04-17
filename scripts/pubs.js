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
        this.spanMap = {"author": makeSpanMap(this, "", "self", Publication.myName)};
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
            this.spanMap[field](span);
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
        this.spanMap.ref = makeSpanMap(this, "journal", "volume", /([^\d]+)(\d+)([^\d].*)/);
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
        this.spanMap.ref = span => { span.className = "eprint"; }
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
 * @param {Publication} obj - paper from which we construct the span
 * @param {string} spanClass - CSS class to use for span, "" to leave it as is
 * @param {string} partClass - CSS class of central part's span
 * @param {RegExp} pattern - pattern of part to pick out, with 3 capturing groups
 */
function makeSpanMap(obj, spanClass, partClass, pattern) {
    /** function to post process a span element
     * @param {HTMLSpanElement} span - containing span
    */
    function spanMapper(span) {
        if (spanClass) {
            span.className = spanClass;
        }
        if (partClass && pattern.test(span.textContent)) {
            const items = span.textContent.match(pattern);
            obj[partClass] = items[2];
            span.textContent = "";
            insertThings(span, items[1], obj.span(partClass), items[3]);
        }
    }
    return spanMapper
}

/** Class to use for each entry type */
Project.worksMap = {
    "article": Article,
    "preprint": Preprint,
}

/** Pattern to match for my name */
Publication.myName = /(.*)(S[\w.]* Lahiri)(.*)/;

/**
 * Read JSON file and pass to presentationJSON
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function publicationLinks(baseURL = '') {
    getJSON(`${baseURL}data/works.json`)
        .then(papersJSON);
}

/** Function to produce each type of paper list */
const listPapers = makeProjectLoop("papers", "", "title")

/**
 * Process JSON data to add paper list to each type id'd paragraph
 * @param {Object.<string,Object>} worksJSON - json dict: project id -> project object
 */
function papersJSON(worksJSON) {
    let papers = {"articles": new Project(), "preprints": new Project()}
    papers.articles.title = "Journal and conference papers";
    papers.preprints.title = "Preprints";
    for (const projectID in worksJSON) {
        const project = new Project(worksJSON[projectID]);
        papers.articles.article.push(...project.article);
        papers.preprints.preprint.push(...project.preprint);
    }
    papers.articles.article.sort(Publication.compare);
    papers.preprints.preprint.sort(Publication.compare);
    Article.eprints = objectify(papers.preprints.preprint);
    listPapers(papers);
}

/**
 * Convert array of works to object indexed by id's
 * @param {Publication[]} workArray - array of Work objects
 * @returns {Object.<string,Publication>}
 */
function objectify(workArray) {
    let workObject = {}
    workArray.forEach(entry => { workObject[entry.id] = entry; });
    return workObject
}

export { publicationLinks };