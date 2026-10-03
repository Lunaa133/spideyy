// clock
setInterval(function () {
  const timeEl = document.querySelector("#timeElement");
  if (timeEl) {
    timeEl.innerHTML = new Date().toLocaleTimeString();
  }
}, 1000);


function closeWelcomeWindow() {
  const closable = document.getElementById("window");
  if (closable) {
    closable.style.display = "none";
  }
}

// dragging
let highestZIndex = 300;

function bringToFront(element) {
  if (!element) return;
  highestZIndex++;
  element.style.zIndex = highestZIndex;
}

function drag(element) {
  if (!element) return;

  var ix = 0, iy = 0, cx = 0, cy = 0;
  const header = document.getElementById(element.id + "header");

  // clicked window to front
  element.addEventListener("mousedown", function () {
    bringToFront(element);
  });

  if (header) {
    header.onmousedown = startDragging;
  } else {
    element.onmousedown = startDragging;
  }

  function startDragging(e) {
    e = e || window.event;
    e.preventDefault();

    bringToFront(element);

    ix = e.clientX;
    iy = e.clientY;

    document.onmouseup = stopDragging;
    document.onmousemove = dragElement;
  }

  function dragElement(e) {
    e = e || window.event;
    e.preventDefault();

    cx = ix - e.clientX;
    cy = iy - e.clientY;
    ix = e.clientX;
    iy = e.clientY;


    let newTop = element.offsetTop - cy;
    let newLeft = element.offsetLeft - cx;

    // top bar limit
    const TOP_BAR_HEIGHT = 30;
    if (newTop < TOP_BAR_HEIGHT) {
      newTop = TOP_BAR_HEIGHT;
    }

    // bottom of the page limit
    const maxTop = window.innerHeight - element.offsetHeight;
    if (newTop > maxTop) {
      newTop = maxTop;
    }

    // left / screen limit
    if (newLeft < 0) {
      newLeft = 0;
    }

    // right / screen limit
    const maxLeft = window.innerWidth - element.offsetWidth;
    if (newLeft > maxLeft) {
      newLeft = maxLeft;
    }

    // position update
    element.style.top = newTop + "px";
    element.style.left = newLeft + "px";
  }

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// icon selection
let currentSelectedIcon = null;

function handleIconClick(e, iconElement, appType) {
  if (e) e.stopPropagation();

  // rmv selection previously selected icon
  if (typeof currentSelectedIcon !== "undefined" && currentSelectedIcon && currentSelectedIcon !== iconElement) {
    currentSelectedIcon.classList.remove("icon-selected");
  }

  iconElement.classList.add("icon-selected");
  currentSelectedIcon = iconElement;

  // checking
  if (appType === "music") {
    openMusicApp();
  } else if (appType === "notes" || appType === "journal") {
    openNotesApp();
  } else if (appType === "welcome") {
    // for welcome window
    const welcomeWin = document.getElementById("window");
    if (welcomeWin) {
      welcomeWin.style.display = "flex";
      if (typeof bringToFront === "function") bringToFront(welcomeWin);
    }
  }
}

// rm spider when clicked elsewhere
document.addEventListener("click", function () {
  if (currentSelectedIcon) {
    currentSelectedIcon.classList.remove("icon-selected");
    currentSelectedIcon = null;
  }
});

// app window controls
function openNotesApp() {
  const notesWin = document.getElementById("notesWindow");
  if (notesWin) {
    notesWin.style.display = "flex";
    notesWin.style.zIndex = 300;
  }
}

function closeNotesApp() {
  const notesWin = document.getElementById("notesWindow");
  if (notesWin) {
    notesWin.style.display = "none";
  }
}

// when dom ready, start dragging
window.addEventListener("DOMContentLoaded", function () {
  const welcomeWin = document.getElementById("window");
  if (welcomeWin) drag(welcomeWin);

  const notesWin = document.getElementById("notesWindow");
  if (notesWin) drag(notesWin);
});

// multi notebook local storage
let notebooks = JSON.parse(localStorage.getItem("spidey_notebooks")) || {
  "Main Journal": ["Properties of synthetic webbing..."]
};

let currentNotebookKey = Object.keys(notebooks)[0] || "Main Journal";
let activePageIndex = 0;

// update ui
function loadJournalUI() {
  const textarea = document.getElementById("notesTextarea");
  const indicator = document.getElementById("pageIndicator");
  const dropdown = document.getElementById("notebookDropdown");

  const currentPages = notebooks[currentNotebookKey] || [""];

  if (activePageIndex >= currentPages.length) {
    activePageIndex = currentPages.length - 1;
  }
  if (activePageIndex < 0) {
    activePageIndex = 0;
  }

  // set textarea content
  if (textarea) {
    textarea.value = currentPages[activePageIndex] || "";
  }

  // update page counter
  if (indicator) {
    indicator.innerText = `Page ${activePageIndex + 1}/${currentPages.length}`;
  }

  // populate notebook selector dropdown
  if (dropdown) {
    dropdown.innerHTML = "";
    Object.keys(notebooks).forEach(function (name) {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      if (name === currentNotebookKey) option.selected = true;
      dropdown.appendChild(option);
    });
  }
}

// auto-save changes meanwhile typing
window.addEventListener("DOMContentLoaded", function () {
  const textarea = document.getElementById("notesTextarea");
  
  if (textarea) {
    textarea.addEventListener("input", function () {
      if (!notebooks[currentNotebookKey]) {
        notebooks[currentNotebookKey] = [""];
      }
      notebooks[currentNotebookKey][activePageIndex] = textarea.value;
      localStorage.setItem("spidey_notebooks", JSON.stringify(notebooks));
    });
  }
});

// flip pages
function prevPage() {
  if (activePageIndex > 0) {
    activePageIndex--;
    loadJournalUI();
  }
}

function nextPage() {
  const currentPages = notebooks[currentNotebookKey] || [""];
  if (activePageIndex < currentPages.length - 1) {
    activePageIndex++;
    loadJournalUI();
  }
}

// new page for current notebook
function addPageToNotebook() {
  notebooks[currentNotebookKey].push("");
  activePageIndex = notebooks[currentNotebookKey].length - 1;
  localStorage.setItem("spidey_notebooks", JSON.stringify(notebooks));
  loadJournalUI();
}

// create new notebook
function createNewNotebook() {
  const bookName = prompt("Enter new notebook title:", "Suit Specs");
  if (bookName && bookName.trim() !== "") {
    const cleanName = bookName.trim();
    if (!notebooks[cleanName]) {
      notebooks[cleanName] = [""];
    }
    currentNotebookKey = cleanName;
    activePageIndex = 0;
    localStorage.setItem("spidey_notebooks", JSON.stringify(notebooks));
    loadJournalUI();
  }
}

// switch notebook
function switchNotebook(selectedKey) {
  if (notebooks[selectedKey]) {
    currentNotebookKey = selectedKey;
    activePageIndex = 0;
    loadJournalUI();
  }
}

// open / close for notes
function openNotesApp() {
  const notesWin = document.getElementById("notesWindow");
  if (notesWin) {
    notesWin.style.display = "flex";
    if (typeof bringToFront === "function") bringToFront(notesWin);
    loadJournalUI();
  }
}

function closeNotesApp() {
  const notesWin = document.getElementById("notesWindow");
  if (notesWin) {
    notesWin.style.display = "none";
  }
}

// del current page
function deleteCurrentPage() {
  const currentPages = notebooks[currentNotebookKey];

  // no deletion if ist the only page
  if (currentPages.length <= 1) {
    alert("Cannot delete the only page in the notebook! Clear the text instead.");
    return;
  }

  if (confirm(`Delete Page ${activePageIndex + 1}?`)) {
    // rmv active page
    currentPages.splice(activePageIndex, 1);

    // adjust active index when deleting the last one
    if (activePageIndex >= currentPages.length) {
      activePageIndex = currentPages.length - 1;
    }

    localStorage.setItem("spidey_notebooks", JSON.stringify(notebooks));
    loadJournalUI();
  }
}

// delete notebook
function deleteCurrentNotebook() {
  const keys = Object.keys(notebooks);

  // no deletion if it s the only notebook
  if (keys.length <= 1) {
    alert("Cannot delete the last notebook!");
    return;
  }

  if (confirm(`Are you sure you want to delete the "${currentNotebookKey}" notebook and all its pages?`)) {
    // rm current notebook
    delete notebooks[currentNotebookKey];

    // switch to 1st available notebook
    currentNotebookKey = Object.keys(notebooks)[0];
    activePageIndex = 0;

    localStorage.setItem("spidey_notebooks", JSON.stringify(notebooks));
    loadJournalUI();
  }
}
// music player

// default tracks
const defaultPlaylist = [
  { title: "my direction", artist: "sum-41", url: "music/my direction.mp3" },
  { title: "staring at the sun", artist: "the offspring", url: "music/staring at the sun.mp3" },
  { title: "all messed up", artist: "sum-41", url: "music/all messed up.mp3" }
];

// in-memory array for session uploaded tracks
let customPlaylist = [];
let currentTrackIndex = 0;

// combined list of default + user uploaded tracks
function getAllTracks() {
  return [...defaultPlaylist, ...customPlaylist];
}

// render playlist with scrollable structure and remove button !! yeyy
function renderPlaylist() {
  const listEl = document.getElementById("playlistList");
  if (!listEl) return;

  listEl.innerHTML = "";
  const allTracks = getAllTracks();

  allTracks.forEach((track, index) => {
    const li = document.createElement("li");
    li.className = `playlist-item ${index === currentTrackIndex ? "active" : ""}`;
    
    // track info
    const infoSpan = document.createElement("span");
    infoSpan.style.flex = "1";
    infoSpan.style.overflow = "hidden";
    infoSpan.style.textOverflow = "ellipsis";
    infoSpan.style.whiteSpace = "nowrap";
    infoSpan.innerHTML = `<strong>${index + 1}. ${track.title}</strong> <small style="color:#888;">- ${track.artist}</small>`;

    // click track to play
    infoSpan.addEventListener("click", function() {
      playTrack(index);
    });

    li.appendChild(infoSpan);

    // delete button for custom track deletion
    if (index >= defaultPlaylist.length) {
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-track-btn";
      deleteBtn.innerText = "✕";
      deleteBtn.title = "Remove Track";

      deleteBtn.addEventListener("click", function(e) {
        e.stopPropagation(); // dont play tracks once deleted
        removeTrack(index);
      });

      li.appendChild(deleteBtn);
    }

    listEl.appendChild(li);
  });
}

// rmv track
function removeTrack(index) {
  const customIndex = index - defaultPlaylist.length;

  if (customIndex >= 0 && customIndex < customPlaylist.length) {

    if (customPlaylist[customIndex].url.startsWith("blob:")) {
      URL.revokeObjectURL(customPlaylist[customIndex].url);
    }

    customPlaylist.splice(customIndex, 1);

    if (currentTrackIndex === index) {
      const audio = document.getElementById("audioPlayer");
      if (audio) {
        audio.pause();
        audio.src = "";
      }
      currentTrackIndex = 0;
    } else if (currentTrackIndex > index) {
      currentTrackIndex--;
    }

    renderPlaylist();
  }
}

function playTrack(index) {
  const allTracks = getAllTracks();
  if (!allTracks || allTracks.length === 0) return;

  if (index >= allTracks.length) index = 0;
  if (index < 0) index = allTracks.length - 1;

  currentTrackIndex = index;
  const track = allTracks[currentTrackIndex];

  const audio = document.getElementById("audioPlayer");
  const titleEl = document.getElementById("trackTitle");
  const artistEl = document.getElementById("trackArtist");
  const playBtn = document.getElementById("playBtn");

  if (!audio) return;

  if (titleEl) titleEl.innerText = track.title;
  if (artistEl) artistEl.innerText = track.artist;

  audio.src = track.url;
  audio.load(); // reset

  let playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      if (playBtn) playBtn.innerText = "⏸";
    }).catch(error => {
      console.log("Playback error or browser autoplay policy:", error);
      if (playBtn) playBtn.innerText = "▶";
    });
  }

  renderPlaylist();
}

// play/pause
function togglePlay() {
  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");
  const allTracks = getAllTracks();

  if (!audio || allTracks.length === 0) return;

  if (!audio.src || audio.src === "" || audio.src === window.location.href) {
    playTrack(0);
    return;
  }

  if (audio.paused) {
    audio.play();
    if (playBtn) playBtn.innerText = "⏸";
  } else {
    audio.pause();
    if (playBtn) playBtn.innerText = "▶";
  }
}

function nextTrack() {
  const allTracks = getAllTracks();
  if (allTracks.length === 0) return;
  
  let next = currentTrackIndex + 1;
  if (next >= allTracks.length) {
    next = 0; // loop back to the start of the playlist
  }
  playTrack(next);
}

function prevTrack() {
  const allTracks = getAllTracks();
  if (allTracks.length === 0) return;

  let prev = currentTrackIndex - 1;
  if (prev < 0) {
    prev = allTracks.length - 1;
  }
  playTrack(prev);
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // create url for new track
  const blobUrl = URL.createObjectURL(file);

  const newTrack = {
    title: file.name.replace(/\.[^/.]+$/, ""),
    artist: "Local Upload",
    url: blobUrl
  };

  customPlaylist.push(newTrack);

  // no re-upload
  event.target.value = "";

  // play new track
  const totalTracks = getAllTracks().length;
  playTrack(totalTracks - 1);
}

function openMusicApp() {
  const musicWin = document.getElementById("musicWindow");
  if (musicWin) {
    musicWin.style.display = "flex";
    if (typeof bringToFront === "function") bringToFront(musicWin);
    renderPlaylist();
  }
}

function closeMusicApp() {
  const musicWin = document.getElementById("musicWindow");
  if (musicWin) {
    musicWin.style.display = "none";
  }
}


window.addEventListener("DOMContentLoaded", function () {
  const audio = document.getElementById("audioPlayer");

  // loop play
  if (audio) {
    audio.addEventListener("ended", function () {
      nextTrack();
    });
  }

  // drag
  const musicWin = document.getElementById("musicWindow");
  if (musicWin && typeof drag === "function") {
    drag(musicWin);
  }
});


const iconThemes = {
  a: {
    music: "https://i.pinimg.com/736x/cf/1c/ea/cf1ceaa9cce3e2e4503bf991d3f797ee.jpg",
    notes: "pics/notes.png"
  },
  b: {
    music: "pics/hey.jpg",
    notes: "pics/nt.jpg"
  },
  c: {
    music: "pics/yeahh.jpg",
    notes: "pics/yuppi.jpg"
  }
};

function changeAppIcons(themeName) {
  const selectedTheme = iconThemes[themeName];
  if (!selectedTheme) return;

  // 2nd image inside to skip the little spider
  const musicImg = document.querySelector("#musicAppIcon img:not(.pixel-spider)");
  const notesImg = document.querySelector("#notesAppIcon img:not(.pixel-spider)");

  if (musicImg) musicImg.src = selectedTheme.music;
  if (notesImg) notesImg.src = selectedTheme.notes;

  // save to selection to local
  localStorage.setItem("spidey_icon_theme", themeName);
}

// restore
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("spidey_icon_theme") || "a";
  changeAppIcons(savedTheme);
});