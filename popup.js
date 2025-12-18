document.addEventListener('DOMContentLoaded', () => {
  // Define available tools
  const tools = [
    {
      name: 'DeepWiki',
      targetDomain: 'deepwiki.com',
      description: 'Wiki generation by Devin'
    },
    {
      name: 'GitHub Dev',
      targetDomain: 'github.dev',
      description: 'Web-based VS Code editor'
    },
    {
      name: 'Code Wiki',
      targetDomain: 'codewiki.google',
      description: 'Code documentation by Google',
      urlType: 'prefix'
    },
  ];

  const toolsContainer = document.getElementById('tools-container');

  // Get the current active tab
  async function getCurrentTab() {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  // Create button for each tool
  for (const tool of tools) {
    const button = document.createElement('button');
    button.className = 'tool-button';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = tool.name;

    const descSpan = document.createElement('div');
    descSpan.className = 'tool-description';
    descSpan.textContent = tool.description;

    button.appendChild(nameSpan);
    button.appendChild(descSpan);

    button.addEventListener('click', async () => {
      const tab = await getCurrentTab();
      const currentUrl = new URL(tab.url);

      // Only transform URLs on github.com
      if (currentUrl.hostname === 'github.com') {
        let newUrl;
        if (tool.urlType === 'prefix') {
          // For tools like Code Wiki: only use /owner/repo (first two path segments)
          const pathParts = currentUrl.pathname.split('/').filter(Boolean);
          const repoPath = pathParts.length >= 2 ? `/${pathParts[0]}/${pathParts[1]}` : currentUrl.pathname;
          newUrl = `https://${tool.targetDomain}/github.com${repoPath}`;
        } else {
          // Standard domain replacement
          newUrl = `https://${tool.targetDomain}${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
        }
        chrome.tabs.update(tab.id, { url: newUrl });
      }
    });

    toolsContainer.appendChild(button);
  }
}); 
