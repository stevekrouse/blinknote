let editor = document.querySelector('#c');
let error = document.querySelector("#error");
let splitKeys = [0,1,2,3,4,5,6,7,8,9,10,11,12];
let timeout; 
chrome.storage.sync.get(null, items => {
  // Rejoin text that we split up below
  let text = splitKeys.map(i => items['text' + i]).filter(t => t).join()
  editor.innerHTML = text;
})
editor.addEventListener('keyup', (e) => { 
  // change the font size, animated, of all lines beginning with # 
  ([].slice.call(editor.querySelectorAll('*')).map(e => [e, e.innerText]).map(([e, text]) => [e, text.match(/^(#+)\s.*$/)]).filter(([e, m]) => m).map(([e, m]) => [e, m[1]]).forEach(([e,m]) => {e.style.transition = "font-size 0.5s cubic-bezier(0, 1.03, 1, 1) 0s"; e.style.fontSize = (30 - (3*m.length)) || 3}))
  clearTimeout(timeout);
  timeout = setTimeout(() => { 
    let text = editor.innerHTML; 
    setText(text)
  }, 500); 
  
  function setText(text) {
    // Split up text into multiple keys because there's a 8000 char limit on keys
    // https://developer.chrome.com/apps/storage#type-StorageArea
    var texts = {}
    splitKeys.forEach(i => {
      texts['text' + i] = text.substring(i * 8000, (i + 1) *8000);
    });
    error.style.display = text.length > 100000 ? 'block' : 'none';
    chrome.storage.sync.set(texts, () => {
      if (chrome.runtime.lastError) {
        alert("Check console for error")
        console.log(chrome.runtime.lastError)
      }
    }); 
  }
});
