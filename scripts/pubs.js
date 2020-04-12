import { getJSON } from "./getJSON.js";
import { readWorks, Project, Paper, Work } from "./works.js";

const myName = /(.*)(S\w* Lahiri)(.*)/;

/**
 * @classdesc Citation info for a paper
 * @param {string} type - type of work
 * @param {Object} entry - a JSON object containing properties
 */
class Publication extends Paper {
    /**
     * Put an object property in a span of that class
     * @param {string} field - name of field to put in span
     * @returns {HTMLSpanElement} span element containing field
     */
    span(field) {
        let span = document.createElement("span");
        span.className = field;
        span.textContent = this[field];
        if (field === "author") {
            pickSpanPart(this, span, "self", Publication.myName);
        }
        return span
    }
    /**
     * Produce lList of elements to put in citation
     * @returns {HTMLElement[]} list of elements to put in citation
     */
    cite() {
        let link = this.link(this.span("ref"), addSpace(), this.span("year"));
        return [
            this.span("author"), addSpace(),
            this.span("title"), addSpace(),
            link, document.createTextNode(".")
        ]
    }
    /** Append icon to list of project's works
     * @param {HTMLUListElement} parent UList to append item to
     */
    appendList(parent, ...extra) {
        let citation = this.cite(...extra);
        if (citation.length) {
            parent.appendChild(this.listItem(...citation));
        }
    }
    /**
     * Compare two papers for sorting
     * @param {Paper} paperA - first paper to compare
     * @param {Paper} paperB - second paper to compare
     */
    static compare(paperA, paperB) {
        const yearDiff = paperB.year - paperA.year;
        return yearDiff ? yearDiff : paperB.month - paperA.month
    }
}
/** Pattern to match for myy name */
Publication.myName = myName;

/**
 * @classdesc Citation info for a journal article
 */
class Article extends Publication {
    /**
     * Put an object property in a span of that class
     * @param {string} field - name of field to put in span
     * @returns {HTMLSpanElement} span element containing field
     */
    span(field) {
        let span = super.span(field);
        if (field === "ref") {
            span.className = "journal";
            pickSpanPart(this, span, "volume", /([^\d]+)(\d+)([^\d].*)/);
        }
        return span
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
            let link = preprint.link(preprint.span("ref"));
            citation.splice(-1, 0, addSpace(","), link);
        }
        return citation
    }
}

/**
 * @classdesc Citation info for a preprpint
 * @class {Paper} Preprint
 */
class Preprint extends Publication {
    /**
     * Put an object property in a span of that class
     * @param {string} field - name of field to put in span
     * @returns {HTMLSpanElement} span element containing field
     */
    span(field) {
        let span = super.span(field);
        if (field === "ref") {
            span.className = "eprint";
        }
        return span
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
    "slides": Work,
    "poster": Work,
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
    let {articles, preprints} = collectPapers(worksData);
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
    let anchor = document.getElementById(anchorID);
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
 * Add a text element comprising a space
 * @returns {Text} a space
 */
function addSpace(punctuation="") {
    return document.createTextNode(`${punctuation} `);
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
        span.appendChild(document.createTextNode(items[1]));
        span.appendChild(obj.span(cssClass));
        span.appendChild(document.createTextNode(items[3]));
    }
}

export { publicationLinks };