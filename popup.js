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
          // For tools like Code Wiki: codewiki.google/github.com/owner/repo
          newUrl = `https://${tool.targetDomain}/github.com${currentUrl.pathname}${currentUrl.search}`;
        } else {
          // Standard domain replacement
          newUrl = `https://${tool.targetDomain}${currentUrl.pathname}${currentUrl.search}`;
        }
        chrome.tabs.update(tab.id, { url: newUrl });
      }
    });

    toolsContainer.appendChild(button);
  }
}); 
