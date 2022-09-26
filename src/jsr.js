function saveInput(e) {
  console.log(e);
  let value = e.target.value;
  localStorage.setItem("jsr-input", value);
}

function loadInput() {
  let i = localStorage.getItem("jsr-input");
  if (i === null) {
    i = JSON.stringify(defaultData, null, 2);
    localStorage.setItem("jsr-input", i);
  } else if (!i) {
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

const defaultData = {
  "created_at": "Wed Oct 10 20:19:24 +0000 2018",
  "id": 1050118621198921728,
  "id_str": "1050118621198921728",
  "text": "To make room for more expression, we will now count all emojis as equal—including those with gender‍‍‍ and skin t… https://t.co/MkGjXf9aXm",
  "truncated": true,
  "entities": {
    "hashtags": [],
    "symbols": [],
    "user_mentions": [],
    "urls": [
      {
        "url": "https://t.co/MkGjXf9aXm",
        "expanded_url": "https://twitter.com/i/web/status/1050118621198921728",
        "display_url": "twitter.com/i/web/status/1…",
        "indices": [
          117,
          140
        ]
      }
    ]
  },
  "source": "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
  "in_reply_to_status_id": null,
  "in_reply_to_status_id_str": null,
  "in_reply_to_user_id": null,
  "in_reply_to_user_id_str": null,
  "in_reply_to_screen_name": null,
  "user": {
    "id": 6253282,
    "id_str": "6253282",
    "name": "Twitter API",
    "screen_name": "TwitterAPI",
    "location": "San Francisco, CA",
    "description": "The Real Twitter API. Tweets about API changes, service issues and our Developer Platform. Don't get an answer? It's on my website.",
    "url": "https://t.co/8IkCzCDr19",
    "entities": {
      "url": {
        "urls": [
          {
            "url": "https://t.co/8IkCzCDr19",
            "expanded_url": "https://developer.twitter.com",
            "display_url": "developer.twitter.com",
            "indices": [
              0,
              23
            ]
          }
        ]
      },
      "description": {
        "urls": []
      }
    },
    "protected": false,
    "followers_count": 6128663,
    "friends_count": 12,
    "listed_count": 12900,
    "created_at": "Wed May 23 06:01:13 +0000 2007",
    "favourites_count": 32,
    "utc_offset": null,
    "time_zone": null,
    "geo_enabled": null,
    "verified": true,
    "statuses_count": 3659,
    "lang": "null",
    "contributors_enabled": null,
    "is_translator": null,
    "is_translation_enabled": null,
    "profile_background_color": "null",
    "profile_background_image_url": "null",
    "profile_background_image_url_https": "null",
    "profile_background_tile": null,
    "profile_image_url": "null",
    "profile_image_url_https": "https://pbs.twimg.com/profile_images/942858479592554497/BbazLO9L_normal.jpg",
    "profile_banner_url": "https://pbs.twimg.com/profile_banners/6253282/1497491515",
    "profile_link_color": "null",
    "profile_sidebar_border_color": "null",
    "profile_sidebar_fill_color": "null",
    "profile_text_color": "null",
    "profile_use_background_image": null,
    "has_extended_profile": null,
    "default_profile": false,
    "default_profile_image": false,
    "following": null,
    "follow_request_sent": null,
    "notifications": null,
    "translator_type": "null"
  },
  "geo": null,
  "coordinates": null,
  "place": null,
  "contributors": null,
  "is_quote_status": false,
  "retweet_count": 161,
  "favorite_count": 296,
  "favorited": false,
  "retweeted": false,
  "possibly_sensitive": false,
  "possibly_sensitive_appealable": false,
  "lang": "en"
}