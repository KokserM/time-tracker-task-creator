(function () {
  // ------------------------------------------------------------------------
  // 1) Helper: Toast Notification
  // ------------------------------------------------------------------------
  const createToastContainer = () => {
    let container = document.getElementById('timetracker-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'timetracker-toast-container';
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '999999';
      document.body.appendChild(container);
    }
    return container;
  };

  const showToast = (message, isError = false) => {
    const container = createToastContainer();
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.background = isError ? '#f44336' : '#4CAF50';
    toast.style.color = 'white';
    toast.style.padding = '8px 16px';
    toast.style.marginTop = '8px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    toast.style.fontFamily = 'Arial, sans-serif';
    container.appendChild(toast);

    setTimeout(() => {
      container.removeChild(toast);
    }, 4000);
  };

  // ------------------------------------------------------------------------
  // 2) Create a Login Modal (for when no valid token exists)
  // ------------------------------------------------------------------------
  const createLoginModal = () => {
    // Modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'timetracker-login-modal-overlay';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = 0;
    modalOverlay.style.left = 0;
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modalOverlay.style.zIndex = '100000';

    // Modal box
    const modalBox = document.createElement('div');
    modalBox.style.background = '#fff';
    modalBox.style.borderRadius = '8px';
    modalBox.style.padding = '20px';
    modalBox.style.maxWidth = '300px';
    modalBox.style.margin = '100px auto';
    modalBox.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    modalBox.style.position = 'relative';
    modalBox.style.display = 'flex';
    modalBox.style.flexDirection = 'column';
    modalBox.style.alignItems = 'center';

    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#888';
    closeButton.addEventListener('click', () => {
      if (modalOverlay && modalOverlay.parentNode) {
        modalOverlay.parentNode.removeChild(modalOverlay);
      }
    });
    modalBox.appendChild(closeButton);

    // Header (logo)
    const headerContainer = document.createElement('div');
    headerContainer.style.width = '100%';
    headerContainer.style.display = 'flex';
    headerContainer.style.flexDirection = 'column';
    headerContainer.style.alignItems = 'center';
    const headerImage = document.createElement('img');
    headerImage.src = chrome.runtime.getURL('images/timetrackerlogo.png');
    headerImage.style.display = 'block';
    headerImage.style.marginBottom = '10px';
    headerContainer.appendChild(headerImage);
    modalBox.appendChild(headerContainer);

    // Username field
    const userLabel = document.createElement('label');
    userLabel.textContent = 'Username (email):';
    userLabel.style.width = '100%';
    userLabel.style.textAlign = 'center';
    modalBox.appendChild(userLabel);

    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.style.width = '198px';
    usernameInput.style.height = '29px';
    usernameInput.style.padding = '0 10px';
    usernameInput.style.border = '1px solid #ccc';
    usernameInput.style.marginBottom = '5px';
    usernameInput.style.boxSizing = 'border-box';
    modalBox.appendChild(usernameInput);

    // Password field
    const passLabel = document.createElement('label');
    passLabel.textContent = 'Password:';
    passLabel.style.width = '100%';
    passLabel.style.textAlign = 'center';
    modalBox.appendChild(passLabel);

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.style.width = '198px';
    passwordInput.style.height = '29px';
    passwordInput.style.padding = '0 10px';
    passwordInput.style.border = '1px solid #ccc';
    passwordInput.style.marginBottom = '5px';
    passwordInput.style.boxSizing = 'border-box';
    modalBox.appendChild(passwordInput);

    // Login button
    const loginButton = document.createElement('button');
    loginButton.textContent = 'Login';
    loginButton.style.background = '#355fac';
    loginButton.style.color = '#fff';
    loginButton.style.border = 'none';
    loginButton.style.padding = '8px 16px';
    loginButton.style.borderRadius = '4px';
    loginButton.style.cursor = 'pointer';
    loginButton.style.marginTop = '10px';
    modalBox.appendChild(loginButton);

    modalOverlay.appendChild(modalBox);
    document.body.appendChild(modalOverlay);

    return { modalOverlay, loginButton, usernameInput, passwordInput };
  };

  // ------------------------------------------------------------------------
  // 3) Create a Stylish Dropdown for Project Selection
  // ------------------------------------------------------------------------
  // We'll attach the dropdown near the "Create Timetracker Task" button.
  let projectDropdownContainer = null;

  const showProjectDropdown = (projects, issueKey, issueSummary, referenceElement) => {
    // Remove any existing dropdown
    removeProjectDropdown();

    // Create container div
    projectDropdownContainer = document.createElement('div');
    projectDropdownContainer.style.position = 'absolute';
    // Position relative to the reference element (the button)
    const rect = referenceElement.getBoundingClientRect();
    projectDropdownContainer.style.top = (rect.bottom + window.scrollY + 5) + 'px';
    projectDropdownContainer.style.left = (rect.left + window.scrollX) + 'px';
    projectDropdownContainer.style.background = '#fff';
    projectDropdownContainer.style.border = '1px solid #ccc';
    projectDropdownContainer.style.borderRadius = '4px';
    projectDropdownContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    projectDropdownContainer.style.zIndex = '100000';
    projectDropdownContainer.style.padding = '10px';
    projectDropdownContainer.style.minWidth = '220px';

    // Create a label (optional)
    const label = document.createElement('div');
    label.textContent = 'Select Project:';
    label.style.marginBottom = '5px';
    label.style.textAlign = 'center';
    label.style.fontWeight = 'bold';
    projectDropdownContainer.appendChild(label);

    // Create the select element
    const select = document.createElement('select');
    select.style.width = '100%';
    select.style.height = '29px';
    select.style.padding = '0 10px';
    select.style.border = '1px solid #ccc';
    select.style.marginBottom = '10px';
    select.style.boxSizing = 'border-box';

    projects.forEach((proj) => {
      const option = document.createElement('option');
      // Store the project as JSON string
      option.value = JSON.stringify(proj);
      option.textContent = proj.name;
      select.appendChild(option);
    });
    projectDropdownContainer.appendChild(select);

    // Create the "Create Task" button
    const createButton = document.createElement('button');
    createButton.textContent = 'Create Task';
    createButton.style.background = '#355fac';
    createButton.style.color = '#fff';
    createButton.style.border = 'none';
    createButton.style.padding = '8px 16px';
    createButton.style.borderRadius = '4px';
    createButton.style.cursor = 'pointer';
    createButton.style.width = '100%';
    projectDropdownContainer.appendChild(createButton);

    document.body.appendChild(projectDropdownContainer);

    // When "Create Task" is clicked
    createButton.addEventListener('click', () => {
      const selectedValue = select.value;
      if (!selectedValue) {
        showToast('Please select a project', true);
        return;
      }
      const selectedProject = JSON.parse(selectedValue);
      chrome.runtime.sendMessage(
        {
          action: 'CREATE_TIMETRACKER_TASK',
          payload: { issueKey, issueSummary, project: selectedProject }
        },
        (response) => {
          if (!response) {
            showToast('No response from background.', true);
            return;
          }
          if (response.success) {
            showToast('Task created successfully in Timetracker!', false);
            removeProjectDropdown();
          } else {
            showToast(`Error: ${response.error}`, true);
          }
        }
      );
    });

    // Close the dropdown when clicking outside
    const onClickOutside = (event) => {
      if (
        projectDropdownContainer &&
        !projectDropdownContainer.contains(event.target) &&
        event.target !== referenceElement
      ) {
        removeProjectDropdown();
      }
    };
    document.addEventListener('click', onClickOutside);
    // Save the handler so we can remove it later
    projectDropdownContainer._outsideClickHandler = onClickOutside;
  };

  const removeProjectDropdown = () => {
    if (projectDropdownContainer) {
      document.removeEventListener('click', projectDropdownContainer._outsideClickHandler);
      projectDropdownContainer.remove();
      projectDropdownContainer = null;
    }
  };

  // ------------------------------------------------------------------------
  // 4) Inject "Create Timetracker Task" Button into Jira
  // ------------------------------------------------------------------------
  const issueKeyElement = document.querySelector('#key-val');
  const issueSummaryElement = document.querySelector('#summary-val');

  if (!issueKeyElement || !issueSummaryElement) {
    console.log('Jira elements not found (#key-val or #summary-val).');
    return;
  }

  const issueKey = issueKeyElement.textContent.trim();
  const issueSummary = issueSummaryElement.textContent.trim();

  const opsbarTransitions = document.querySelector('#opsbar-opsbar-transitions');
  if (!opsbarTransitions) {
    console.log('#opsbar-opsbar-transitions not found.');
    return;
  }

  const createTaskButton = document.createElement('a');
  createTaskButton.id = 'create-timetracker-task';
  createTaskButton.className = 'aui-button toolbar-trigger issueaction-create-timetracker-task';
  createTaskButton.style.backgroundColor = '#355fac';
  createTaskButton.style.color = 'white';
  createTaskButton.href = '#';
  createTaskButton.style.marginLeft = '8px';
  createTaskButton.textContent = 'Create Timetracker Task';
  createTaskButton.style.transition = 'background 0.3s ease';

  createTaskButton.addEventListener('mouseover', () => {
    createTaskButton.style.backgroundColor = '#244b91';
  });
  createTaskButton.addEventListener('mouseout', () => {
    createTaskButton.style.backgroundColor = '#355fac';
  });

  opsbarTransitions.appendChild(createTaskButton);

  // ------------------------------------------------------------------------
  // 5) Handle "Create Timetracker Task" Button Click
  // ------------------------------------------------------------------------
  createTaskButton.addEventListener('click', (e) => {
    e.preventDefault();
    // Remove any existing dropdown if present (toggle behavior)
    if (projectDropdownContainer) {
      removeProjectDropdown();
      return;
    }

    // Ask background for the list of projects (which also verifies token)
    chrome.runtime.sendMessage({ action: 'GET_PROJECTS' }, (response) => {
      if (!response) {
        showToast('No response from background.', true);
        return;
      }
      if (response.success) {
        // We have a valid token; show the dropdown next to the button
        showProjectDropdown(response.projects, issueKey, issueSummary, createTaskButton);
      } else if (response.needCredentials) {
        // No valid token: show the login modal.
        const modal = createLoginModal();
        modal.loginButton.addEventListener('click', () => {
          const username = modal.usernameInput.value.trim();
          const password = modal.passwordInput.value.trim();
          if (!username || !password) {
            showToast('Please enter username and password', true);
            return;
          }
          chrome.runtime.sendMessage(
            { action: 'LOGIN', payload: { username, password } },
            (loginResponse) => {
              if (!loginResponse) {
                showToast('No response from background.', true);
                return;
              }
              if (loginResponse.success) {
                showToast('Login successful!', false);
                // Close the login modal
                modal.modalOverlay.remove();
                // Now that we have a token, get projects and show dropdown
                chrome.runtime.sendMessage({ action: 'GET_PROJECTS' }, (resp) => {
                  if (resp.success) {
                    showProjectDropdown(resp.projects, issueKey, issueSummary, createTaskButton);
                  } else {
                    showToast('Failed to fetch projects after login.', true);
                  }
                });
              } else {
                showToast(`Error: ${loginResponse.error}`, true);
              }
            }
          );
        });
      } else {
        showToast(`Error: ${response.error}`, true);
      }
    });
  });
})();
