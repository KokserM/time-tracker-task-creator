document.getElementById('saveCredentialsButton').addEventListener('click', () => {
  const username = document.getElementById('usernameInput').value.trim();
  const password = document.getElementById('passwordInput').value.trim();

  // Save them to chrome.storage.local
  chrome.storage.local.set({ timetrackerUsername: username, timetrackerPassword: password }, () => {
    alert('Credentials saved successfully!');
  });
});
