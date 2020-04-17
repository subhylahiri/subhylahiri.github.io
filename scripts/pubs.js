import { getJSON, insertThings } from "./getJSON.js";

const myName = /(.*)(S[\w.]* Lahiri)(.*)/;

/**
 * Read JSON file and pass to presentationJSON
 * @param {string} baseURL - URL relative to which local urls are interpreted
 */
function publicationLinks(baseURL = '') {
    getJSON(`${baseURL}data/works.json`)
        .then(papersJSON);
}

/**
 * Process JSON data to add paper list to each type id'd paragraph
 * @param {Object} worksData - json dict: project id -> title, work types
 */
function papersJSON(worksData) {
    let {articles, preprints} = collectPapers(worksData);
    listPapers(articles, "articles", citeArticle, objectify(preprints));
    listPapers(preprints, "preprints", citePreprint);
}

/**
 * Process JSON data to create paper lists
 * @param {Object} worksData - json dict: project id -> title, work types
 */
function collectPapers(worksData) {
    let [articles, preprints] = [[], []];
    for (const project in worksData) {
        const entry = worksData[project];
        articles.push(...entry.article);
        preprints.push(...entry.preprint);
    }
    articles.sort(reverseChronology);
    preprints.sort(reverseChronology);
    return {articles, preprints}
}
/**
 * Comparer to sort list of papers in reverse chronological order
 * @param {Object[]} paperA - first paper object
 * @param {Object[]} paperB - second paper object
 * @returns {number} positive if paperA goes after paperB
 */
function reverseChronology(paperA, paperB) {
    const yearDiff = paperB.year - paperA.year;
    return yearDiff ? yearDiff : paperB.month - paperA.month
}

/**
 * Insert a UList of paper citations after an id'd element
 * @param {Object[]} papers - list of paper objects
 * @param {string} anchorID - id of element the list will appear after
 * @param {Function} citeFunc - function that appends a citation list item
 * @param  {...any} extra - additional parameters for citeFunc
 */
function listPapers(papers, anchorID, citeFunc, ...extra) {
    let anchor = document.getElementById(anchorID);
    if (anchor) {
        let paperList = document.createElement("ul");
        paperList.className = "papers";
        papers.forEach(entry => citeFunc(paperList, entry, ...extra));
        anchor.after(paperList);
    }
}

/**
 * Create a new list item for an article citation
 * @param {HTMLUListElement} parent - UList to add list item to
 * @param {Object} entry - article object with details
 * @param {Object.<string,Object>} preprints - dict of preprint objects
 */
function citeArticle(parent, entry, preprints) {
    let citation = makeCitation(entry, formatJournal);
    if (entry.eprint) {
        appendEprint(citation, preprints[entry.eprint]);
    }
    makeListItem(parent, "article", citation);
}

/**
 * Create a new list item ffor a preprint citation
 * @param {HTMLUListElement} parent - UList to add list item to
 * @param {Object} entry - preprint object with details
 */
function citePreprint(parent, entry) {
    if (!entry.pub) {
        const citation = makeCitation(entry, formatEprint);
        makeListItem(parent, "preprint", citation);
    }
}

/**
 * Put list of citation elements in a new list item
 * @param {HTMLUListElement} parent - UList to add list item to
 * @param {string} cssClass - name of list item's class
 * @param {HTMLElement[]} citation - array of paper's citation elements
 */
function makeListItem(parent, cssClass, citation) {
    let listItem = document.createElement("li");
    listItem.className = cssClass;
    insertThings(listItem, ...citation);
    parent.appendChild(listItem);
}
/**
 * Creat list of citation elements for paper
 * @param {Object} entry - paper object with details
 * @param {Function} refFunc - function to process entry.ref
 * @returns {HTMLElement[]} array of paper's citation elements
 */
function makeCitation(entry, refFunc) {
    const ref = [refFunc(entry), " ", formatYear(entry)];
    return [formatAuthor(entry), " ", formatTitle(entry), " ", putInURL(entry, ...ref), "."]
}

/**
 * Append preprint link to list of citation elements for article
 * @param {HTMLElement[]} citation - array of article's citation elements
 * @param {Object} preprint - preprint object
 */
function appendEprint(citation, preprint) {
    citation.splice(-1, 0, ", ", putInURL(preprint, formatEprint(preprint)));
}

/**
 * Create the span element for authors
 * @param {Object} entry - paper object with details
 * @param {string} entry.author - the list of authors
 * @returns {HTMLSpanElement} span element
 */
function formatAuthor(entry) {
    const items = pickPart(entry.author, "self", myName);
    return putInSpan("author", ...items)
}
/**
 * Create the span element for title
 * @param {Object} entry - paper object with details
 * @param {string} entry.author - the title
 * @returns {HTMLSpanElement} span element
 */
function formatTitle(entry) {
    return putInSpan("title", entry.title)
}
/**
 * Create the span element for journal reference
 * @param {Object} entry - paper object with details
 * @param {string} entry.author - the journal reference
 * @returns {HTMLSpanElement} span element
 */
function formatJournal(entry) {
    const items = pickPart(entry.ref, "volume", /([^\d]+)(\d+)([^\d].*)/);
    return putInSpan("journal", ...items)
}
/**
 * Create the span element for eprint reference
 * @param {Object} entry - paper object with details
 * @param {string} entry.author - the eprint reference
 * @returns {HTMLSpanElement} span element
 */
function formatEprint(entry) {
    return putInSpan("eprint", entry.ref)
}
/**
 * Create the span element for publication year
 * @param {Object} entry - paper object with details
 * @param {string} entry.year - the publication year
 * @returns {HTMLSpanElement} span element
 */
function formatYear(entry) {
    return putInSpan("year", entry.year)
}

/**
 * Search text for pattern and put central group in a span
 * @param {string} text - text to search for match
 * @param {string} cssClass - class of span to put central match in
 * @param {RegExp} pattern - regex with three groups to match
 * @returns {(string|HTMLElement)[]} [before text, central span, after text]
 */
function pickPart(text, cssClass, pattern) {
    if (pattern.test(text)) {
        const items = text.match(pattern);
        return [items[1], putInSpan(cssClass, items[2]), items[3]]
    }
    return [text]
}
/**
 * Create a span element, with contents and class
 * @param {string} cssClass - class of span element
 * @param {...(HTMLElement|string|number)} elements - elements to put in span
 * @returns {HTMLSpanElement} span element
 */
function putInSpan(cssClass, ...elements) {
    let span = document.createElement("span");
    span.className = cssClass;
    insertThings(span, ...elements);
    return span
}
/**
 * Create a link element, with contents and url
 * @param {Object} entry - paper object with details
 * @param {string} entry.url - url where paper can be found
 * @param {...(HTMLElement|string|number)} elements - elements to put in link
 * @returns {HTMLAnchorElement} link element
 */
function putInURL(entry, ...elements) {
    let link = document.createElement("a");
    link.href = entry.url;
    insertThings(link, ...elements);
    return link
}
/**
 * Convert array of works to object indexed by id's
 * @param {Object[]} workArray - array of Work objects
 * @returns {Object.<string,Object>} - dict of work objects
 */
function objectify(workArray) {
    let workObject = {};
    workArray.forEach(entry => workObject[entry.id] = entry);
    return workObject
}

export { publicationLinks };