import * as op from "./server_ops.js";

const searchBar = document.getElementById("search");
const gridContainer = document.getElementById("grid-container");

const username = sessionStorage.getItem("username");
if (username == null) location.replace("login.html");
document.getElementById("user-button").innerHTML = username;

const logoutButton = document.getElementById("logout");
logoutButton.onclick = () => {
  sessionStorage.removeItem("username");
};

const header = document.querySelector("h2");
const returnButton = document.getElementById("return");
const filterButtons = document.getElementById("filter");

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "[TMDB_API_KEY]",
  },
};

const noFilterButton = document.querySelector("button");

filterButtons.childNodes.forEach((btn) => {
  btn.onclick = () => {
    const currentActive = document.getElementById("active");
    if (btn != currentActive) {
      currentActive.id = "";
      btn.id = "active";
      filter(String(btn.innerHTML));
    }
  };
});

returnButton.onclick = () => {
  gridContainer.innerHTML = "";
  searchBar.value = "";
  filterButtons.style.visibility = "hidden";
  discover();
};
discover();
searchBar.onkeydown = (e) => {
  document.getElementById("active").id = "";
  noFilterButton.id = "active";
  if (e.keyCode == 13) search(encodeURIComponent(searchBar.value));
};

async function discover() {
  header.innerHTML = "Discover";
  returnButton.style.visibility = "hidden";

  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=false&language=en-US&page=1&sort_by=popularity.desc",
      options
    );
    const data = await response.json();

    data.results.forEach((elem) => {
      // grid cells --> movie title + display tile
      // display tile --> movie poster (+ action buttons)
      const posterLink = "http://image.tmdb.org/t/p/w500/" + elem.poster_path;
      const posterImage = document.createElement("img");
      posterImage.src = posterLink;
      posterImage.alt = elem.title;

      const movieTitle = document.createElement("p");
      movieTitle.innerHTML = elem.title;

      const mediaType = elem.name ? "series" : "movie";
      createGrid(posterImage, movieTitle, elem.id, mediaType);
      createButtons();
    });
  } catch (error) {
    console.error(error);
  }
}

async function search(term, filter = "multi") {
  if (searchBar.value.trim() != "") {
    header.innerHTML = `Results for "${searchBar.value}"`;
    returnButton.style.visibility = "visible";
    filterButtons.style.visibility = "visible";
    gridContainer.innerHTML = "";

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/${filter}?query=${term}&include_adult=false&page=1`,
        options
      );
      const data = await response.json();

      data.results.forEach((elem) => {
        if (elem.media_type != "person") {
          const posterImage = document.createElement("img");
          posterImage.src = elem.poster_path
            ? "http://image.tmdb.org/t/p/w500/" + elem.poster_path
            : "./img/no_image.jpg";

          const mediaTitle = document.createElement("p");
          mediaTitle.innerHTML = posterImage.alt =
            elem.media_type === "tv" || filter == "tv" ? elem.name : elem.title;
          const mediaType = elem.name ? "series" : "movie";

          createGrid(posterImage, mediaTitle, elem.id, mediaType);
          createButtons();
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
}

function filter(filterType) {
  const filterTerm = filterType == "Movies" ? "movie" : filterType == "Shows" ? "tv" : "multi";
  search(encodeURIComponent(searchBar.value), filterTerm);
}

const gridCells = document.getElementsByClassName("grid-cell");
const displayTiles = document.getElementsByClassName("displayTile");

function createGrid(poster, title, id, type) {
  const gridCell = document.createElement("div");
  gridCell.className = "grid-cell";

  const displayTile = document.createElement("div");
  displayTile.className = "displayTile";
  displayTile.dataset.id = id;
  displayTile.dataset.type = type;

  gridCell.appendChild(displayTile);
  gridContainer.appendChild(gridCell);

  for (let i = 0; i < displayTiles.length; i++) {
    displayTiles[i].appendChild(poster);
    gridCells[i].appendChild(title);
  }
}

function createButtons() {
  const likeButton = document.createElement("button");
  const saveButton = document.createElement("button");

  likeButton.className = "like-button";
  saveButton.className = "save-button";

  // Add buttons to each displayTile
  for (let i = 0; i < displayTiles.length; i++) {
    displayTiles[i].appendChild(likeButton);
    displayTiles[i].appendChild(saveButton);
  }

  const displayTile = likeButton.parentNode;
  const mediaID = parseInt(displayTile.dataset.id);
  const mediaType = displayTile.dataset.type;

  op.mediaStatus(username, mediaID).then((res) => {
    let [liked, saved] = res;

    likeButton.innerHTML = `<i class="fa-${
      liked ? "solid" : "regular"
    } fa-heart" style="color: #d93636;"></i>`;
    saveButton.innerHTML = `<i class="fa-${
      saved ? "solid" : "regular"
    } fa-bookmark" style="color: #e2b922;"></i>`;

    likeButton.onclick = () => {
      liked = !liked;
      if (liked) {
        likeButton.innerHTML = '<i class="fa-solid fa-heart" style="color: #d93636;"></i>';
        op.likeMedia(username, mediaID, mediaType);
      } else {
        likeButton.innerHTML = '<i class="fa-regular fa-heart" style="color: #d93636;"></i>';
        op.unlikeMedia(username, mediaID, mediaType);
      }
    };
    saveButton.onclick = () => {
      saved = !saved;
      if (saved) {
        saveButton.innerHTML = '<i class="fa-solid fa-bookmark" style="color: #e2b922;"></i>';
        op.saveMedia(username, mediaID, mediaType);
      } else {
        saveButton.innerHTML = '<i class="fa-regular fa-bookmark" style="color: #e2b922;"></i>';
        op.unsaveMedia(username, mediaID, mediaType);
      }
    };
  });
}
