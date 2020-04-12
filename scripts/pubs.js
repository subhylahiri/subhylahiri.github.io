import { getJSON } from "./getJSON.js";
import { readWorks, Project, Paper, Article, Preprint } from "./works.js";

Paper.myName = /(.*)(S\w* Lahiri)(.*)/;

/** Append icon to list of project's works
 * @param {HTMLUListElement} parent UList to append item to
 */
Paper.prototype.appendList = function(parent, ...extra) {
    let citation = this.cite(...extra);
    if (citation.length) {
        let listItem = document.createElement("li");
        listItem.className = this.type;
        citation.forEach(element => {
            listItem.appendChild(element);
        });
        parent.appendChild(listItem);
    }
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
    listPapers(articles, "articles", preprints);
    listPapers(preprints, "preprints");
}

/**
 * Process JSON data to create paper lists
 * @param {Object.<string,Project>} worksData - json dict: project id -> project object
 * @returns {Object.<string,Paper[]>}
 */
function collectPapers(worksData) {
    let [articles, preprints] = [[], []];
    for (const project in worksData) {
        const entry = worksData[project];
        articles = articles.concat(entry.article);
        preprints = preprints.concat(entry.preprint);
    }
    articles.sort(Paper.compare)
    preprints.sort(Paper.compare)
    return {articles, preprints}
}

/**
 * Insert a UList of paper citations after an id'd element
 * @param {Paper[]} papers - list of paper objects
 * @param {string} anchorID - id of element the list will appear after
 * @param  {...any} extra - additional parameters for citeFunc
 */
function listPapers(papers, anchorID, ...extra) {
    let anchor = document.getElementById(anchorID);
    if (anchor) {
        let paperList = document.createElement("ul");
        paperList.className = "papers";
        papers.forEach(entry => {
            entry.appendList(paperList, ...extra)
        });
        anchor.after(paperList);
    }
}

export { publicationLinks };