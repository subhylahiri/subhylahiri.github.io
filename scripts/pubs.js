import { getJSON } from "./getJSON.js";

function publicationLinks(baseURL = '') {
    getJSON(`${baseURL}data/works.json`)
        .then(papersJSON);
}

function papersJSON(worksData) {
    let {articles, preprints} = readPapers(worksData);
    listPapers(articles, "articles", citeArticle, preprints);
    listPapers(preprints, "preprints", citePreprint);
}

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
function reverseChronology(papers) {
    papers.sort((a,b) => b.month - a.month).sort((a,b) => b.year - a.year);
}

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

function citeArticle(parent, entry, preprints) {
    let citation = makeCitation(entry, formatJournal);
    if (entry.eprint) {
        appendEprint(citation, entry.eprint, preprints);
    }
    makeListItem(parent, "article", citation);
}

function citePreprint(parent, entry) {
    if (!entry.pub) {
        let citation = makeCitation(entry, formatEprint);
        makeListItem(parent, "preprint", citation);
    }
}

function makeListItem(parent, cssClass, citation) {
    let listItem = document.createElement("li");
    listItem.className = cssClass;
    citation.push(document.createTextNode("."));
    citation.forEach(element => {
        listItem.appendChild(element);
    })
    parent.appendChild(listItem);
}
function makeCitation(entry, refFunc) {
    const ref = [refFunc(entry), addSpace(), formatYear(entry)];
    return [formatAuthor(entry), formatTitle(entry), putInURL(ref, entry)]
}

function appendEprint(citation, id, preprints) {
    citation.push(document.createTextNode(", "));
    const preprint = getEprint(id, preprints);
    citation.push(putInURL([formatEprint(preprint)], preprint));
}
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

function formatAuthor(entry) {
    return putInSpan(pickSelf(entry.author), "author")
}
function formatTitle(entry) {
    return encaseSpan(entry.title, "title")
}
function formatJournal(entry) {
    return putInSpan(pickVolume(entry.ref), "journal")
}
function formatEprint(entry) {
    return encaseSpan(entry.ref, "eprint")
}
function formatYear(entry) {
    return encaseSpan(entry.year, "year")
}

function pickSelf(authors) {
    const items = authors.match(/(.*)(S\w* Lahiri)(.*)/);
    const first = document.createTextNode(items[1]);
    const me = encaseSpan(items[2], "self");
    const last = document.createTextNode(items[3]);
    return [first, me, last]
}
function pickVolume(ref) {
    const items = ref.match(/([^\d]+)(\d+)([^\d].*)/);
    const journal = document.createTextNode(items[1]);
    const volume = encaseSpan(items[2], "volume");
    const pages = document.createTextNode(items[3]);
    return [journal, volume, pages]
}

function encaseSpan(text, cssClass) {
    return putInSpan([document.createTextNode(text)], cssClass)
}
function putInSpan(elements, cssClass) {
    let span = document.createElement("span");
    span.className = cssClass;
    elements.forEach(element => {
        span.appendChild(element);
    });
    return span
}
function putInURL(elements, entry) {
    let link = document.createElement("a");
    link.href = entry.url;
    elements.forEach(elements => {
        link.appendChild(elements);
    });
    return link
}

function addSpace() {
    return document.createTextNode(" ")
}

export { publicationLinks };