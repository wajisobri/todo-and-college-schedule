let id = generateID()
      let baseState = {
        id: id,
        status: "todo",
        id: id,
        title: "This site uses 🍪to keep track of your tasks"
      }
      state.push(baseState)
      chrome.storage.sync.set({"state": JSON.stringify(state)}, () => {
        printState();
      })