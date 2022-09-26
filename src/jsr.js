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
    let o = JSON.parse(s);
    let res = project(o);
    console.log(res);
    linearize(res).then((lin) => {
      console.log(lin);
      cast(lin);
    });
  } catch (e) {
    console.error(e);
    alert("Wrong JSON input");
    document.querySelector("#output").value = "";
    return;
  }
}

function project(o) {
  let result;
  if (o?.constructor?.name === "Object") {
    result = projectAtom(o, "Root", 1);
    result.type = "Object";
  } else if (o?.constructor?.name === "Array") {
    result = projectAtom(o, "Root", 1);
    result.type = "Array";
  } else {
    result = {};
    result.type = o?.constructor?.name || "Null";
    result.value = o;
  }
  result.key = "Root";
  result.parent = null;
  result.level = 1;
  return result;
}

function projectAtom(o, p, pl) {
  let result = {};
  if (o?.constructor?.name === "Object") {
    result.value = []
    Object.keys(o).forEach((name) => {
      let q = projectAtom(o[name], name, pl + 1)
      q.key = name;
      q.parent = p;
      result.value.push(q);
    });
    result.size = Object.keys(o).length;
    result.type = "Object";
  } else if (o?.constructor?.name === "Array") {
    result.value = [];
    o.forEach((d, i) => {
      let q = projectAtom(d, i, pl + 1);
      q.index = i;
      q.parent = p;
      result.value.push(q);
    });
    result.length = o.length;
    result.type = "Array";
  } else {
    result = {
      value: o,
      type: o?.constructor?.name || "Null"
    }
  }
  result.level = pl;
  return result;
}

async function linearize(r) {
  let lin = await _linearize(r)
  return lin;
}

async function _linearize(r) {
  let lin = [];
  if (r?.type === "Object") {
    lin.push({
      open: true,
      level: r.level,
      key: r.key,
      size: r.size,
      type: r.type,
      parent: r.parent
    });
    for (const d of r.value) {
      let res = await linearize(d);
      lin.push(...res);
    }
    lin.push({
      finish: true,
      type: r.type,
      key: r.key,
      level: r.level
    });
  } else if (r?.type === "Array") {
    lin.push({
      open: true,
      level: r.level,
      key: r.key,
      length: r.length,
      type: r.type,
      parent: r.parent
    });
    for (const d of r.value) {
      let res = await linearize(d);
      lin.push(...res);
    }
    lin.push({
      finish: true,
      type: r.type,
      key: r.key,
      level: r.level
    });
  } else {
    lin.push({
      individual: true,
      level: r.level,
      key: r.key,
      size: r.size,
      type: r.type,
      parent: r.parent,
      index: r.index,
      value: r.value
    });
  }
  return lin;
}

function cast(lin) {
  let output = document.querySelector("#output");
  lin.forEach((d) => {
    let line = document.createElement("DIV");
    line.className = "cell-line";
    let view = document.createElement("DIV");
    let alt = d.key ? `key: ${d.key},` : `index: ${d.index},`;
    if (d.individual) {
      view.innerText = `${d.key || d.index}: ` + (d.type === "String" ? '"' : "") + `${d.value}` + (d.type === "String" ? '"' : "") + ","
      alt = alt + ` value: ${d.value}, type: ${d.type}, level: ${d.level}, parent: ${d.parent}`
    } else if (d.open) {
      if (d.type === "Object") {
        alt = alt + ` value: ${d.size} properties`;
      } else if (d.type === "Array") {
        alt = alt + ` value: ${d.length} elements`;
      }
      view.innerText = `${d.key}: ` + (d.type === "Object" ? "{" : "[")
      alt = alt + ` type: ${d.type}, level: ${d.level}, parent: ${d.parent}`
    } else {
      alt = "Closing " + d.key;
      view.innerText = (d.type === "Object" ? "}" : "]") + ","
    }
    view.style.paddingLeft = ((d.level - 1) + 0.25).toString() + "rem";
    // view.setAttribute("aria-hidden", true);
    view.setAttribute("aria-label", alt);
    line.append(view);
    // let sronly = document.createElement("DIV");
    // sronly.innerText = alt;
    // sronly.style.color = "transparent";
    // sronly.setAttribute("aria-hidden", false);
    // sronly.style.marginTop = "-1rem";
    // line.append(sronly);
    output.append(line);
  });
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