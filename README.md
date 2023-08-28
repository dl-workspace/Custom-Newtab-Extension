# Custom Newtab Extension
- Replace your new tab page with a custom themed page; featuring notes, to-do list, Gmail unread count & currated Hololive HD wallpapers
- Private/Incognito browsing is not supported

# Modification
- The wallpapers are located under `/start/skins/images` 
- Preferences settings are located under `/start/common/prefs-sys.js`

# Installation
## Chromnium Browsers (Native)
In the extension settings
1. Make sure `Developer Mode` is enabled 
2. Load unpacked, choose the whole folder

## Firefox (Tested)
1. You will need to first disable signature signing (available only to Firefox Nightly and Developer)
	- Go to `about:config` (enter it into address bar)
	- Set `xpinstall.signatures.required` to `false`
2. Zip the following folders and files directly (not the entire repository)
	- `/start`
	- `/locales`
	- `manifest.json`
3. Drag and drop the zip file into the addon settings for installation
