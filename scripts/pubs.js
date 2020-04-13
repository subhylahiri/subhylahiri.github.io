import { getJSON } from "./getJSON.js";
import { readWorks, Project, Paper, insertThings } from "./works.js";

/** Pattern to match for my name */
const myName = /(.*)(S[\w.]* Lahiri)(.*)/;

/**
 * @classdesc Citation info for a paper
 * @param {string} type - type of work
 * @param {Object} entry - a JSON object containing properties
 */
class Publication extends Paper {
    constructor(type, entry) {
        super(type, entry);
        /** field -> function to post-process spans for given field */
        this.spanMap = {};
        /** function to post-process author span */
        this.spanMap.author = span => {
            pickSpanPart(this, span, "self", Publication.myName);
        }
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
    appendList(parent, ...extra) {
        const citation = this.cite(...extra);
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
/** Pattern to match for my name */
Publication.myName = myName;

/**
 * @classdesc Citation info for a journal article
 * @param {string} type - type of work
 * @param {Object} entry - a JSON object containing properties
 */
class Article extends Publication {
    constructor(type, entry) {
        super(type, entry);
        /** function to post-process ref span */
        this.spanMap.ref = span => {
            span.className = "journal";
            pickSpanPart(this, span, "volume", /([^\d]+)(\d+)([^\d].*)/);
        }
    }
    /**
     * Produce list of elements to put in citation
     * @param {Object.<string,Preprint>} preprints - array of preprint objects
     * @returns {HTMLElement[]} list of elements to put in citation
     */
    cite(preprints) {
        let citation = super.cite()
        if (this.sameAs) {
            const preprint = preprints[this.sameAs];
            const link = preprint.link(preprint.span("ref"));
            citation.splice(-1, 0, ", ", link);
        }
        return citation
    }
}

/**
 * @classdesc Citation info for a preprpint
 * @param {string} type - type of work
 * @param {Object} entry - a JSON object containing properties
 */
class Preprint extends Publication {
    constructor(type, entry) {
        super(type, entry);
        /** function to post-process ref span */
        this.spanMap.ref = span => {
            span.className = "eprint";
        }
    }
    /**
     * Produce list of elements to put in citation
     * @returns {HTMLElement[]} list of elements to put in citation
     */
    cite() {
        return this.sameAs ? [] : super.cite()
    }
}

/** Class to use for each entry type */
Project.worksMap = {
    "article": Article,
    "preprint": Preprint,
}

/**
 * Read JSON file and pass to presentationJSON
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function publicationLinks(baseURL = '') {
    getJSON(`${baseURL}data/works.json`)
        .then(worksData => papersJSON(readWorks(worksData)));
}

/**
 * Process JSON data to add paper list to each type id'd paragraph
 * @param {Object.<string,Project>} worksData - json dict: project id -> project object
 */
function papersJSON(worksData) {
    const {articles, preprints} = collectPapers(worksData);
    listPapers(articles, "articles", objectify(preprints));
    listPapers(preprints, "preprints");
}

/**
 * Process JSON data to create paper lists
 * @param {Object.<string,Project>} worksData - json dict: project id -> project object
 * @returns {Object.<string,Publication[]>}
 */
function collectPapers(worksData) {
    let [articles, preprints] = [[], []];
    for (const project in worksData) {
        const entry = worksData[project];
        articles = articles.concat(entry.article);
        preprints = preprints.concat(entry.preprint);
    }
    articles.sort(Publication.compare)
    preprints.sort(Publication.compare)
    return {articles, preprints}
}

/**
 * Insert a UList of paper citations after an id'd element
 * @param {Publication[]} papers - list of paper objects
 * @param {string} anchorID - id of element the list will appear after
 * @param  {...any} extra - additional parameters for citeFunc
 */
function listPapers(papers, anchorID, ...extra) {
    const anchor = document.getElementById(anchorID);
    if (anchor) {
        let paperList = document.createElement("ul");
        paperList.className = "papers";
        papers.forEach(entry => entry.appendList(paperList, ...extra));
        anchor.after(paperList);
    }
}

/**
 * Convert array of works to object indexed by id's
 * @param {Publication[]} workArray - array of Work objects
 * @returns {Object.<string,Publication>}
 */
function objectify(workArray) {
    let workObject = {};
    workArray.forEach(entry => {
        workObject[entry.id] = entry;
    });
    return workObject
}
/**
 * Pick out a part of a span and put in a child span
 * @param {Paper} obj - paper from which we construct the span
 * @param {HTMLSpanElement} span - containing span
 * @param {string} cssClass - CSS class of part's span
 * @param {RegExp} toMatch - pattern of part to pick out
 */
function pickSpanPart(obj, span, cssClass, toMatch) {
    if (toMatch.test(span.textContent)) {
        const items = span.textContent.match(toMatch);
        obj[cssClass] = items[2];
        span.textContent = "";
        insertThings(span, items[1], obj.span(cssClass), items[3]);
    }
}

export { publicationLinks };