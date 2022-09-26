function saveInput(e) {
  console.log(e);
  let value = e.target.value;
  localStorage.setItem("jsr-input", value);
}

function loadInput() {
  let i = localStorage.getItem("jsr-input");
  if (!i) {
    i = "";
    localStorage.setItem("jsr-input", "");
  }
  document.querySelector("#input").value = i;
}

function render() {
  let s = document.querySelector("#input").value;
  try {
    let o = JSON.parse(s)
    console.log(o);
  } catch {
    alert("Wrong JSON input");
    document.querySelector("#output").value = "";
    return;
  }
}

function init() {
  loadInput();
  document.querySelector("#input").addEventListener("keyup", (e) => {
    saveInput(e);
  })
  document.querySelector("#render").addEventListener("click", () => {
    render();
  })
}

init();