(function () {
  // ------------------------------------------------------------------------
  // 1) Toast Notification
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
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 4000);
  };

  // ------------------------------------------------------------------------
  // 2) Utility functions for date and time
  // ------------------------------------------------------------------------
  // Returns today's date in "YYYY-MM-DD" format.
  function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Combine a date string ("YYYY-MM-DD") with a time string ("HH:mm")
  function combineDateAndTime(dateStr, timeStr) {
    return `${dateStr}T${timeStr}`;
  }

  // Generate a string containing <option> elements for times in 15-minute intervals.
  function generateTimeOptions() {
    let options = "";
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        let hh = String(h).padStart(2, "0");
        let mm = String(m).padStart(2, "0");
        options += `<option value="${hh}:${mm}">${hh}:${mm}</option>`;
      }
    }
    return options;
  }

  // ------------------------------------------------------------------------
  // 3) Modal for login if needed (unchanged)
  // ------------------------------------------------------------------------
  const createLoginModal = () => {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'timetracker-login-modal-overlay';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = 0;
    modalOverlay.style.left = 0;
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modalOverlay.style.zIndex = '100000';

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
  // 4) Modal for Create/Log-time with improved time controls
  // ------------------------------------------------------------------------
  let timetrackerModalContainer = null;

  function showCreateLogTimeModal({ user, projects, issueKey, issueSummary, existingTask }) {
    if (timetrackerModalContainer) {
      timetrackerModalContainer.remove();
      timetrackerModalContainer = null;
    }
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '100000';

    const modalBox = document.createElement('div');
    modalBox.style.background = '#fff';
    modalBox.style.borderRadius = '8px';
    modalBox.style.padding = '20px';
    modalBox.style.maxWidth = '400px';
    modalBox.style.margin = '100px auto';
    modalBox.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    modalBox.style.position = 'relative';
    modalBox.style.display = 'flex';
    modalBox.style.flexDirection = 'column';
    modalBox.style.alignItems = 'stretch';

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
    closeButton.addEventListener('click', () => overlay.remove());
    modalBox.appendChild(closeButton);

    const titleEl = document.createElement('h3');
    titleEl.textContent = `Task for: ${issueKey} - ${issueSummary}`;
    titleEl.style.marginBottom = '10px';
    modalBox.appendChild(titleEl);

    const projectLabel = document.createElement('label');
    projectLabel.textContent = 'Select Project:';
    projectLabel.style.fontWeight = 'bold';
    projectLabel.style.marginBottom = '5px';
    modalBox.appendChild(projectLabel);

    const projectSelect = document.createElement('select');
    projectSelect.style.width = '100%';
    projectSelect.style.height = '29px';
    projectSelect.style.padding = '0 10px';
    projectSelect.style.border = '1px solid #ccc';
    projectSelect.style.marginBottom = '10px';
    projectSelect.style.boxSizing = 'border-box';
    if (existingTask && existingTask.id) { projectSelect.disabled = true; }
    projects.forEach((proj) => {
      const option = document.createElement('option');
      option.value = JSON.stringify(proj);
      option.textContent = proj.name;
      projectSelect.appendChild(option);
    });
    modalBox.appendChild(projectSelect);

    // Date input for worklog day
    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Select Date:';
    dateLabel.style.fontWeight = 'bold';
    dateLabel.style.marginBottom = '5px';
    modalBox.appendChild(dateLabel);

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.style.width = '100%';
    dateInput.style.marginBottom = '10px';
    dateInput.value = getTodayDate();
    modalBox.appendChild(dateInput);

    // Time dropdowns for start and end times (using <select>)
    const timeContainer = document.createElement('div');
    timeContainer.style.display = 'flex';
    timeContainer.style.flexDirection = 'column';
    timeContainer.style.marginBottom = '10px';

    const startTimeLabel = document.createElement('label');
    startTimeLabel.textContent = 'Start Time:';
    startTimeLabel.style.fontWeight = 'bold';
    timeContainer.appendChild(startTimeLabel);

    const startTimeSelect = document.createElement('select');
    startTimeSelect.style.width = '100%';
    startTimeSelect.style.marginBottom = '5px';
    startTimeSelect.innerHTML = generateTimeOptions();
    // Set default value
    startTimeSelect.value = "09:00";
    timeContainer.appendChild(startTimeSelect);

    const endTimeLabel = document.createElement('label');
    endTimeLabel.textContent = 'End Time:';
    endTimeLabel.style.fontWeight = 'bold';
    timeContainer.appendChild(endTimeLabel);

    const endTimeSelect = document.createElement('select');
    endTimeSelect.style.width = '100%';
    endTimeSelect.style.marginBottom = '5px';
    endTimeSelect.innerHTML = generateTimeOptions();
    // Set default value
    endTimeSelect.value = "10:00";
    timeContainer.appendChild(endTimeSelect);

    modalBox.appendChild(timeContainer);

    // Add a checkbox to let the user decide whether to log time or only create task.
    const logTimeLabel = document.createElement('label');
    logTimeLabel.style.marginBottom = '10px';
    logTimeLabel.style.display = 'flex';
    logTimeLabel.style.alignItems = 'center';
    const logTimeCheckbox = document.createElement('input');
    logTimeCheckbox.type = 'checkbox';
    logTimeCheckbox.checked = true; // default is to log time
    logTimeCheckbox.style.marginRight = '5px';
    logTimeLabel.appendChild(logTimeCheckbox);
    logTimeLabel.appendChild(document.createTextNode('Log time with task'));
    modalBox.appendChild(logTimeLabel);

    const commentLabel = document.createElement('label');
    commentLabel.textContent = 'Comment (optional):';
    commentLabel.style.fontWeight = 'bold';
    modalBox.appendChild(commentLabel);

    const commentInput = document.createElement('textarea');
    commentInput.style.width = '100%';
    commentInput.style.height = '60px';
    commentInput.style.marginBottom = '10px';
    modalBox.appendChild(commentInput);

    const actionButton = document.createElement('button');
    actionButton.textContent = 'Create Task / Log Time';
    actionButton.style.background = '#355fac';
    actionButton.style.color = '#fff';
    actionButton.style.border = 'none';
    actionButton.style.padding = '8px 16px';
    actionButton.style.borderRadius = '4px';
    actionButton.style.cursor = 'pointer';
    modalBox.appendChild(actionButton);

    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);
    timetrackerModalContainer = overlay;

    // When the action button is clicked, combine the date and time values.
    actionButton.addEventListener('click', () => {
      const dateVal = dateInput.value; // "YYYY-MM-DD"
      // If the log time checkbox is unchecked, then we create the task only.
      const logTime = logTimeCheckbox.checked;
      let startVal = "";
      let endVal = "";
      if (logTime) {
        const startTimeStr = startTimeSelect.value; // "09:00", etc.
        const endTimeStr = endTimeSelect.value;
        if (!startTimeStr || !endTimeStr) {
          showToast('Please select start and end times or uncheck "Log time with task".', true);
          return;
        }
        startVal = combineDateAndTime(dateVal, startTimeStr);
        endVal = combineDateAndTime(dateVal, endTimeStr);
        if (new Date(startVal) >= new Date(endVal)) {
          showToast('Start time must be before end time.', true);
          return;
        }
      }
      const commentVal = commentInput.value.trim();
      const taskName = `${issueKey} - ${issueSummary}`;

      // If the task already exists, then if logTime is checked, log time; otherwise do nothing.
      if (existingTask && existingTask.id) {
        if (logTime) {
          console.log('CONTENT: Logging time on existing task...');
          chrome.runtime.sendMessage({
            action: 'CREATE_WORKLOG',
            payload: { task: existingTask, startTime: startVal, endTime: endVal, comment: commentVal, person: user }
          }, (resp) => {
            if (!resp) { showToast('No response from background.', true); return; }
            if (resp.success) { showToast('Time logged successfully!', false); overlay.remove(); }
            else { showToast(`Error: ${resp.error}`, true); }
          });
        } else {
          showToast('Task already exists; no time logged as per selection.', false);
          overlay.remove();
        }
        return;
      }

      // If the task does not exist – create it.
      const selectedValue = projectSelect.value;
      if (!selectedValue) {
        showToast('Please select a project.', true);
        return;
      }
      const selectedProject = JSON.parse(selectedValue);
      console.log('CONTENT: Creating a new task...');
      chrome.runtime.sendMessage({
        action: 'CREATE_TIMETRACKER_TASK',
        payload: { issueKey, issueSummary, project: selectedProject }
      }, (createResp) => {
        if (!createResp) {
          showToast('No response from background while creating task.', true);
          return;
        }
        if (!createResp.success) {
          showToast(`Error: ${createResp.error}`, true);
          return;
        }
        showToast('Task created successfully in Timetracker!', false);
        // If logTime is checked, fetch the full task object and create the worklog.
        if (logTime) {
          console.log('CONTENT: Fetching full task via findByName...');
          chrome.runtime.sendMessage({
            action: 'FIND_TASK_BY_NAME',
            payload: { taskName, personId: user.id }
          }, (findResp) => {
            if (!findResp) {
              showToast('No response from background for findByName.', true);
              return;
            }
            if (!findResp.success) {
              showToast(`Error: ${findResp.error}`, true);
              return;
            }
            const tasksFound = findResp.data;
            if (!tasksFound || tasksFound.length === 0) {
              showToast('Newly created task not found by name?!', true);
              return;
            }
            const fullCreatedTask = tasksFound[0];
            console.log('CONTENT: Logging time with full task object =>', fullCreatedTask);
            chrome.runtime.sendMessage({
              action: 'CREATE_WORKLOG',
              payload: { task: fullCreatedTask, startTime: startVal, endTime: endVal, comment: commentVal, person: user }
            }, (wlResp) => {
              if (!wlResp) { showToast('No response from background while logging time.', true); return; }
              if (wlResp.success) { showToast('Time logged successfully!', false); overlay.remove(); }
              else { showToast(`Error: ${wlResp.error}`, true); }
            });
          });
        } else {
          overlay.remove();
        }
      });
    });

    document.body.appendChild(overlay);
    timetrackerModalContainer = overlay;
  }

  // ------------------------------------------------------------------------
  // 5) Inject "Create Timetracker Task" Button into Jira (unchanged)
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
  createTaskButton.addEventListener('mouseover', () => { createTaskButton.style.backgroundColor = '#244b91'; });
  createTaskButton.addEventListener('mouseout', () => { createTaskButton.style.backgroundColor = '#355fac'; });
  opsbarTransitions.appendChild(createTaskButton);

  // ------------------------------------------------------------------------
  // 6) Handle "Create Timetracker Task" Button Click (unchanged)
  // ------------------------------------------------------------------------
  createTaskButton.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('CONTENT: "Create Timetracker Task" clicked');
    chrome.runtime.sendMessage({ action: 'GET_PROJECTS_AND_USER' }, (resp) => {
      if (!resp) { showToast('No response from background.', true); return; }
      if (resp.success) {
        const { user, projects } = resp;
        const finalTaskName = `${issueKey} - ${issueSummary}`;
        chrome.runtime.sendMessage({
          action: 'FIND_TASK_BY_NAME',
          payload: { taskName: finalTaskName, personId: user.id }
        }, (findResp) => {
          let existingTask = null;
          if (findResp && findResp.success) {
            const foundTasks = findResp.data;
            if (Array.isArray(foundTasks) && foundTasks.length > 0) { existingTask = foundTasks[0]; }
          }
          showCreateLogTimeModal({ user, projects, issueKey, issueSummary, existingTask });
        });
      } else if (resp.needCredentials) {
        showLoginModalThenProjects();
      } else {
        showToast(`Error: ${resp.error}`, true);
      }
    });
  });

  // ------------------------------------------------------------------------
  // 7) Show login modal, then fetch projects after login
  // ------------------------------------------------------------------------
  function showLoginModalThenProjects() {
    const modal = createLoginModal();
    modal.loginButton.addEventListener('click', () => {
      const username = modal.usernameInput.value.trim();
      const password = modal.passwordInput.value.trim();
      if (!username || !password) {
        showToast('Please enter username and password', true);
        return;
      }
      chrome.runtime.sendMessage({ action: 'LOGIN', payload: { username, password } }, (loginResponse) => {
        if (!loginResponse) { showToast('No response from background.', true); return; }
        if (loginResponse.success) {
          showToast('Login successful!', false);
          modal.modalOverlay.remove();
          const { user, projects } = loginResponse;
          const finalTaskName = `${issueKey} - ${issueSummary}`;
          chrome.runtime.sendMessage({
            action: 'FIND_TASK_BY_NAME',
            payload: { taskName: finalTaskName, personId: user.id }
          }, (findResp) => {
            let existingTask = null;
            if (findResp && findResp.success) {
              const foundTasks = findResp.data;
              if (Array.isArray(foundTasks) && foundTasks.length > 0) { existingTask = foundTasks[0]; }
            }
            showCreateLogTimeModal({ user, projects, issueKey, issueSummary, existingTask });
          });
        } else {
          showToast(`Error: ${loginResponse.error}`, true);
        }
      });
    });
  }
})();
