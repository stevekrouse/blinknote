# blinknote

new tab chrome extension - fastest way to take a note that'll stick around

* opens in miliseconds
* works offline, but also saves data via the Chrome sync API so your data will be everywhere you're logged into Chrome

## Downsides

* data not accessible on mobile as chrome extensions don't work there
* size limit of 100k bytes
* single file, no folder-y organization

## Alternatives

### Data only available on Chrome and not mobile (chrome.storage.sync)

#### [TabText](https://chrome.google.com/webstore/detail/tabtext-synchronized-note/nfbkjfalikjfepompedddljmjoonmgla) -- best alternative

* **loads in under 1 second**
* doesn't handle too much data error well
* is very customizable
* not as minimalistic
* has the weather forecast
* rich text instead of markdown

#### [Paier](https://chrome.google.com/webstore/detail/papier/hhjeaokafplhjoogdemakihhdhffacia) 

* minimalistic 
* takes a bit over a second to load
* requres 4 tabs to get to typing (or you have to click with your mouse)
* is 45k lines of code (including all libraries)

### Data available on all devices

* noteto.me loads quickly, but still ~2 seconds, and depends upon Edsu which is new tech, but accessible from mobile
* notion currently takes 3+ seconds to load but they recently promised faster loading time before the end of 2018
* google docs take 3-7 seconds to load
* google keep takes 3+ seconds to load

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
