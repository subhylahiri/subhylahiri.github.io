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
    footDiv.innerHTML = '<address>Subhaneil Lahiri: <tt>sulahiri at stanford dot edu</tt>. ' +
        '<a href="https://github.com/subhylahiri/subhylahiri.github.io">[Source]</a>.</address>';
    body[0].appendChild(footDiv);
}

function buildPage(activeID, baseURL) {
    buildNav(activeID, baseURL);
    buildFoot();
}
