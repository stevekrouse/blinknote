# blinknote

new tab chrome extension - fastest way to take a note that'll stick around

* opens in miliseconds
* works offline, but also saves data via the Chrome sync API so you data will be everywhere you're logged into Chrome

## Todos

### Required

* make sure changes are saved before page is closed
* haven't been able to get an accurate count of bytes... https://github.com/dtuit/chrome-storage-largeSync
* find a way to update the page when the data is changed in another tab without screwing things up (there's an onChanged event)
* favicons / icons
* publish to chrome store
* broadcast: put on my website / tweet about it / put on HN / put on PH

### Possible feature

* show how many charcters are left
* checkbox when synced
* markdown styling stackedit style (augmented but still just markdown)
  * start with just titles
  * images
  * lists
  * links
  * HTML
  * table of contents off to the side, based on headers like in Google Docs 
* history of edits / go back in time like google docs with diffs

### Yak-shaving

* fix variable names
* extract debounce / throttle as own function
