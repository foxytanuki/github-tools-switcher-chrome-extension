function addButtonToRepositoryDetails() {
  // Only add button on repository main pages, not on issues, PRs, discussions, etc.
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  
  // Skip if we're on a sub-page like issues, pull, discussions, actions, etc.
  if (pathParts.length > 3) {
    const thirdPart = pathParts[3];
    const skipPages = ['issues', 'pull', 'pulls', 'discussions', 'actions', 'projects', 'wiki', 'security', 'insights', 'settings'];
    if (skipPages.includes(thirdPart)) {
      return;
    }
  }
  
  // Look for the repository-details-container using multiple selectors to be more robust
  // First try by ID
  let detailsContainer = document.getElementById('repository-details-container');
  
  // If not found, try more specific selectors for repository main page
  if (!detailsContainer) {
    // Try to find by various header elements that contain repository controls
    // Use more specific selectors to avoid matching on non-repository pages
    const possibleSelectors = [
      '#repository-details-container',
      '#repository-container-header .pagehead-actions',  // More specific
      '#repository-container-header ul.pagehead-actions', // Even more specific
      '.js-repo-nav .pagehead-actions',
      '.pagehead-actions:has([data-testid="notifications-subscriptions-menu-button-mobile"])', // Has Watch button
    ];
    
    for (const selector of possibleSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          detailsContainer = element;
          break;
        }
      } catch {
        // :has() selector might not be supported in older browsers
      }
    }
  }
  
  if (!detailsContainer) {
    // If still not found, we'll look for the Watch button and then find its parent container
    const watchButton = document.querySelector('[data-testid="notifications-subscriptions-menu-button-mobile"]');
    if (watchButton) {
      // Go up a few levels to find a suitable container
      detailsContainer = watchButton.closest('.d-flex') || 
                         watchButton.closest('ul') || 
                         watchButton.parentElement;
    }
  }
  
  // If still no container found, exit
  if (!detailsContainer) return;
  
  // Check if our button already exists to avoid duplicates
  if (detailsContainer.querySelector('.github-tools-button') || document.querySelector('.github-tools-button')) return;
  
  // Create the new button - using GitHub's own button styles for better UI integration
  const button = document.createElement('button');
  button.className = 'github-tools-button btn btn-sm';
  button.setAttribute('aria-label', 'Open GitHub Tools');
  button.textContent = '🛠️';
  button.style.cssText = 'display: inline-flex; align-items: center; justify-content: center; height: 29px;';
  
  // Explicitly set border-radius to ensure it's uniform on all corners
  button.style.borderRadius = '6px'; // Force uniform border radius
  
  // Attempt to match GitHub's styling by inspecting existing buttons
  const existingButtons = document.querySelectorAll('.btn-sm');
  if (existingButtons.length > 0) {
    // Copy most styling attributes from an existing button
    const referenceButton = existingButtons[0];
    const computedStyle = window.getComputedStyle(referenceButton);
    
    // Apply only basic styling properties to ensure visual consistency
    button.style.backgroundColor = computedStyle.backgroundColor;
    button.style.color = computedStyle.color;
    button.style.border = computedStyle.border;
    // Don't override our custom border-radius
    button.style.padding = '6px 12px'; // Adjust padding to match GitHub buttons
    button.style.fontSize = computedStyle.fontSize;
    button.style.lineHeight = '22px'; // Match GitHub's line height
  }
  
  // Add click event handler
  button.addEventListener('click', () => {
    // Create tools dropdown menu
    const menu = document.createElement('div');
    menu.className = 'github-tools-menu';
    menu.style.cssText = 'position: absolute; background-color: white; border: 1px solid #e1e4e8; border-radius: 6px; padding: 8px; z-index: 100; box-shadow: 0 3px 12px rgba(27,31,35,0.15);';
    
    const tools = [
      { name: 'DeepWiki', domain: 'deepwiki.com', icon: '📚' },
      { name: 'GitHub Dev', domain: 'github.dev', icon: '💻' },
      { name: 'Code Wiki', domain: 'codewiki.google', icon: '📖', urlType: 'prefix' },
    ];
    
    for (const tool of tools) {
      const link = document.createElement('a');
      link.textContent = `${tool.icon} ${tool.name}`;
      link.style.cssText = 'display: block; padding: 6px 12px; text-decoration: none; color: #24292e; cursor: pointer;';
      
      try {
        const url = new URL(window.location.href);
        if (tool.urlType === 'prefix') {
          // For tools like Code Wiki: codewiki.google/github.com/owner/repo
          link.href = `https://${tool.domain}/github.com${url.pathname}${url.search}`;
        } else {
          // Standard domain replacement
          url.hostname = tool.domain;
          link.href = url.toString();
        }
      } catch (e) {
        console.error('GitHub Tools Switcher: Failed to construct URL', e);
        continue;
      }
      link.target = '_blank';
      
      link.addEventListener('mouseover', () => {
        link.style.backgroundColor = '#f6f8fa';
      });
      link.addEventListener('mouseout', () => {
        link.style.backgroundColor = 'transparent';
      });
      
      menu.appendChild(link);
    }
    
    // Position the menu under the button
    const rect = button.getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;
    
    // Add the menu to the page
    document.body.appendChild(menu);
    
    // Close the menu when clicking outside of it
    const closeMenu = (e) => {
      if (!menu.contains(e.target) && e.target !== button) {
        document.body.removeChild(menu);
        document.removeEventListener('click', closeMenu);
      }
    };
    
    // Use setTimeout to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 0);
  });
  
  // Insert before the container
  detailsContainer.parentNode.insertBefore(button, detailsContainer);
}

// Run on initial load
window.addEventListener('load', () => {
  // Only run on repository pages
  if (isRepositoryPage()) {
    addButtonToRepositoryDetails();
    
    // Initial check might be too early, try again after a short delay
    setTimeout(() => {
      addButtonToRepositoryDetails();
    }, 1500);
  }
});

// Helper function to check if we're on a repository page
function isRepositoryPage() {
  const path = window.location.pathname;
  const pathParts = path.split('/');
  
  // Basic repository URL pattern: /owner/repo or /owner/repo/...
  // Must have at least owner and repo name
  if (pathParts.length < 3) return false;
  
  // Check if first part is empty (from leading slash), second is owner, third is repo
  if (pathParts[0] === '' && pathParts[1] && pathParts[2]) {
    // Exclude certain GitHub pages that are not repositories
    const nonRepoPaths = ['settings', 'organizations', 'explore', 'marketplace', 'topics', 'trending', 'collections', 'events', 'sponsors'];
    if (nonRepoPaths.includes(pathParts[1])) {
      return false;
    }
    return true;
  }
  
  return false;
}

// Observe DOM changes to detect SPA navigations and UI updates
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  // Only proceed if we're on a repository page
  if (!isRepositoryPage()) return;
  
  // Skip if we already have our button on the page
  if (document.querySelector('.github-tools-button') && 
      document.querySelector('.github-tools-toolbar')) return;
      
  // Check for URL changes (SPA navigation)
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    
    // Only add button if we're still on a valid repository page
    if (isRepositoryPage()) {
      addButtonToRepositoryDetails();
      
      // GitHub often makes additional UI updates after URL change, try again after a short delay
      setTimeout(() => {
        addButtonToRepositoryDetails();
      }, 1000);
    }
  } else {
    // Even without URL changes, relevant UI elements might have been updated
    // Check specifically for the container or watch button appearance
    const watchButton = document.querySelector('[data-testid="notifications-subscriptions-menu-button-mobile"]');
    const container = document.getElementById('repository-details-container') || 
                      document.querySelector('#repository-container-header .pagehead-actions');
    
    if ((watchButton || container) && !document.querySelector('.github-tools-button')) {
      addButtonToRepositoryDetails();
    }
  }
});

// Configure observer to monitor DOM changes
observer.observe(document, { 
  subtree: true, 
  childList: true,
  attributeFilter: ['class', 'id'] // Also watch for attribute changes that might indicate UI updates
}); 
