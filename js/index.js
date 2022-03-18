let state = [];
let schedule = [];

const generateID = () => {
  let randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return randLetter + Date.now();
}

const pushToState = (title, status, id) => {
  let baseState = { id, title, status }
  state.push(baseState)
  syncState()
}

const changeTodoStatus = (id) => {
  let itemIndex = state.findIndex(o => o.id == id)
  if (state[itemIndex].status === 'todo') {
    state[itemIndex].status = 'done'
  } else {
    state[itemIndex].status =  'todo';
  }
  syncState()
}

const deleteTodo = (id) => {
  let itemIndex = state.findIndex(o => o.id == id)
  state.splice(itemIndex, 1);
  syncState()
}

const removeState = () => {
  chrome.storage.sync.remove(["state"]);
  state = []
}

const removeSchedule = () => {
  chrome.storage.sync.remove(["schedule"]);
  schedule = []
}

const syncState = () => {
  chrome.storage.sync.set({"state": JSON.stringify(state)})
}

const printState = () => {
  for (let i=0; i<state.length; i++) {
    addItem(state[i].title, state[i].status, state[i].id, true)
  }
}

const addSchedule = (title, time, day) => {
  let sid = generateID()
  let scheduleObj = {
    id: sid, title, time, day
  }
  schedule.push(scheduleObj);
  chrome.storage.sync.set({"schedule": JSON.stringify(schedule)})
  printSchedule(day)
}

const printSchedule = (day) => {
  let filterSchedule
  filterSchedule = schedule.filter(item => item.day == day)
  let el = document.getElementById(day.toLowerCase() + '-schedule')
  el.innerHTML = ''
  filterSchedule.forEach((s) => {
    toIn = `<div class="card" id="${s.id}"><a class="close-button"></a><div class="time">${s.time}</div><div class="title">${s.title}</div></div>`
    el.innerHTML += toIn
  })
}

const addItem = (text, status, id, noUpdate) => {
  id = id ? id : generateID();
  let c = status === "done" ? "danger" : "";
  let item =
    '<li data-id="' +
    id +
    '" class="animated flipInX ' +
    c +
    '"><div class="checkbox"><span class="close"><i class="fa fa-times"></i></span><label><span class="checkbox-mask"></span><input type="checkbox" />' +
    text +
    "</label></div></li>";

  let isError = $(".form-control").hasClass("hidden");

  if (text === "") {
    $(".err")
      .removeClass("hidden")
      .addClass("animated bounceIn");
  } else {
    $(".err").addClass("hidden");
    $(".todo-list").append(item);
  }

  $(".refresh").removeClass("hidden");

  $(".no-items").addClass("hidden");

  $(".form-control")
    .val("")
    .attr("placeholder", "✍️ Add your task here...");
  setTimeout(function() {
    $(".todo-list li").removeClass("animated flipInX");
  }, 500);

  if (!noUpdate) {
    pushToState(text, "todo", id);
  }
}

const refresh = () => {
  $(".todo-list li").each(function(i) {
    $(this)
      .delay(70 * i)
      .queue(function() {
        $(this).addClass("animated bounceOutLeft");
        $(this).dequeue();
      });
  });

  setTimeout(function() {
    $(".todo-list li").remove();
    $(".no-items").removeClass("hidden");
    $(".err").addClass("hidden");
  }, 800);
}

const getRandomQuote = async () => {
  const response = await fetch("https://api.quotable.io/random");
  let data = await response.json();
  console.log(data);
}

$(function() {
  let err = $(".err"),
    formControl = $(".form-control"),
    isError = formControl.hasClass("hidden");

  if (!isError) {
    formControl.blur(function() {
      err.addClass("hidden");
    });
  }

  $(".add-btn").on("click", function() {
    let itemVal = $(".form-control").val();
    addItem(itemVal);
    formControl.focus();
  });

  $("#input-submit").on("click", function() {
    let title = document.getElementById("input-title").value
    let time = document.getElementById("input-time").value
    let day = document.getElementById("input-day").value
    addSchedule(title, time, day)
  });

  $("#button-todo").on("click", function() {
    removeState()
    printState()
  });

  $("#button-schedule").on("click", function() {
    removeSchedule()
    printSchedule("Monday")
    printSchedule("Tuesday")
    printSchedule("Wednesday")
    printSchedule("Tuesday")
    printSchedule("Friday")
  });

  $(".refresh").on("click", refresh);

  $(".todo-list").on("click", 'input[type="checkbox"]', function() {
    let li = $(this)
      .parent()
      .parent()
      .parent();
    li.toggleClass("danger");
    li.toggleClass("animated flipInX");

    changeTodoStatus(li.data().id);

    setTimeout(function() {
      li.removeClass("animated flipInX");
    }, 500);
  });

  $(".todo-list").on("click", ".close", function() {
    let box = $(this)
      .parent()
      .parent();

    if ($(".todo-list li").length == 1) {
      box.removeClass("animated flipInX").addClass("animated bounceOutLeft");
      setTimeout(function() {
        box.remove();
        $(".no-items").removeClass("hidden");
        $(".refresh").addClass("hidden");
      }, 500);
    } else {
      box.removeClass("animated flipInX").addClass("animated bounceOutLeft");
      setTimeout(function() {
        box.remove();
      }, 500);
    }

    deleteTodo(box.data().id)
  });

  $(".form-control").keypress(function(e) {
    if (e.which == 13) {
      let itemVal = $(".form-control").val();
      addItem(itemVal);
    }
  });
  $(".todo-list").sortable();
  $(".todo-list").disableSelection();
});

let todayContainer = document.querySelector(".today");

let d = new Date();
let weekday = new Array(7);
weekday[0] = "Sunday 🖖";
weekday[1] = "Monday 💪😀";
weekday[2] = "Tuesday 😜";
weekday[3] = "Wednesday 😌☕️";
weekday[4] = "Thursday 🤗";
weekday[5] = "Friday 🍻";
weekday[6] = "Saturday 😴";

let n = weekday[d.getDay()];
let randomWordArray = Array(
  "Oh my, it's ",
  "Whoop, it's ",
  "Happy ",
  "Seems it's ",
  "Awesome, it's ",
  "Have a nice ",
  "Happy fabulous ",
  "Enjoy your "
);

let randomWord = randomWordArray[Math.floor(Math.random() * randomWordArray.length)];
todayContainer.innerHTML = randomWord + n;

$(document).ready(function() {
  chrome.storage.sync.get(['state'], (res) => {
    if(res.state != undefined && res.state.length > 0) {
      let arrayObject = JSON.parse(res.state)
      arrayObject.forEach(item => {
        state.push(item)
      });
      printState();

    } else {
      /* let id = generateID()
      let baseState = {
        id: id,
        status: "todo",
        id: id,
        title: "This site uses 🍪to keep track of your tasks"
      }
      state.push(baseState)
      chrome.storage.sync.set({"state": JSON.stringify(state)}, () => {
        printState();
      }) */
    }
  });

  chrome.storage.sync.get(['schedule'], (res) => {
    if(res.schedule != undefined && res.schedule.length > 0) {
      let arrayObject = JSON.parse(res.schedule)
      arrayObject.forEach(item => {
        schedule.push(item)
      });
      printSchedule("Monday")
      printSchedule("Tuesday")
      printSchedule("Wednesday")
      printSchedule("Thursday")
      printSchedule("Friday")
      $(document).on("click", "a.close-button" , function() {
        let idSchedule = $(this).parent().attr('id');
        let itemIndex = schedule.findIndex(o => o.id == idSchedule)
        schedule.splice(itemIndex, 1);
        chrome.storage.sync.set({"schedule": JSON.stringify(schedule)})
        $(this).parent().remove();
      });
    }
  });

});