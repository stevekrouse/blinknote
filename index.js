let editorElement;
let errorElement;

// add map which automatically turns NodeList to array
NodeList.prototype.map = function(f) { return [].slice.call(this).map(f) }

const utils = {
  range: n => [...Array(n)].map((_, i) => i),
  debounce: (func, time) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args)
      }, time)
    }
  }
}

const editor = {
  id: Math.random(),
  lastChangeTime: 0,
  
  getText: () => editorElement.innerHTML,
  
  setText: text => {
    editorElement.innerHTML = text;
  }
}

const storage = {
  setText: text => {
    chrome.storage.largeSync.set(storage.textToObject(text), () => {
      if (chrome.runtime.lastError) {
        title.setState('Error');
        favicon.setState('red');
        console.log(chrome.runtime.lastError)
      } else {
        title.setState('Saved');
        favicon.setState('green');
      }
    }); 
  },
  
  getText: () => 
    new Promise(function(resolve) {
      chrome.storage.largeSync.get(null, resolve)
    }).then(storage.joinText),
  
  getLastChangeMetaData: () => new Promise(function(resolve) {
    chrome.storage.largeSync.get(['lastChangeEditor', 'lastChangeTime'], resolve);
  }),
  
  textToObject: text => {
    editor.lastChangeTime = Date.now()
    return {
      text,
      lastChangeEditor: editor.id,
      lastChangeTime: editor.lastChangeTime
    };
  },
  
  joinText: splittedText => splittedText.text,
  
  QUOTA_BYTES: 102400,
  
  getBytesInUse: () => new Promise(function(resolve) {
    chrome.storage.sync.getBytesInUse(null, resolve)
  })
}

const title =  {
  // state: 'Saved', 'Saving', 'Error'  
  setState: state => {
    title.state = state; 
    title.update();
  },
  setCharacterLength: async length => {
    title.charLength = await storage.getBytesInUse();
    title.update();
  },
  update: () => {
    let chars = title.charLength ? `(${title.charLength +"/" + storage.QUOTA_BYTES})` : ''
    document.title = `${title.state} - BlinkNote ${chars}`;  
  }
}

const favicon = {
  // state: 'green', 'red', 'default'  
  setState: state => {
    if (state !== favicon.state) {
      favicon.state = state; 
      favicon.update(`images/blinknote-${favicon.state}-icon48.png`);
    }
  },
  update: (href) => {
    favicon.el.setAttribute('href', href);
  },
  cacheEl: () => {
    favicon.el = document.querySelector('#favicon');
  }
}

const init = () => {
  editorElement = document.querySelector('#c');
  errorElement = document.querySelector("#error");
  favicon.cacheEl();
  
  editorElement.focus();
  
  // mock chrome.storage.sync to work with localStorage if not embedded in chrome extension
  if (!chrome.storage) {
    chrome.storage = {
      sync: {
        get: (keys, callback) => {
          if (keys === null ){ keys = Object.keys(localStorage) }
          let ret = {}
          keys.forEach(key => ret[key] = JSON.parse(localStorage[key]))
          callback(ret)
        },
        set: (obj, callback) => {
          Object.keys(obj).forEach(key => localStorage.setItem(key, JSON.stringify(obj[key])))
          callback();
        },
        QUOTA_BYTES_PER_ITEM: 8192,
        QUOTA_BYTES: 102400,
        clear: () => localStorage.clear(),
        getBytesInUse: () => JSON.stringify(localStorage).length,
        remove: keys => keys.forEach(key => localStorage.removeItem(key))
      },
      onChanged: {
        addListener: (func) => {
          window.addEventListener("storage", () => func(null, 'sync'))
        }
      }
    }
  }
  window.largeSync();
  
  const markdownStyle = () => {
    // make titles big
    editorElement.querySelectorAll('*')
      .map(e => [e, e.innerText])
      .map(([e, text]) => [e, text.match(/^(#+)\s.*$/)])
      .filter(([e, m]) => m)
      .map(([e, m]) => [e, m[1]])
      .forEach(([e,m]) => {
        e.style.fontSize = (50 - (5*m.length)) || 3; 
        e.style.marginBottom = 2 + "px";
        e.style.marginTop = 2 + "px";
      })
      
    // make non-titles regular sized
    editorElement.querySelectorAll('*')
      .map(e => [e, e.innerText])
      .map(([e, text]) => [e, text.match(/^(#+)\s.*$/)])
      .filter(([e, m]) => !m)
      .forEach(([e, m]) => e.style.fontSize = '16px')
  }
  
  const editorStyleChanges = () => { 
    errorElement.style.display = title.charLength > storage.QUOTA_BYTES ? 'block' : 'none';
    
    markdownStyle();
  };
  editorElement.addEventListener('input', editorStyleChanges);
  
  title.setCharacterLength()
  
  title.setState('Saved');
  favicon.setState('green');
  storage.getText().then(text => {
    editor.setText(text)
    editorStyleChanges();
  })
  
  // save changes and update title char text length
  editorElement.addEventListener('keyup', (e) => { 
    title.setState('Saving');
    favicon.setState('default');
    editor.lastChange = Date.now()
    editorChangeHandler();
  });
  const editorChangeHandler = utils.debounce(() => {
    title.setCharacterLength();
    storage.setText(editor.getText())
  });

  // propogate changes from other tabs to this one
  chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace === 'sync') {
      let { lastChangeEditor, lastChangeTime } = await storage.getLastChangeMetaData()
      if (editor.id !== lastChangeEditor && lastChangeTime > editor.lastChangeTime) {
        title.setCharacterLength();
        editor.setText(await storage.getText())
        title.setState('Saved');
        favicon.setState('green');
      }
    }
  });
  
  // warns you about leaving before save
  window.onbeforeunload = function() {
    return title.state === 'Saved' ? null : true;
  }
}

window.addEventListener('load', init);