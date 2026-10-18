const tracks = [
  { file: "Char Baj Gaye Full Video - F.A.L.T.UJackky BhagnaniHard KaurRemo D'SouzaSachin-Jigar.mp3", title: "Char Baj Gaye", artist: "Hard Kaur · Sachin–Jigar", album: "F.A.L.T.U", tone: "coral" },
  { file: "Deva Shree Ganesha- Official 4K Video  Agneepath  Priyanka Chopra  Hrithik Roshan  Ganpati Song.mp3", title: "Deva Shree Ganesha", artist: "Ajay–Atul", album: "Agneepath", tone: "gold" },
  { file: "Full Song_ Pehla Pyaar  Kabir Singh  Shahid Kapoor, Kiara Advani  Armaan Malik  Vishal Mishra.mp3", title: "Pehla Pyaar", artist: "Armaan Malik", album: "Kabir Singh", tone: "rose" },
  { file: "I Am The Best  Phir Bhi Dil Hai Hindustani  Shah Rukh Khan.mp3", title: "I Am The Best", artist: "Abhijeet", album: "Phir Bhi Dil Hai Hindustani", tone: "violet" },
  { file: "Ik_Vaari_Aa_Lyrics_Raabta_Sushant_Singh_Rajput_Kriti_Sa_y2HsyzUulDI_140.mp3", title: "Ik Vaari Aa", artist: "Arijit Singh", album: "Raabta", tone: "blue" },
  { file: "Itni_Si_Baat_Hain_Full_Lyric_Video_Song_AZHAR_Emraan_Ha_z1Y8Ds7R_rU_140.mp3", title: "Itni Si Baat Hain", artist: "Arijit Singh · Antara Mitra", album: "Azhar", tone: "mint" },
  { file: "Jo Bhi Kasmein Khai Thi Humne - Raaz  Bipasha Basu & Dino Morea  Alka Yagnik & Udit Narayan.mp3", title: "Jo Bhi Kasmein", artist: "Alka Yagnik · Udit Narayan", album: "Raaz", tone: "plum" },
  { file: "Paisa Hai Toh - Farzi Sachin-Jigar, Vishal Dadlani, MellowD Shahid Kapoor.mp3", title: "Paisa Hai Toh", artist: "Sachin–Jigar · Vishal Dadlani", album: "Farzi", tone: "lime" },
  { file: "Qaafirana  Kedarnath  Sushant Rajput  Sara Ali Khan  Arijit Singh & Nikhita  Amit Trivedi.mp3", title: "Qaafirana", artist: "Arijit Singh · Nikhita Gandhi", album: "Kedarnath", tone: "sky" },
  { file: "Radha Nachegi - Saudagar 128 Kbps.mp3", title: "Radha Nachegi", artist: "Alka Yagnik", album: "Saudagar", tone: "rose" },
  { file: "Same Beef - Bohemia, Sidhu Moose Wala.m4a", title: "Same Beef", artist: "Bohemia · Sidhu Moose Wala", album: "Same Beef", tone: "indigo" },
  { file: "Teri Yaadon Mein Lyrical Video  The Killer  K K, Shreya Ghosal  Emraan Hashmi, Nisha Kothari.mp3", title: "Teri Yaadon Mein", artist: "KK · Shreya Ghoshal", album: "The Killer", tone: "teal" },
  { file: "THEME SONG  SCAM 1992 - The Harshad Mehta Story  SonyLIV Originals (1).mp3", title: "Scam 1992 Theme", artist: "Achint Thakkar", album: "Scam 1992", tone: "gold" },
  { file: "Tuch Maajhi Aai Devaa.mp3", title: "Tuch Maajhi Aai Devaa", artist: "Marathi devotional", album: "Tuch Maajhi Aai Devaa", tone: "coral" },
  { file: "Vishal Dadlani - Brothers Anthem  Akshay Kumar, Sidharth Malhotra  Ajay-Atul (1).mp3", title: "Brothers Anthem", artist: "Vishal Dadlani", album: "Brothers", tone: "blue" },
  { file: "Zara Sa  4K Music Video  Jannat  Emraan Hashmi  Sonal Chauhan  KK  Pritam  Sayeed Quadri.mp3", title: "Zara Sa", artist: "KK · Pritam", album: "Jannat", tone: "violet" },
];

const audio = document.querySelector("#audio");
const search = document.querySelector("#search");
const pageSearch = document.querySelector("#search-page-input");
const playlistDialog = document.querySelector("#playlist-dialog");
const statusMessage = document.querySelector("#status-message");
const validFiles = new Set(tracks.map((track) => track.file));
const loadStored = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};
const saveStored = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { showStatus("Your browser could not save this change."); }
};

let currentTrack = null;
let currentView = ["home", "search", "library"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "home";
let homeFilter = "all";
let libraryFilter = "all";
let selectedPlaylistId = null;
let shuffleEnabled = false;
let repeatEnabled = false;
let statusTimer;
let playRequest = 0;
let fetchController = null;
let currentObjectUrl = null;
const storedLikes = loadStored("likedTracks", []);
const storedRecents = loadStored("recentTracks", []);
const storedPlaylists = loadStored("soundwavePlaylists", []);
let likedTracks = new Set((Array.isArray(storedLikes) ? storedLikes : []).filter((file) => validFiles.has(file)));
let recentTracks = (Array.isArray(storedRecents) ? storedRecents : []).filter((file) => validFiles.has(file)).slice(0, 16);
let playlists = (Array.isArray(storedPlaylists) ? storedPlaylists : []).filter((playlist) =>
  playlist && typeof playlist.id === "string" && typeof playlist.name === "string",
).map((playlist) => ({
  id: playlist.id,
  name: playlist.name.slice(0, 48),
  description: typeof playlist.description === "string" ? playlist.description.slice(0, 140) : "",
  trackFiles: Array.isArray(playlist.trackFiles) ? playlist.trackFiles.filter((file) => validFiles.has(file)) : [],
}));

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function showStatus(message) {
  statusMessage.textContent = message;
  statusMessage.hidden = false;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { statusMessage.hidden = true; }, 5000);
}

function artworkPath(track) {
  return `covers/track-${String(tracks.indexOf(track) + 1).padStart(2, "0")}.jpg`;
}

function coverMarkup(track, className) {
  const artwork = artworkPath(track);
  return `<div class="cover-art ${className} has-image" data-tone="${track.tone}" aria-hidden="true"><img class="cover-image" src="${artwork}" alt="" loading="lazy" decoding="async"><span class="cover-symbol">♪</span></div>`;
}
  document.addEventListener("error", (event) => {
    if (!event.target.matches(".cover-image")) return;
    event.target.closest(".cover-art").classList.remove("has-image");
    event.target.remove();
  }, true);

function trackRowMarkup(track) {
  const index = tracks.indexOf(track);
  const liked = likedTracks.has(track.file);
  return `<div class="track-row ${currentTrack === track ? "is-playing" : ""}">
    <button class="track-main" type="button" data-play="${index}" aria-label="Play ${escapeHTML(track.title)}">
      ${coverMarkup(track, "track-cover")}<span class="track-copy"><span class="track-title">${escapeHTML(track.title)}</span><span class="track-artist">${escapeHTML(track.artist)} · ${escapeHTML(track.album)}</span></span>
    </button><button class="favorite-toggle ${liked ? "is-liked" : ""}" type="button" data-favorite="${index}" aria-label="${liked ? "Remove from" : "Add to"} liked songs" aria-pressed="${liked}">${liked ? "♥" : "♡"}</button>
  </div>`;
}

function matchesQuery(track, query) {
  const normalized = query.trim().toLowerCase();
  return !normalized || `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(normalized);
}

function renderHome() {
  const podcastMode = homeFilter === "podcasts";
  const homeTracks = podcastMode ? [] : tracks;
  document.querySelector("#quick-grid").innerHTML = homeTracks.slice(0, 8).map((track) => `
    <button class="quick-tile" type="button" data-play="${tracks.indexOf(track)}" aria-label="Play ${escapeHTML(track.title)}">
      ${coverMarkup(track, "quick-cover")}<span class="quick-title">${escapeHTML(track.title)}</span><span class="tile-play" aria-hidden="true">▶</span>
    </button>`).join("");
  document.querySelector("#album-rail").innerHTML = homeTracks.map((track) => `
    <button class="album-card" type="button" data-play="${tracks.indexOf(track)}" aria-label="Play ${escapeHTML(track.album)}">
      ${coverMarkup(track, "album-cover")}<span class="album-title">${escapeHTML(track.album)}</span><span class="album-artist">${escapeHTML(track.artist)} · ${escapeHTML(track.title)}</span>
    </button>`).join("");
  document.querySelector("#track-grid").innerHTML = homeTracks.slice(0, 9).map(trackRowMarkup).join("");
  const recent = recentTracks.map((file) => tracks.find((track) => track.file === file)).filter(Boolean);
  document.querySelector("#recent-rail").innerHTML = (recent.length ? recent : homeTracks.slice(0, 6)).map((track) => `
    <button class="album-card" type="button" data-play="${tracks.indexOf(track)}" aria-label="Play ${escapeHTML(track.title)}">
      ${coverMarkup(track, "album-cover")}<span class="album-title">${escapeHTML(track.title)}</span><span class="album-artist">${escapeHTML(track.artist)}</span>
    </button>`).join("");
  document.querySelector("#home-view").hidden = podcastMode;
  const emptyState = document.querySelector("#empty-state");
  emptyState.hidden = !podcastMode;
  emptyState.querySelector("h2").textContent = podcastMode ? "No podcasts yet" : "";
  emptyState.querySelector("p").textContent = podcastMode ? "Your music library is ready whenever you are." : "";
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const active = button.dataset.filter === homeFilter;
    button.classList.toggle("is-selected", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderSearch() {
  const query = pageSearch.value || search.value;
  const results = tracks.filter((track) => matchesQuery(track, query));
  document.querySelector("#search-results").innerHTML = results.map(trackRowMarkup).join("");
  document.querySelector("#search-results-heading").textContent = query.trim() ? `Results for “${query.trim()}”` : "Your music";
  document.querySelector("#search-empty").hidden = results.length > 0;
}

function renderPlaylists() {
  document.querySelector("#playlist-cards").innerHTML = playlists.map((playlist) => `
    <article class="playlist-card">
      <button class="playlist-open" type="button" data-playlist-open="${escapeHTML(playlist.id)}" aria-label="Open playlist ${escapeHTML(playlist.name)}">
        <span class="playlist-art" aria-hidden="true">♫</span><span class="playlist-card-copy"><span class="playlist-card-name">${escapeHTML(playlist.name)}</span><span class="playlist-card-meta">${playlist.trackFiles.length} songs</span></span>
      </button>
      <div class="playlist-card-actions"><button type="button" data-playlist-edit="${escapeHTML(playlist.id)}">Edit</button><button type="button" data-playlist-delete="${escapeHTML(playlist.id)}">Delete</button></div>
    </article>`).join("");
  document.querySelector("#sidebar-playlists").innerHTML = playlists.map((playlist) => `
    <a class="nav-link sidebar-playlist" href="#library" data-playlist-open="${escapeHTML(playlist.id)}"><span class="nav-icon" aria-hidden="true">♫</span><span class="playlist-name">${escapeHTML(playlist.name)}</span></a>`).join("");
}

function renderLibrary() {
  const selectedPlaylist = playlists.find((playlist) => playlist.id === selectedPlaylistId);
  const detail = document.querySelector("#playlist-detail");
  detail.hidden = !selectedPlaylist;
  document.querySelector("#playlist-cards").hidden = Boolean(selectedPlaylist) || !["all", "playlists"].includes(libraryFilter);
  document.querySelector("#library-tracks").hidden = Boolean(selectedPlaylist) || libraryFilter === "playlists";
  document.querySelectorAll("[data-library-tab]").forEach((button) => {
    const active = button.dataset.libraryTab === libraryFilter;
    button.classList.toggle("is-selected", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const librarySongs = selectedPlaylist
    ? selectedPlaylist.trackFiles.map((file) => tracks.find((track) => track.file === file)).filter(Boolean)
    : libraryFilter === "liked" ? tracks.filter((track) => likedTracks.has(track.file))
      : libraryFilter === "recent" ? recentTracks.map((file) => tracks.find((track) => track.file === file)).filter(Boolean)
        : libraryFilter === "playlists" ? [] : tracks;
  document.querySelector("#library-tracks").innerHTML = librarySongs.map(trackRowMarkup).join("");
  document.querySelector("#playlist-tracks").innerHTML = librarySongs.map(trackRowMarkup).join("");
  const empty = selectedPlaylist ? librarySongs.length === 0
    : libraryFilter === "playlists" ? playlists.length === 0
      : ["liked", "recent"].includes(libraryFilter) && librarySongs.length === 0;
  document.querySelector("#library-empty").hidden = !empty;
  document.querySelector("#library-empty-heading").textContent = selectedPlaylist ? "This playlist is empty" : libraryFilter === "playlists" ? "No playlists yet" : libraryFilter === "liked" ? "No liked songs yet" : "Nothing played yet";
  document.querySelector("#library-empty-copy").textContent = selectedPlaylist ? "Edit this playlist to add songs." : libraryFilter === "playlists" ? "Create a playlist and add songs from your library." : libraryFilter === "liked" ? "Tap the heart on any song to save it here." : "Play a song and it will show up here.";

  if (selectedPlaylist) {
    document.querySelector("#playlist-detail-name").textContent = selectedPlaylist.name;
    document.querySelector("#playlist-detail-description").textContent = selectedPlaylist.description || `${selectedPlaylist.trackFiles.length} songs`;
  }
}

function render() {
  renderHome();
  renderSearch();
  renderPlaylists();
  renderLibrary();
  document.querySelectorAll(".view-panel").forEach((panel) => { panel.hidden = panel.id !== `${currentView}-view`; });
  if (currentView === "home" && homeFilter === "podcasts") document.querySelector("#home-view").hidden = true;
  document.querySelector("#empty-state").hidden = currentView !== "home" || homeFilter !== "podcasts";
  document.querySelectorAll(".nav-link[data-view], .mobile-nav-link").forEach((link) => {
    const active = link.dataset.view === currentView;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-library-filter]").forEach((link) => {
    const active = currentView === "library" && libraryFilter === link.dataset.libraryFilter && !selectedPlaylistId;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.querySelectorAll(".sidebar-playlist").forEach((link) => {
    const active = currentView === "library" && selectedPlaylistId === link.dataset.playlistOpen;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function setView(view, updateHistory = true, focusSearch = false) {
  if (!["home", "search", "library"].includes(view)) view = "home";
  currentView = view;
  if (updateHistory && location.hash !== `#${view}`) history.pushState({ view }, "", `#${view}`);
  render();
  if (view === "search" && focusSearch) pageSearch.focus();
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function updateLikedButton() {
  const liked = currentTrack && likedTracks.has(currentTrack.file);
  const button = document.querySelector("#player-like");
  button.textContent = liked ? "♥" : "♡";
  button.classList.toggle("is-liked", Boolean(liked));
  button.setAttribute("aria-label", liked ? "Remove from liked songs" : "Add to liked songs");
  button.setAttribute("aria-pressed", String(Boolean(liked)));
}

async function playTrack(track) {
  if (!track) return;
  const request = ++playRequest;
  fetchController?.abort();
  fetchController = new AbortController();
  currentTrack = track;
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = null;
  const seek = document.querySelector("#seek");
  seek.value = "0";
  seek.style.setProperty("--progress", "0%");
  document.querySelector("#current-time").textContent = "0:00";
  document.querySelector("#total-time").textContent = "0:00";
  document.querySelector("#now-title").textContent = track.title;
  document.querySelector("#now-artist").textContent = track.artist;
  document.querySelector("#player-track-name").textContent = track.album;
  const playerCover = document.querySelector("#player-cover");
  playerCover.dataset.tone = track.tone;
  playerCover.classList.add("has-image");
  const playerImage = document.createElement("img");
  playerImage.className = "cover-image";
  playerImage.src = artworkPath(track);
  playerImage.alt = "";
  playerImage.decoding = "async";
  playerImage.loading = "eager";
  const playerSymbol = document.createElement("span");
  playerSymbol.className = "cover-symbol";
  playerSymbol.textContent = "♪";
  playerCover.replaceChildren(playerImage, playerSymbol);
  updateLikedButton();
  render();
  showStatus(`Loading “${track.title}”…`);
  try {
    const response = await fetch(`songs/${encodeURIComponent(track.file)}`, { signal: fetchController.signal });
    if (!response.ok) throw new Error(`Audio request failed (${response.status}).`);
    const audioBlob = await response.blob();
    if (request !== playRequest) return;
    currentObjectUrl = URL.createObjectURL(audioBlob);
    audio.src = currentObjectUrl;
    audio.load();
    await audio.play();
  } catch (error) {
    if (request === playRequest && error.name !== "AbortError") {
      const unsupported = error.name === "NotSupportedError";
      showStatus(unsupported ? "This audio format is not supported by your browser." : `Could not play “${track.title}”. Check that the file is available.`);
    }
  }
}

function playNext(direction = 1) {
  if (!currentTrack) return playTrack(tracks[0]);
  let nextIndex = tracks.indexOf(currentTrack) + direction;
  if (shuffleEnabled && direction > 0) nextIndex = Math.floor(Math.random() * tracks.length);
  if (nextIndex < 0) nextIndex = tracks.length - 1;
  if (nextIndex >= tracks.length) nextIndex = 0;
  playTrack(tracks[nextIndex]);
}

function savePlaylists() { saveStored("soundwavePlaylists", playlists); }

function openPlaylistDialog(playlist = null) {
  document.querySelector("#playlist-dialog-title").textContent = playlist ? "Edit playlist" : "Create playlist";
  document.querySelector("#playlist-id").value = playlist?.id || "";
  document.querySelector("#playlist-name").value = playlist?.name || "";
  document.querySelector("#playlist-description").value = playlist?.description || "";
  const selected = new Set(playlist?.trackFiles || []);
  document.querySelector("#playlist-track-options").innerHTML = `<div class="track-picker-list">${tracks.map((track, index) => `
    <label class="track-option"><input type="checkbox" name="playlist-track" value="${index}" ${selected.has(track.file) ? "checked" : ""}><span>${escapeHTML(track.title)} <span class="track-artist">· ${escapeHTML(track.artist)}</span></span></label>`).join("")}</div>`;
  playlistDialog.showModal();
  document.querySelector("#playlist-name").focus();
}

function startEditingPlaylist(id) {
  const playlist = playlists.find((item) => item.id === id);
  if (playlist) openPlaylistDialog(playlist);
}

function toggleFavorite(index) {
  const track = tracks[index];
  if (!track) return;
  if (likedTracks.has(track.file)) likedTracks.delete(track.file);
  else likedTracks.add(track.file);
  saveStored("likedTracks", [...likedTracks]);
  updateLikedButton();
  render();
}

document.addEventListener("click", (event) => {
  const favorite = event.target.closest("[data-favorite]");
  if (favorite) { toggleFavorite(Number(favorite.dataset.favorite)); return; }
  const playTarget = event.target.closest("[data-play]");
  if (playTarget) { playTrack(tracks[Number(playTarget.dataset.play)]); return; }
  const viewTarget = event.target.closest("[data-view]");
  if (viewTarget) { event.preventDefault(); setView(viewTarget.dataset.view, true, viewTarget.dataset.view === "search"); return; }
  const libraryFilterTarget = event.target.closest("[data-library-filter]");
  if (libraryFilterTarget) {
    event.preventDefault();
    libraryFilter = libraryFilterTarget.dataset.libraryFilter;
    selectedPlaylistId = null;
    setView("library");
    return;
  }
  const libraryTab = event.target.closest("[data-library-tab]");
  if (libraryTab) {
    libraryFilter = libraryTab.dataset.libraryTab;
    selectedPlaylistId = null;
    render();
    return;
  }
  const openPlaylist = event.target.closest("[data-playlist-open]");
  if (openPlaylist) {
    selectedPlaylistId = openPlaylist.dataset.playlistOpen;
    libraryFilter = "playlists";
    setView("library");
    return;
  }
  const editPlaylist = event.target.closest("[data-playlist-edit]");
  if (editPlaylist) { startEditingPlaylist(editPlaylist.dataset.playlistEdit); return; }
  const deletePlaylist = event.target.closest("[data-playlist-delete]");
  if (deletePlaylist) { removePlaylist(deletePlaylist.dataset.playlistDelete); return; }
  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) { homeFilter = filterButton.dataset.filter; render(); return; }
  if (event.target.closest("[data-action='create-playlist'], #create-playlist")) { openPlaylistDialog(); return; }
  if (event.target.closest("[data-action='show-all']")) {
    search.value = "";
    pageSearch.value = "";
    setView("search");
  }
});

function removePlaylist(id) {
  const playlist = playlists.find((item) => item.id === id);
  if (!playlist || !window.confirm(`Delete “${playlist.name}”?`)) return;
  playlists = playlists.filter((item) => item.id !== id);
  if (selectedPlaylistId === id) selectedPlaylistId = null;
  savePlaylists();
  render();
}

search.addEventListener("input", () => {
  pageSearch.value = search.value;
  setView("search", false);
});
pageSearch.addEventListener("input", () => {
  search.value = pageSearch.value;
  renderSearch();
});
document.querySelector("#playlist-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = document.querySelector("#playlist-id").value;
  const name = document.querySelector("#playlist-name").value.trim();
  const description = document.querySelector("#playlist-description").value.trim();
  const trackFiles = [...document.querySelectorAll("input[name='playlist-track']:checked")].map((input) => tracks[Number(input.value)].file);
  if (!name) return document.querySelector("#playlist-name").focus();
  if (id) {
    const playlist = playlists.find((item) => item.id === id);
    if (playlist) Object.assign(playlist, { name, description, trackFiles });
  } else {
    const newId = globalThis.crypto?.randomUUID?.() || `playlist-${Date.now()}`;
    playlists.unshift({ id: newId, name, description, trackFiles });
    selectedPlaylistId = newId;
    libraryFilter = "playlists";
    setView("library");
  }
  savePlaylists();
  playlistDialog.close();
  render();
});
document.querySelector("#cancel-playlist").addEventListener("click", () => playlistDialog.close());
document.querySelector(".dialog-close").addEventListener("click", () => playlistDialog.close());
document.querySelector("#edit-playlist").addEventListener("click", () => startEditingPlaylist(selectedPlaylistId));
document.querySelector("#delete-playlist").addEventListener("click", () => removePlaylist(selectedPlaylistId));
document.querySelector("#play-playlist").addEventListener("click", () => {
  const playlist = playlists.find((item) => item.id === selectedPlaylistId);
  const firstTrack = tracks.find((track) => track.file === playlist?.trackFiles[0]);
  if (firstTrack) playTrack(firstTrack);
  else showStatus("Add a song to this playlist before playing it.");
});

document.querySelector("#brand").addEventListener("click", (event) => { event.preventDefault(); setView("home"); });
document.querySelector("#play-pause").addEventListener("click", () => {
  if (!currentTrack) return playTrack(tracks[0]);
  if (audio.paused) audio.play().catch(() => showStatus(`Could not play “${currentTrack.title}”. Check the file format or try another song.`));
  else audio.pause();
});
document.querySelector("#previous").addEventListener("click", () => playNext(-1));
document.querySelector("#next").addEventListener("click", () => playNext(1));
document.querySelector("#shuffle").addEventListener("click", (event) => {
  shuffleEnabled = !shuffleEnabled;
  event.currentTarget.classList.toggle("is-active", shuffleEnabled);
  event.currentTarget.setAttribute("aria-pressed", String(shuffleEnabled));
});
document.querySelector("#repeat").addEventListener("click", (event) => {
  repeatEnabled = !repeatEnabled;
  audio.loop = repeatEnabled;
  event.currentTarget.classList.toggle("is-active", repeatEnabled);
  event.currentTarget.setAttribute("aria-pressed", String(repeatEnabled));
});
document.querySelector("#player-like").addEventListener("click", () => {
  if (currentTrack) toggleFavorite(tracks.indexOf(currentTrack));
});
document.querySelector("#seek").addEventListener("input", (event) => {
  if (Number.isFinite(audio.duration)) audio.currentTime = (Number(event.target.value) / 1000) * audio.duration;
});
document.querySelector("#volume").addEventListener("input", (event) => { audio.volume = Number(event.target.value); });
audio.volume = Number(document.querySelector("#volume").value);
audio.addEventListener("loadedmetadata", () => { document.querySelector("#total-time").textContent = formatTime(audio.duration); });
audio.addEventListener("timeupdate", () => {
  const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  const seek = document.querySelector("#seek");
  seek.value = String(progress * 10);
  seek.style.setProperty("--progress", `${progress}%`);
  document.querySelector("#current-time").textContent = formatTime(audio.currentTime);
});
audio.addEventListener("error", () => {
  const reason = audio.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
    ? "This audio format is not supported by your browser."
    : "The audio file could not be loaded.";
  if (currentTrack) showStatus(`${reason} Try another song.`);
});
audio.addEventListener("ended", () => { if (!repeatEnabled) playNext(1); });
audio.addEventListener("playing", () => {
  if (!currentTrack) return;
  recentTracks = [currentTrack.file, ...recentTracks.filter((file) => file !== currentTrack.file)].slice(0, 16);
  saveStored("recentTracks", recentTracks);
  render();
  statusMessage.hidden = true;
});
audio.addEventListener("play", () => {
  document.querySelector("#play-pause").textContent = "Ⅱ";
  document.querySelector("#play-pause").setAttribute("aria-label", "Pause");
});
audio.addEventListener("pause", () => {
  document.querySelector("#play-pause").textContent = "▶";
  document.querySelector("#play-pause").setAttribute("aria-label", "Play");
});
window.addEventListener("popstate", () => setView(location.hash.slice(1), false));

search.value = "";
pageSearch.value = "";
updateLikedButton();
render();