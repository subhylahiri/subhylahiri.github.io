function buildNav(activeID, baseURL) {
    if (baseURL === undefined) {
        baseURL = '';
    }
    var body = document.getElementsByTagName("body");
    var headDiv = document.getElementsByClassName("header");
    var navDiv = document.createElement("div");
    navDiv.className = "nav";
    var navString =
        '<ul>' +
        '<li id="home"><a href="' + baseURL + 'index.html">Home</a></li>' +
        '<li id="pubs"><a href="https://scholar.google.com/citations?user=2nEwLGcAAAAJ">Publications</a></li>' +
        '<li id="subj"><a href="' + baseURL + 'research.html">Research</a></li>' +
        '<li id="pres"><a href="' + baseURL + 'presentations/index.html">Presentations</a></li>' +
/*        '<li><a href="https://scholar.google.com/citations?user=2nEwLGcAAAAJ">' +
            '<img src="' + baseURL + 'logos/scholar_favicon.png" class="intext" alt="Google Scholar"></a></li>' +
        '<li><a href="https://orcid.org/0000-0003-2028-6635" target="orcid.widget" rel="noopener noreferrer">' +
            '<img src="https://orcid.org/sites/default/files/images/orcid_16x16.png" class="intext" alt="ORCID"></a></li>' +
        '<li><a href="https://arxiv.org/a/lahiri_s_1.htmlJ">' +
            '<img src="' + baseURL + 'logos/arxiv_favicon.png" class="intext" alt="arXiv"></a></li>' +
        '<li><a href="https://www.ncbi.nlm.nih.gov/pubmed?term=Lahiri+Subhaneil+%5Bau%5D">' +
            '<img src="' + baseURL + 'logos/pubmed_favicon.png" class="intext" alt="PubMed"></a></li>' +
        '<li><a href="https://inspirehep.net/author/profile/S.Lahiri.1">' +
            '<img src="' + baseURL + 'logos/inspire_favicon.png" class="intext" alt="INSSPIRE-HEP"></a></li>' +
        '<li><a href="https://github.com/subhylahiri">' +
            '<img src="' + baseURL + 'logos/GitHub-Mark-32px.png" class="intext" alt="GitHub"></a></li>' +*/
        '</ul>';
    navDiv.innerHTML = navString;
    body[0].insertBefore(navDiv, headDiv[0])
    headDiv[0].style.paddingTop = "0em";
    var activeObj = document.getElementById(activeID);
    activeObj.className = "active";
}

function buildFoot() {
    var body = document.getElementsByTagName("body");
    var footDiv = document.createElement("div");
    footDiv.className = "footer";
    footDiv.innerHTML = '<address>Subhaneil Lahiri: <tt>sulahiri at stanford dot edu</tt></address>';
    body[0].appendChild(footDiv);
}

function buildPage(activeID, baseURL) {
    buildNav(activeID, baseURL);
    buildFoot();
}
