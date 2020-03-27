import { getJSON } from "./nav.js";

function publicationLinks(baseURL) {
    if (baseURL === undefined) {
        baseURL = '';
    }
    getJSON(`${baseURL}data/works.json`)
        .then((worksData) => {
            papersJSON(worksData);
        })
}

function papersJSON(baseURL) {
    let {articles, preprints} = readPapers(baseURL);
    listArticles(articles, preprints);
    listPreprints(preprints);
}

function readPapers(worksData) {
    let [articles, preprints] = [[], []];
    for (const project in worksData) {
        const entry = worksData[project];
        articles = articles.concat(entry.article);
        preprints = preprints.concat(entry.preprint);
    }
    articles.sort(compareMonth).sort(compareYear);
    preprints.sort(compareMonth).sort(compareYear);
    return {articles, preprints}
}
function compareMonth(entryA, entryB) {
    return entryB.month - entryA.month
}
function compareYear(entryA, entryB) {
    return entryB.year - entryA.year
}

function listArticles(articles, preprints) {
    let anchor = document.getElementById("articles");
    if (anchor) {
        let paperList = '<ul class="articles"> ';
        articles.forEach(entry => {
            paperList += citeArticle(entry, preprints);
        });
        anchor.insertAdjacentHTML(
            'afterend', `${paperList} </ul>`
        );
    }
}

function listPreprints(preprints) {
    let anchor = document.getElementById("preprints");
    if (anchor) {
        let paperList = '<ul class="preprints"> ';
        preprints.forEach(entry => {
            paperList += citePreprint(entry);
        });
        anchor.insertAdjacentHTML(
            'afterend', `${paperList} </ul>`
        );
    }
}

function citeArticle(article, preprints) {
    if (!(article.eprint)) {
        return `<li class="article">${formatArticle(article)}.</li> `
    }
    let eprint = getEprint(article.eprint, preprints);
    return `<li class="article">${formatArticlePreprint(article, eprint)}.</li> `
}

function citePreprint(preprint) {
    if (preprint.pub) {
        return ''
    }
    return `<li class="preprint">${formatPreprint(preprint)}.</li> `
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

function formatArticlePreprint(article, preprint) {
    return `${formatArticle(article)}, ${encaseURL(formatEprint(preprint), preprint)}`
}

function formatArticle(entry) {
    return formatCitation(entry, `${formatJournal(entry)} ${formatYear(entry)}`);
}

function formatPreprint(entry) {
    return formatCitation(entry, `${formatEprint(entry)} ${formatYear(entry)}`)
}

function formatCitation(entry, ref) {
    return `${formatAuthor(entry)} ${formatTitle(entry)} ${encaseURL(ref, entry)}`
}

function formatAuthor(entry) {
    return encaseSpan(formatSelf(entry.author), "author")
}
function formatSelf(authors) {
    return authors.replace(/(S\w* Lahiri)/, '<span class="self">$1</span>')
}
function formatTitle(entry) {
    return encaseSpan(entry.title, "title")
}
function formatJournal(entry) {
    return encaseSpan(formatVolume(entry.ref), "journal")
}
function formatVolume(ref) {
    return ref.replace(/([^\d]+)(\d+)([^\d])/, '$1<span class="volume">$2</span>$3')
}
function formatEprint(entry) {
    return encaseSpan(entry.ref, "eprint")
}
function formatYear(entry) {
    return encaseSpan(entry.year, "year")
}

function encaseSpan(text, cssClass) {
    return `<span class="${cssClass}">${text}</span>`
}
function encaseURL(text, entry) {
    return `<a href="${entry.url}">${text}</a>`
}

export { publicationLinks };