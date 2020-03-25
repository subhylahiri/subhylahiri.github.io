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
    // return `<li>${formatArticle(article)}.</li> `
    if (!(article.eprint)) {
        return `<li>${formatArticle(article)}.</li> `
    }
    let eprint = getEprint(article.eprint, preprints);
    return `<li>${formatArticlePreprint(article, eprint)}.</li> `
}

function citePreprint(preprint) {
    if (preprint.pub) {
        return ''
    }
    return `<li>${formatPreprint(preprint)}.</li> `
}

function getEprint(id, preprints) {
    let theEntry = null;
    preprints.forEach(entry => {
        if (entry.id === id) {
            theEntry = { ...entry };
        }
    });
    if (theEntry) {
        return theEntry
    }
    throw `Unknown eprint: ${id}`;
}

function formatArticle(entry) {
    return `${formatAuthor(entry)} ${formatTitle(entry)} ${formatJournal(entry)} ${formatYear(entry)}`
}

function formatPreprint(entry) {
    return `${formatAuthor(entry)} ${formatTitle(entry)} ${formatEprint(entry)} ${formatYear(entry)}`
}

function formatArticlePreprint(article, preprint) {
    return `${formatArticle(article)}, ${formatEprint(preprint)}`
}

function formatAuthor(entry) {
    return `<span class="author">${entry.author}</span>`
}
function formatTitle(entry) {
    return `<span class="title">${entry.title}</span>`
}
function formatVolume(ref) {
    return ref.replace(/([^\d]+)(\d+)([^\d])/, '$1</span><span class="volume">$2</span><span class="pages">$3')
}
function formatJournal(entry) {
    return `<span class="journal"><a href="${entry.url}">${formatVolume(entry.ref)}</a></span>`
}
function formatEprint(entry) {
    return `<span class="eprint"><a href="${entry.url}">${entry.ref}</a></span>`
}
function formatYear(entry) {
    return `<span class="year"><a href="${entry.url}">${entry.year}</a></span>`
}

export { publicationLinks };