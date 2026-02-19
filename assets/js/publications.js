(function () {
  // Base URL for each publication (you can change this later)
  const PUBLICATION_BASE_URL = 'https://gup.ub.gu.se/publication/';

  // Get base path from current location
  // For custom domains, use root. For GitHub Pages subdomain, use repository name
  const hostname = window.location.hostname;
  let basePath = '';
  
  // If on GitHub Pages subdomain (not custom domain), extract repository name
  if (hostname.includes('github.io')) {
    const pathname = window.location.pathname.replace(/\/$/, '');
    const pathParts = pathname.split('/').filter(p => p);
    basePath = pathParts.length > 0 ? '/' + pathParts[0] : '';
  }
  // For custom domain, basePath stays empty (root)
  
  const MEMBERS_JSON_URL = basePath + '/members.json';

  const container = document.getElementById('publication-list');
  if (!container) return;

  const content = document.getElementById('publications-content');
  if (!content) return;

  // Lab member author IDs (will be loaded from members.json)
  let mdiAuthorIds = [];
  let authorIdsString = '';

  // Helper function to build URL-encoded person_id string from array
  function buildPersonIdString(ids) {
    return ids.map(function(id) { return encodeURIComponent(id); }).join('%3B'); // %3B is semicolon
  }

  function setStatus(message, isError) {
    const className = isError ? 'publications-error' : 'publications-loading';
    container.innerHTML = '<p class="' + className + '">' + escapeHtml(message) + '</p>';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderAuthor(author, isLab) {
    const span = document.createElement('span');
    span.className = isLab ? 'author-labs' : 'author-other';
    span.textContent = author.first_name + ' ' + author.last_name;
    return span;
  }

  function renderPublication(pub) {
    const a = document.createElement('a');
    a.className = 'publication-item';
    a.href = PUBLICATION_BASE_URL + pub.id;
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');

    const h2 = document.createElement('h2');
    h2.textContent = pub.title || 'Untitled';
    a.appendChild(h2);

    const h3 = document.createElement('h3');
    h3.textContent = pub.sourcetitle || '';
    a.appendChild(h3);

    const meta = document.createElement('div');
    meta.className = 'publication-meta';

    const authorsWrap = document.createElement('div');
    authorsWrap.className = 'publication-authors';

    if (pub.authors && pub.authors.length) {
      pub.authors.forEach(function (author, i) {
        const isLab = mdiAuthorIds.indexOf(author.id) !== -1;
        authorsWrap.appendChild(renderAuthor(author, isLab));
        if (i < pub.authors.length - 1) {
          const comma = document.createTextNode(', ');
          authorsWrap.appendChild(comma);
        }
      });
    }
    meta.appendChild(authorsWrap);

    const yearSpan = document.createElement('span');
    yearSpan.textContent = pub.pubyear || '';
    meta.appendChild(yearSpan);

    a.appendChild(meta);
    return a;
  }

  // Load members.json first, then fetch publications
  function loadPublications() {
    setStatus('Loading publications…');

    // First, fetch members.json to get lab member author IDs
    fetch(MEMBERS_JSON_URL, {
      headers: { Accept: 'application/json' },
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Could not load members.json');
        return res.json();
      })
      .then(function (membersData) {
        // Extract GUP author IDs from members
        mdiAuthorIds = membersData.members
          .map(function (member) {
            return member.gup_author_id;
          })
          .filter(function (id) {
            return id != null && id !== undefined;
          });

        if (mdiAuthorIds.length === 0) {
          setStatus('No lab members with GUP author IDs found in members.json.', true);
          return;
        }

        // Build person_id string for API URLs
        authorIdsString = buildPersonIdString(mdiAuthorIds);

        // Build GUP API URL with all lab member IDs
        const API_URL =
          'https://gup-server.ub.gu.se/v1/public_publication_lists?locale=sv&page=1&sort_by=pubyear&publication_id=&person_id=' +
          authorIdsString +
          '&department_id=&faculty_id=&serie_id=&project_id=&publication_type=&ref_value=&start_year=&end_year=&only_artistic=false';

        // Build "See all" URL
        const SEE_ALL_URL =
          'https://gup.ub.gu.se/publications/list?department_id=&person_id=' + authorIdsString;

        // Now fetch publications from GUP API
        return fetch(API_URL, {
          headers: { Accept: 'application/json' },
        })
          .then(function (res) {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
          })
          .then(function (data) {
            const list = data.publications;
            if (!list || !list.length) {
              setStatus('No publications found.');
              return;
            }

            container.innerHTML = '';
            container.className = 'publication-list';
            list.forEach(function (pub) {
              container.appendChild(renderPublication(pub));
            });

            var readMore = document.getElementById('publications-read-more');
            if (readMore) {
              var link = readMore.querySelector('a');
              if (link) link.href = SEE_ALL_URL;
              readMore.style.display = 'flex';
            }
          });
      })
      .catch(function (err) {
        setStatus('Could not load publications. (' + (err.message || 'Unknown error') + ')', true);
      });
  }

  // Start loading
  loadPublications();
})();
