// background.js

const TIMETRACKER_LOGIN_URL = 'https://timetracker.iglu.ee/api/login';
const TIMETRACKER_TASKS_URL = 'https://timetracker.iglu.ee/api/tasks';

/**
 * Logs in with given username/password – returns x-auth-token
 * and stores it in chrome.storage.local.
 */
async function loginToTimetracker(username, password) {
  const response = await fetch(TIMETRACKER_LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Login failed: ${errorText}`);
  }

  const token = response.headers.get('x-Auth-Token');
  if (!token) {
    throw new Error('No x-Auth-Token found in response headers.');
  }

  await chrome.storage.local.set({ timetrackerAuthToken: token });
  return token;
}

/**
 * Uses the stored token to get the current user.
 */
async function getCurrentUser() {
  const { timetrackerAuthToken } = await chrome.storage.local.get('timetrackerAuthToken');
  if (!timetrackerAuthToken) {
    throw new Error('NO_TOKEN');
  }
  const response = await fetch('https://timetracker.iglu.ee/api/users/current', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'x-auth-token': timetrackerAuthToken
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }
  const user = await response.json();
  return user;
}

/**
 * Uses the stored token to get projects for the given user id.
 */
async function getProjectsForUser(personId) {
  const { timetrackerAuthToken } = await chrome.storage.local.get('timetrackerAuthToken');
  if (!timetrackerAuthToken) {
    throw new Error('NO_TOKEN');
  }
  const url = `https://timetracker.iglu.ee/api/projects?isActive=true&personId=${personId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'x-auth-token': timetrackerAuthToken
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  const projects = await response.json();
  return projects;
}

/**
 * First get the current user, then fetch projects for that user.
 */
async function getProjects() {
  const user = await getCurrentUser();
  const projects = await getProjectsForUser(user.id);
  return projects;
}

/**
 * Actually creates the task in Timetracker with the passed project.
 */
async function doCreateTask(issueKey, issueSummary, project) {
  const { timetrackerAuthToken } = await chrome.storage.local.get('timetrackerAuthToken');
  if (!timetrackerAuthToken) {
    throw new Error('NO_TOKEN');
  }
  const postData = {
    name: `${issueKey} - ${issueSummary}`,
    type: "development",
    project // Use the project data as passed in
  };

  const response = await fetch(TIMETRACKER_TASKS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept': 'application/json, text/plain, */*',
      'x-auth-token': timetrackerAuthToken
    },
    body: JSON.stringify(postData)
  });

  if (response.status === 401) {
    throw new Error('TOKEN_INVALID');
  }

  if (response.status === 400) {
    const errorResponse = await response.json();
    if (
      Array.isArray(errorResponse) &&
      errorResponse.length > 0 &&
      errorResponse[0].message?.code === 'taskDuplicateKey'
    ) {
      throw new Error('Task already exists in Timetracker!');
    } else {
      throw new Error(JSON.stringify(errorResponse));
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const data = await response.json();
  return data;
}

/**
 * Listen for messages from content script.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_PROJECTS') {
    getProjects()
      .then(projects => sendResponse({ success: true, projects }))
      .catch(err => {
        if (err.message === 'NO_TOKEN') {
          sendResponse({ success: false, needCredentials: true });
        } else {
          sendResponse({ success: false, error: err.message });
        }
      });
    return true; // Keep message channel open
  }

  if (request.action === 'LOGIN') {
    const { username, password } = request.payload;
    loginToTimetracker(username, password)
      .then(() => getProjects())
      .then(projects => sendResponse({ success: true, projects }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === 'CREATE_TIMETRACKER_TASK') {
    const { issueKey, issueSummary, project } = request.payload;
    doCreateTask(issueKey, issueSummary, project)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((err) => {
        if (err.message === 'NO_TOKEN' || err.message === 'TOKEN_INVALID') {
          sendResponse({ success: false, needCredentials: true });
        } else {
          sendResponse({ success: false, error: err.message });
        }
      });
    return true;
  }
});
