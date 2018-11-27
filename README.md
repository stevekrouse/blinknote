# blinknote

fastest way to take a note - chrome extension

* opens in miliseconds
* works offline
* saves data via Chrome Sync so your data will be everywhere you're logged into Chrome

## Downsides

* data not accessible on mobile as chrome extensions don't work there
* note size limit of 100k bytes
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
