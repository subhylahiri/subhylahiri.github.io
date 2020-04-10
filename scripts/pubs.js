import { getJSON } from "./getJSON.js";

const myName = /(.*)(S\w* Lahiri)(.*)/;

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
    let {articles, preprints} = readPapers(worksData);
    listPapers(articles, "articles", citeArticle, preprints);
    listPapers(preprints, "preprints", citePreprint);
}

/**
 * Process JSON data to create paper lists
 * @param {Object} worksData - json dict: project id -> title, work types
 */
function readPapers(worksData) {
    let [articles, preprints] = [[], []];
    for (const project in worksData) {
        const entry = worksData[project];
        articles = articles.concat(entry.article);
        preprints = preprints.concat(entry.preprint);
    }
    reverseChronology(articles);
    reverseChronology(preprints);
    return {articles, preprints}
}
/**
 * Sort list of papers in reverse chronological order
 * @param {Object[]} papers - list of paper objects
 */
function reverseChronology(papers) {
    papers.sort((a,b) => b.month - a.month).sort((a,b) => b.year - a.year);
}

/**
 * Insert a UList of paper citations after an id'd element
 * @param {Object[]} papers - list of paper objects
 * @param {string} anchorID - id of element the list will appear after
 * @param {Function} citeFunc - function that creates list of citation elements
 * @param  {...any} extra - additional parameters for citeFunc
 */
function listPapers(papers, anchorID, citeFunc, ...extra) {
    let anchor = document.getElementById(anchorID);
    if (anchor) {
        let paperList = document.createElement("ul");
        paperList.className = "papers";
        papers.forEach(entry => {
            citeFunc(paperList, entry, ...extra);
        });
        anchor.after(paperList);
    }
}

/**
 * Create a new list item for an article citation
 * @param {HTMLUListElement} parent - UList to add list item to
 * @param {Object} entry - article object with details
 * @param {Object[]} preprints - array of preprint objects
 */
function citeArticle(parent, entry, preprints) {
    let citation = makeCitation(entry, formatJournal);
    if (entry.eprint) {
        appendEprint(citation, entry.eprint, preprints);
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
        let citation = makeCitation(entry, formatEprint);
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
    citation.push(document.createTextNode("."));
    citation.forEach(element => {
        listItem.appendChild(element);
    })
    parent.appendChild(listItem);
}
/**
 * Creat list of citation elements for paper
 * @param {Object} entry - paper object with details
 * @param {Function} refFunc - function to process entry.ref
 * @returns {HTMLElement[]} array of paper's citation elements
 */
function makeCitation(entry, refFunc) {
    const ref = [refFunc(entry), document.createTextNode(" "), formatYear(entry)];
    return [formatAuthor(entry), formatTitle(entry), putInURL(ref, entry)]
}

/**
 * Append preprint link to list of citation elements for article
 * @param {HTMLElement[]} citation - array of article's citation elements
 * @param {string} id - the id of the preprint object
 * @param {Object[]} preprints - array of preprint objects
 */
function appendEprint(citation, id, preprints) {
    citation.push(document.createTextNode(", "));
    const preprint = getEprint(id, preprints);
    citation.push(putInURL([formatEprint(preprint)], preprint));
}
/**
 * Get the preprint object from its id
 * @param {string} id - the id of the preprint object
 * @param {Object[]} preprints - array of preprint objects
 * @returns {Object} the preprint object with details
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

/**
 * Create the span element for authors
 * @param {Object} entry - paper object with details
 * @param {string} entry.author - the list of authors
 * @returns {HTMLSpanElement} span element
 */
function formatAuthor(entry) {
    return putInSpan(pickSelf(entry.author), "author")
}
/**
 * Create the span element for title
 * @param {Object} entry - paper object with details
 * @param {string} entry.author - the title
 * @returns {HTMLSpanElement} span element
 */
function formatTitle(entry) {
    return encaseSpan(entry.title, "title")
}
/**
 * Create the span element for journal reference
 * @param {Object} entry - paper object with details
 * @param {string} entry.author - the journal reference
 * @returns {HTMLSpanElement} span element
 */
function formatJournal(entry) {
    return putInSpan(pickVolume(entry.ref), "journal")
}
/**
 * Create the span element for eprint reference
 * @param {Object} entry - paper object with details
 * @param {string} entry.author - the eprint reference
 * @returns {HTMLSpanElement} span element
 */
function formatEprint(entry) {
    return encaseSpan(entry.ref, "eprint")
}
/**
 * Create the span element for publication year
 * @param {Object} entry - paper object with details
 * @param {string} entry.year - the publication year
 * @returns {HTMLSpanElement} span element
 */
function formatYear(entry) {
    return encaseSpan(entry.year, "year")
}

/**
 * Pick out my name from a list of authors and put it in a span
 * @param {string} authors - the list of authors
 * @returns {HTMLElement[]} array of [earlier names, my name, later names] elements
 */
function pickSelf(authors) {
    const items = authors.match(myName);
    const first = document.createTextNode(items[1]);
    const me = encaseSpan(items[2], "self");
    const last = document.createTextNode(items[3]);
    return [first, me, last]
}
/**
 * Pick out the volume number from a journal reference and put it in a span
 * @param {string} ref - the full journal reference
 * @returns {HTMLElement[]} array of [journal name, volume, number+pages] elements
 */
function pickVolume(ref) {
    const items = ref.match(/([^\d]+)(\d+)([^\d].*)/);
    const journal = document.createTextNode(items[1]);
    const volume = encaseSpan(items[2], "volume");
    const pages = document.createTextNode(items[3]);
    return [journal, volume, pages]
}

/**
 * Create a span element, with text contents and class
 * @param {string} text - contents of span
 * @param {string} cssClass - class of span element
 * @returns {HTMLSpanElement} span element
 */
function encaseSpan(text, cssClass) {
    return putInSpan([document.createTextNode(text)], cssClass)
}
/**
 * Create a span element, with contents and class
 * @param {HTMLElement[]} elements - array of elements to put in span
 * @param {string} cssClass - class of span element
 * @returns {HTMLSpanElement} span element
 */
function putInSpan(elements, cssClass) {
    let span = document.createElement("span");
    span.className = cssClass;
    elements.forEach(element => {
        span.appendChild(element);
    });
    return span
}
/**
 * Create a link element, with contents and url
 * @param {HTMLElement[]} elements - array of elements to put in link
 * @param {Object} entry - paper object with details
 * @param {string} entry.url - url where paper can be found
 * @returns {HTMLAnchorElement} link element
 */
function putInURL(elements, entry) {
    let link = document.createElement("a");
    link.href = entry.url;
    elements.forEach(elements => {
        link.appendChild(elements);
    });
    return link
}

export { publicationLinks };