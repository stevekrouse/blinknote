let splitKeys = [0,1,2,3,4,5,6,7,8,9,10,11,12];
let editor;
let error;
let timeout; 
let status;

const init = () => {
  document.title = 'BlinkNote';
  editor = document.querySelector('#c');
  error = document.querySelector("#error");
  status = document.querySelector("#status");
  chrome.storage.sync.get(null, items => {
    displayText(items);
  });
  editor.addEventListener('keyup', (e) => { 
    setTitle('Saving'); 
    ([].slice.call(editor.querySelectorAll('*')).map(e => [e, e.innerText]).map(([e, text]) => [e, text.match(/^(#+)\s.*$/)]).filter(([e, m]) => m).map(([e, m]) => [e, m[1]]).forEach(([e,m]) => {e.style.transition = "font-size 0.5s cubic-bezier(0, 1.03, 1, 1) 0s"; e.style.fontSize = (30 - (3*m.length)) || 3}));
    clearTimeout(timeout);
    timeout = setTimeout(() => { 
      let text = editor.innerHTML;
      setText(text)
    }, 500);
  });
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      let items = {};
      const keys = Object.keys(changes);
      let editorText = editor.innerHTML;
      keys.forEach(key => {
        let newValue = changes[key].newValue;
        if (newValue !== editorText) {
          items[key] = newValue;
        }
      });
      if (Object.keys(items).length > 0) {
        displayText(items);
        setTitle('Updated');
      }
    }
  });
}

const setText = (text) => {
  // Split up text into multiple keys because there's a 8000 char limit on keys
  // https://developer.chrome.com/apps/storage#type-StorageArea
  let texts = {};
  splitKeys.forEach(i => {
    // temporarily set limit to 5000 because I can't get an accurate byte count
    texts['text' + i] = text.substring(i * 5000, (i + 1) * 5000);
  });
  error.style.display = text.length > 100000 ? 'block' : 'none';
  chrome.storage.sync.set(texts, e => {
    if (chrome.runtime.lastError) {
      setTitle('Error');
      console.log(chrome.runtime.lastError)
    } else {
      setTitle('Saved');
    }
  }); 
};

const displayText = (items) => {
  // Rejoin text that we split up below
  let text = splitKeys.map(i => items['text' + i]).filter(t => t).join("");
  editor.innerHTML = text;
}

const setTitle = (title) => {
  document.title = `${title} - BlinkNote`;
}

window.addEventListener('load', (e) => {
  init();
});