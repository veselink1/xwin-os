# xwin-os
A browser-based operating system with support for distributed package management.  
2015 © [veselink1](https://github.com/veselink1), [lubomarinski](https://github.com/lubomarinski)

![Screenshot](https://raw.githubusercontent.com/veselink1/xwin-os/master/screenshots/Screenshot%20(156).png)

XWin OS is based on AngularJS 1.0 (the only Angular framework available back in 2015, when the project was created). It supports multiple applications and repositories. The repositories are URLs to `repo.json` that contains a list of the applications included in the repository. Each application is a self-contained web application that has a `main.js` file and is run in a separate iframe element. 
XWin OS also optionally integrates with the user's Google profile and allows storing data in the user's Google Drive storage.

Example `main.js`:
```javascript
'use strict';

// Get app from the interop global that exports some OS functionality.
var app = interop.app;
// Loads the index.html of the application in the XWin OS window instance.
app.loadURL(app.getRootPath());
// Set the size of the application window.
app.setSize({ width: "460px" , height: "320px" });
```
