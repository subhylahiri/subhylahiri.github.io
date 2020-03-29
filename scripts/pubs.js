import { getJSON } from "./nav.js";

function publicationLinks(baseURL = '') {
    getJSON(`${baseURL}data/works.json`)
        .then(papersJSON);
}

function papersJSON(worksData) {
    let {articles, preprints} = readPapers(worksData);
    listPapers(articles, "articles", entry => citeArticle(entry, preprints));
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

function listPapers(papers, anchorID, citeFunc) {
    let anchor = document.getElementById(anchorID);
    if (anchor) {
        let paperList = '<ul class="papers"> ';
        papers.forEach(entry => {
            paperList += citeFunc(entry);
        });
        anchor.insertAdjacentHTML('afterend', `${paperList} </ul>`);
    }
}

function citeArticle(entry, preprints) {
    let citation = `<li class="article">${makeCitation(entry, formatJournal)}`;
    if (entry.eprint) {
        citation += appendEprint(getEprint(entry.eprint, preprints));
    }
    return `${citation}.</li> `
}

function citePreprint(entry) {
    if (entry.pub) {
        return ''
    }
    return `<li class="preprint">${makeCitation(entry, formatEprint)}.</li> `
}

function makeCitation(entry, refFunc) {
    let ref = `${refFunc(entry)} ${formatYear(entry)}`;
    return `${formatAuthor(entry)} ${formatTitle(entry)} ${encaseURL(ref, entry)}`
}

function appendEprint(preprint) {
    return `, ${encaseURL(formatEprint(preprint), preprint)}`
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
    return encaseSpan(encaseSelf(entry.author), "author")
}
function formatTitle(entry) {
    return encaseSpan(entry.title, "title")
}
function formatJournal(entry) {
    return encaseSpan(encaseVolume(entry.ref), "journal")
}
function formatEprint(entry) {
    return encaseSpan(entry.ref, "eprint")
}
function formatYear(entry) {
    return encaseSpan(entry.year, "year")
}

function encaseSelf(authors) {
    return authors.replace(/(S\w* Lahiri)/, encaseSpan("$1", "self"))
}
function encaseVolume(ref) {
    return ref.replace(/([^\d]+)(\d+)([^\d])/, `$1${encaseSpan("$2", "volume")}$3`)
}
function encaseSpan(text, cssClass) {
    return `<span class="${cssClass}">${text}</span>`
}
function encaseURL(text, entry) {
    return `<a href="${entry.url}">${text}</a>`
}

export { publicationLinks };