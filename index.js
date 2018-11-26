let editorElement;
let errorElement;
let timeout; 

const utils = {
  range: n => [...Array(n)].map((_, i) => i)
}

const editor = {
  getText: () => editorElement.innerHTML,
  
  setText: text => {
    editorElement.innerHTML = text;
  }
}

const storage = {
  setText: text => {
    splittedText = storage.splitText(text);
    chrome.storage.sync.set(splittedText, () => {
      if (chrome.runtime.lastError) {
        title.set('Error');
        console.log(chrome.runtime.lastError)
      } else {
        title.set('Saved');
      }
    }); 
  },
  
  getText: () => 
    new Promise(function(resolve) {
      chrome.storage.sync.get(null, items => {
        resolve(items);
      });
    }).then(storage.joinText),
  
  splitText: text => {
    let splittedText = {};
    storage.splitKeys().forEach(i => {
      splittedText['text' + i] = text.substring(i * storage.QUOTA_BYTES_PER_ITEM, (i + 1) * storage.QUOTA_BYTES_PER_ITEM);
    });
    return splittedText;
  },
  
  joinText: splittedText => storage.splitKeys().map(i => splittedText['text' + i]).filter(t => t).join(""),
  
  splitKeys: () => utils.range(storage.QUOTA_BYTES / storage.QUOTA_BYTES_PER_ITEM),
  
  // temporarily set to 5k until split on accurate byte count
  QUOTA_BYTES_PER_ITEM: 5000, // chrome.storage.sync.QUOTA_BYTES_PER_ITEM is 8,192
  
  // temporarily set to 50k until split on accurate byte count
  QUOTA_BYTES: 50000 // chrome.storage.sync.QUOTA_BYTES is 102,400
}

const title =  {
  // state: 'Saved', 'Saving', 'Error'
  set: state => {
    title.state = state; 
    document.title = `${title.state} - BlinkNote (${editor.getText().length +"/" + storage.QUOTA_BYTES})`;  
  },
}


const init = () => {
  editorElement = document.querySelector('#c');
  errorElement = document.querySelector("#error");
  
  const editorStyleChanges = () => { 
    // increase font size of lines beginning in hashtag, animatedly
    ([].slice.call(editorElement.querySelectorAll('*')).map(e => [e, e.innerText]).map(([e, text]) => [e, text.match(/^(#+)\s.*$/)]).filter(([e, m]) => m).map(([e, m]) => [e, m[1]]).forEach(([e,m]) => {e.style.transition = "font-size 0.5s cubic-bezier(0, 1.03, 1, 1) 0s"; e.style.fontSize = (30 - (3*m.length)) || 3}));
    
    // put error on the screen if the total text length is greater than the limit
    // the limit should be 100k but this is until we can get an accurate byte count
    errorElement.style.display = editor.getText().length > 50000 ? 'block' : 'none';
  };
  editorStyleChanges();
  editorElement.addEventListener('input', editorStyleChanges);
  
  storage.getText()
    .then(editor.setText)
    .then(() => title.set('Saved'))
  
  
  // save changes
  editorElement.addEventListener('keyup', (e) => { 
    title.set('Saving'); 
    clearTimeout(timeout);
    timeout = setTimeout(() => { 
      storage.setText(editor.getText())
    }, 500);
  });
  
  // propogate changes from other tabs to this one
  chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace === 'sync') {
      if (editor.getText() !== await storage.getText()) {
        editor.setText(await storage.getText())
        title.set('Saved');
      }
    }
  });
  
  // warns you about leaving before save
  window.onbeforeunload = function() {
    return title.state === 'Saved' ? null : true;
  }
}

window.addEventListener('load', init);
