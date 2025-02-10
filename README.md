# Time Tracker Task Creator Extension

**An awesome Chrome extension to create tasks in Timetracker directly from Jira issues.**

## Features

- **Jira Integration:** Create Timetracker tasks from Jira with one click.
- **Seamless Authentication:** Displays a login modal if no valid token is available.
- **Project Selection:** Stylish dropdown for selecting your project after authentication.
- **Instant Feedback:** Toast notifications alert you to success or errors.
- **Chrome Storage:** Saves your authentication token for subsequent use.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/KokserM/time-tracker-task-creator.git
   cd time-tracker-task-creator
    ```
2. **Load the Extension:**

   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable `Developer mode` in the top right corner.
   - Click `Load unpacked` and select the `time-tracker-task-creator` directory.

## Usage

1. **Navigate to Jira issue page:**

   - The extension automatically integrates into the Jira interface.


2. **Click "Create Timetracker Task"**:

   - If you are already authenticated (a valid token exists), a stylish dropdown with your available projects will appear near the button.
   - If not, a login modal will appear prompting you to enter your credentials.


3. **Log In(if required):**

   - Enter your Timetracker credentials and click `Log In`.
   - After successful authentication, the extension stores your token and the next click will display the projects dropdown.
   
4. **Create a Task and log work:**

   - Choose a project from the dropdown
   - Select date for worklog creation
   - Select time spent on the task
   - Check the `Log time with task` checkbox (default: checked)
   - and click `Create Task / Log Time`.
   - A toast notification will appear to confirm the task and worklog creation or display an error message.

5. **Creating a task without logging work:**

    - Choose a project from the dropdown
    - Uncheck the `Log time with task` checkbox (default: checked)
    - and click `Create Task / Log Time`.
    - A toast notification will appear to confirm the task creation or display an error message.

5. **Task already created:**

    - Project selection is greyed out
    - Check `Log time with task` checkbox (default: checked)
    - Select date for worklog creation
    - Select time spent on the task
    - and click `Create Task / Log Time`.
    - A toast notification will appear to confirm the worklog creation or display an error message.

## Configuration
- API endpoints:
  - Login: https://timetracker.iglu.ee/api/login
  - Task Creation: https://timetracker.iglu.ee/api/tasks
  - Current User: https://timetracker.iglu.ee/api/users/current
  - Projects: https://timetracker.iglu.ee/api/projects?isActive=true&personId=<user-id>


- Chrome Storage:
  - The extension uses Chrome's `chrome.storage` API to save the user's authentication token.
  - The token is stored under the key `timetrackerToken`.
  - Clearing Chrome Storage:
    ```bash
     chrome.storage.local.clear();
      ```