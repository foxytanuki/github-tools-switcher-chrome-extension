function addButtonToRepositoryDetails() {
  // Look for the repository-details-container using multiple selectors to be more robust
  // First try by ID
  let detailsContainer = document.getElementById('repository-details-container');
  
  // If not found, try common classes/selectors in the new GitHub UI design
  if (!detailsContainer) {
    // Try to find by various header elements that might contain repository controls
    const possibleSelectors = [
      '#repository-details-container',
      '.repository-content .d-flex.mb-3',  // Common pattern in newer GitHub designs
      '.repository-content .d-flex.flex-wrap.mb-3',
      '.js-repo-nav .pagehead-actions',
      '.pagehead-actions', // Traditional location for repository actions
      '.UnderlineNav-actions',  // Another common location
      '.file-navigation .d-flex' // File list header area
    ];
    
    for (const selector of possibleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        detailsContainer = element;
        break;
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
  button.innerHTML = '<span>🛠️</span>';
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
    ];
    
    for (const tool of tools) {
      const link = document.createElement('a');
      link.textContent = `${tool.icon} ${tool.name}`;
      link.style.cssText = 'display: block; padding: 6px 12px; text-decoration: none; color: #24292e; cursor: pointer;';
      link.href = window.location.href.replace('github.com', tool.domain);
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
  addToolbarToGitHub();
  addButtonToRepositoryDetails();
  
  // Initial check might be too early, try again after a short delay
  setTimeout(() => {
    addButtonToRepositoryDetails();
  }, 1500);
});

// Observe DOM changes to detect SPA navigations and UI updates
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  // Skip if we already have our button on the page
  if (document.querySelector('.github-tools-button') && 
      document.querySelector('.github-tools-toolbar')) return;
      
  // Check for URL changes (SPA navigation)
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    addButtonToRepositoryDetails();
    
    // GitHub often makes additional UI updates after URL change, try again after a short delay
    setTimeout(() => {
      addButtonToRepositoryDetails();
    }, 1000);
  } else {
    // Even without URL changes, relevant UI elements might have been updated
    // Check specifically for the container or watch button appearance
    const watchButton = document.querySelector('[data-testid="notifications-subscriptions-menu-button-mobile"]');
    const container = document.getElementById('repository-details-container') || 
                      document.querySelector('.pagehead-actions');
    
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
