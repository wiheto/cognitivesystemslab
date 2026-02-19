(function () {
  // Get base path from current location (works with GitHub Pages subdirectories)
  // For GitHub Pages project sites, extract the repository name as base path
  const pathname = window.location.pathname.replace(/\/$/, ''); // Remove trailing slash
  const pathParts = pathname.split('/').filter(p => p);
  // Get the first part (repository name) as base path, or empty if at root
  const basePath = pathParts.length > 0 ? '/' + pathParts[0] : '';
  const PROJECTS_JSON_URL = basePath + '/projects.json';
  const container = document.getElementById('research-project-list');
  if (!container) return;

  function setStatus(message, isError) {
    container.innerHTML = '<p class="research-projects-message ' + (isError ? 'research-projects-error' : '') + '">' + escapeHtml(message) + '</p>';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderProject(project) {
    const item = document.createElement('li');
    item.className = 'research-project-item';

    const title = document.createElement('h3');
    title.className = 'research-project-title';
    title.textContent = project.title || 'Untitled';
    item.appendChild(title);

    if (project.description) {
      const desc = document.createElement('p');
      desc.className = 'research-project-description';
      desc.textContent = project.description;
      item.appendChild(desc);
    }

    if (project.person) {
      const person = document.createElement('p');
      person.className = 'research-project-person';
      person.textContent = 'Responsible: ' + project.person;
      item.appendChild(person);
    }

    if (project.publication_url) {
      const link = document.createElement('a');
      link.className = 'research-project-publication-link';
      link.href = project.publication_url;
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.textContent = project.publication_title || 'View publication';
      item.appendChild(link);
    }

    return item;
  }

  function loadProjects() {
    setStatus('Loading projects…');

    fetch(PROJECTS_JSON_URL, {
      headers: { Accept: 'application/json' },
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Could not load projects.json');
        return res.json();
      })
      .then(function (data) {
        const projects = data.projects;
        if (!projects || !projects.length) {
          setStatus('No projects found.');
          return;
        }

        const list = document.createElement('ul');
        list.className = 'research-project-list';
        projects.forEach(function (project) {
          list.appendChild(renderProject(project));
        });
        container.innerHTML = '';
        container.appendChild(list);
      })
      .catch(function (err) {
        setStatus('Could not load projects. (' + (err.message || 'Unknown error') + ')', true);
      });
  }

  loadProjects();
})();
