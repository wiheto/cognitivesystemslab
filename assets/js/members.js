(function () {
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
  const container = document.getElementById('members-list');
  if (!container) return;

  function setStatus(message, isError) {
    const className = isError ? 'members-error' : 'members-loading';
    container.innerHTML = '<p class="' + className + '">' + escapeHtml(message) + '</p>';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderLink(label, value) {
    var url = value;
    var linkLabel = label;
    
    // Auto-detect URL patterns and build URLs
    const labelLower = label.toLowerCase();
    
    if (labelLower === 'github') {
      url = 'https://github.com/' + value;
    } else if (labelLower === 'orcid') {
      // ORCID can be with or without https://orcid.org/
      if (value.startsWith('https://orcid.org/')) {
        url = value;
      } else if (value.startsWith('orcid.org/')) {
        url = 'https://' + value;
      } else {
        url = 'https://orcid.org/' + value;
      }
    } else if (labelLower === 'google scholar' || labelLower === 'scholar') {
      // Google Scholar can be user ID or full URL
      if (value.startsWith('http://') || value.startsWith('https://')) {
        url = value;
      } else {
        url = 'https://scholar.google.com/citations?user=' + value;
      }
    } else if (labelLower === 'university' || labelLower === 'university page' || labelLower === 'university profile') {
      // University page - assume it's a full URL or make it clickable
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        // If no protocol, assume it's a relative URL or add https://
        url = value.startsWith('/') ? value : 'https://' + value;
      } else {
        url = value;
      }
    } else if (labelLower === 'email') {
      url = 'mailto:' + value;
    } else if (labelLower === 'twitter' || labelLower === 'x') {
      url = 'https://twitter.com/' + value.replace('@', '');
    } else if (labelLower === 'linkedin') {
      url = 'https://linkedin.com/in/' + value;
    } else if (!value.startsWith('http://') && !value.startsWith('https://')) {
      // If it doesn't look like a URL, don't make it a link
      return null;
    }

    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'member-link';
    a.textContent = linkLabel;
    return a;
  }

  function renderMember(member) {
    const div = document.createElement('div');
    div.className = 'member-card';

    // Image (if provided)
    if (member.image) {
      const imageContainer = document.createElement('div');
      imageContainer.className = 'member-image-container';
      const img = document.createElement('img');
      img.className = 'member-image';
      img.src = member.image;
      img.alt = member.name + ' photo';
      img.onerror = function() {
        // Hide image container if image fails to load
        imageContainer.style.display = 'none';
      };
      imageContainer.appendChild(img);
      div.appendChild(imageContainer);
    }

    // Name
    const name = document.createElement('h2');
    name.className = 'member-name';
    name.textContent = member.name;
    div.appendChild(name);

    // Role badge
    if (member.role) {
      const role = document.createElement('span');
      role.className = 'member-role member-role-' + member.role.toLowerCase().replace(/\s+/g, '-');
      role.textContent = member.role;
      div.appendChild(role);
    }

    // Title
    if (member.title) {
      const title = document.createElement('p');
      title.className = 'member-title';
      title.textContent = member.title;
      div.appendChild(title);
    }

    // Links
    if (member.links && Object.keys(member.links).length > 0) {
      const linksDiv = document.createElement('div');
      linksDiv.className = 'member-links';

      Object.keys(member.links).forEach(function (label) {
        const link = renderLink(label, member.links[label]);
        if (link) {
          linksDiv.appendChild(link);
        }
      });

      if (linksDiv.children.length > 0) {
        div.appendChild(linksDiv);
      }
    }

    return div;
  }

  setStatus('Loading members…');

  fetch(MEMBERS_JSON_URL, {
    headers: { Accept: 'application/json' },
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Could not load members.json');
      return res.json();
    })
    .then(function (data) {
      const members = data.members || [];
      
      // Filter to active members if status field exists
      const activeMembers = members.filter(function (member) {
        return member.status !== 'inactive' && member.status !== 'alumni';
      });

      if (activeMembers.length === 0) {
        setStatus('No members found.');
        return;
      }

      // Sort members: PI first, then alphabetically by name
      const roleOrder = ['PI', 'Principal Investigator', 'Researcher', 'Postdoc', 'PhD', 'Student', 'Other'];
      activeMembers.sort(function (a, b) {
        // First, sort by role priority
        const aRoleIndex = roleOrder.indexOf(a.role || 'Other');
        const bRoleIndex = roleOrder.indexOf(b.role || 'Other');
        if (aRoleIndex !== bRoleIndex) {
          if (aRoleIndex === -1) return 1;
          if (bRoleIndex === -1) return -1;
          return aRoleIndex - bRoleIndex;
        }
        // Then alphabetically by name
        return (a.name || '').localeCompare(b.name || '');
      });

      container.innerHTML = '';

      // Create a single grid for all members
      const membersGrid = document.createElement('div');
      membersGrid.className = 'members-grid';

      activeMembers.forEach(function (member) {
        membersGrid.appendChild(renderMember(member));
      });

      container.appendChild(membersGrid);
    })
    .catch(function (err) {
      setStatus('Could not load members. (' + (err.message || 'Unknown error') + ')', true);
    });
})();
