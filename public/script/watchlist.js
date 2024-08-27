import * as op from "./server_ops.js";

const username = sessionStorage.getItem("username");
if (username == null) location.replace("login.html");

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "[TMDB_API_KEY]",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("user-button").innerHTML = username;

  const logoutButton = document.getElementById("logout");
  logoutButton.onclick = () => {
    sessionStorage.removeItem("username");
  };

  const movieWrapper = document.getElementById("movie-wrapper");
  const seriesWrapper = document.getElementById("series-wrapper");

  getWatchlist(username, movieWrapper, seriesWrapper);

  document.getElementById("sort-button").onclick = allowDrag;
});

async function getWatchlist(user, wrapper1, wrapper2) {
  const data = await fetch("/get-watchlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: user }), // Sending as an object
  });

  if (!data.ok) {
    throw new Error("Network response was not ok");
  }

  const saved = await data.json();

  for (const id of saved.movies) {
    const movieInfo = await fetch(`https://api.themoviedb.org/3/movie/${id}`, options).then((res) =>
      res.json()
    );
    const posterImage = document.createElement("img");
    const movieTitle = document.createElement("p");
    posterImage.src = "http://image.tmdb.org/t/p/w500/" + movieInfo.poster_path;
    posterImage.alt = movieTitle.innerHTML = movieInfo.title;

    createGrid(user, posterImage, movieTitle, id, "movie", wrapper1);
  }

  for (const id of saved.series) {
    const seriesInfo = await fetch(`https://api.themoviedb.org/3/tv/${id}`, options).then((res) =>
      res.json()
    );
    const posterImage = document.createElement("img");
    const seriesTitle = document.createElement("p");
    posterImage.src = "http://image.tmdb.org/t/p/w500/" + seriesInfo.poster_path;
    posterImage.alt = seriesTitle.innerHTML = seriesInfo.name;

    createGrid(user, posterImage, seriesTitle, id, "series", wrapper2);
  }
}

function createGrid(user, poster, title, id, type, wrapper) {
  const gridCell = document.createElement("div");
  gridCell.className = "grid-cell";

  const displayTile = document.createElement("div");
  displayTile.className = "displayTile";

  // Save this data on the grid cell for future reference
  gridCell.dataset.id = id;
  gridCell.dataset.type = type;

  displayTile.appendChild(poster);
  gridCell.appendChild(displayTile);
  gridCell.appendChild(title);

  wrapper.appendChild(gridCell);

  createButtons(user, displayTile, id, type);
}

function createButtons(user, tile, id, type) {
  const likeButton = document.createElement("button");
  const saveButton = document.createElement("button");

  likeButton.className = "like-button";
  saveButton.className = "save-button";

  // Add buttons to each displayTile
  tile.appendChild(likeButton);
  tile.appendChild(saveButton);

  // const displayTile = likeButton.parentNode;
  const mediaID = parseInt(id);
  const mediaType = type;

  op.mediaStatus(user, mediaID).then((res) => {
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
        op.likeMedia(user, mediaID, mediaType);
      } else {
        likeButton.innerHTML = '<i class="fa-regular fa-heart" style="color: #d93636;"></i>';
        op.unlikeMedia(user, mediaID, mediaType);
      }
    };
    saveButton.onclick = () => {
      saved = !saved;
      if (saved) {
        saveButton.innerHTML = '<i class="fa-solid fa-bookmark" style="color: #e2b922;"></i>';
        op.saveMedia(user, mediaID, mediaType);
      } else {
        saveButton.innerHTML = '<i class="fa-regular fa-bookmark" style="color: #e2b922;"></i>';
        op.unsaveMedia(user, mediaID, mediaType);
      }
    };
  });
}

function allowDrag() {
  if (this.dataset.state === "normal") {
    // Make the sorting mode visually clear
    this.innerHTML =
      '<ion-icon name="move-sharp" style="padding-left: 5px; padding-right: 10px;"></ion-icon>Sorting';
    this.style.filter = "invert(100%)";
    // Define grid cell behaviour during a drag operation
    document.querySelectorAll(".grid-cell").forEach((gridCell) => {
      gridCell.draggable = true;
      gridCell.style.opacity = 0.75;
      gridCell.childNodes.forEach((child) => (child.style.pointerEvents = "none"));
      gridCell.style.cursor = "move";

      gridCell.addEventListener("dragstart", () => {
        gridCell.style.opacity = 0.5;
        gridCell.classList.add("dragging");
      });

      gridCell.addEventListener("dragend", () => {
        gridCell.style.opacity = 0.75;
        gridCell.classList.remove("dragging");
        updateBackendOrder(gridCell.dataset.type, gridCell.dataset.id, gridCell.dataset.afterID);
      });
    });

    document.querySelectorAll("#grid-container > div").forEach((wrapper) => {
      wrapper.addEventListener("dragover", (e) => {
        const dragging = document.querySelector(".dragging");
        if (wrapper === dragging.parentNode) {
          e.preventDefault();
          const afterElement = getDragAfterElement(dragging.parentNode, e.clientX, e.clientY);
          if (afterElement == null) {
            wrapper.appendChild(dragging);
            dragging.dataset.afterID = null;
          } else {
            wrapper.insertBefore(dragging, afterElement.element);
            dragging.dataset.afterID = afterElement.id == undefined ? null : afterElement.id;
          }
        }
      });
    });

    const actionButtons = document.querySelectorAll(".like-button, .save-button");
    actionButtons.forEach((button) => (button.style.visibility = "hidden"));
    this.dataset.state = "sorting"; // update the state of the sort button
  } else {
    this.innerHTML =
      '<ion-icon name="move-sharp" style="padding-left: 5px; padding-right: 10px;"></ion-icon>Sort';
    this.style.removeProperty("filter");
    document.querySelectorAll(".grid-cell").forEach((gridCell) => {
      gridCell.draggable = false; // event listeners don't need to be removed as they won't work now
      gridCell.style.opacity = 1;
      gridCell.childNodes.forEach((child) => child.style.removeProperty("pointer-events"));
      gridCell.style.cursor = "default";
    });

    const actionButtons = document.querySelectorAll(".like-button, .save-button");
    actionButtons.forEach((button) => button.style.removeProperty("visibility"));
    this.dataset.state = "normal";
  }
}

function getDragAfterElement(container, mouseX, mouseY) {
  const elements = [...container.querySelectorAll(".grid-cell:not(.dragging)")];

  return elements.reduce(
    (closest, current) => {
      const box = current.getBoundingClientRect();

      // Pythagoras: offset = sqrt(xOffset^2 + yOffset^2)
      const xOffset = mouseX - (box.left + box.width / 2);
      const yOffset = mouseY - (box.top + box.height / 2);
      const offset = Math.floor(Math.sqrt(Math.pow(xOffset, 2) + Math.pow(yOffset, 2)));

      if (xOffset < 0 && yOffset < 0 && -offset > closest.offset) {
        return { offset: offset, element: current, id: current.dataset.id };
      } else {
        return closest;
      }
    },
    // Define an initial value for "closest"
    { offset: Number.NEGATIVE_INFINITY }
  );
}

async function updateBackendOrder(type, id, afterID) {
  fetch("/change-sort-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      mediaType: type,
      id: parseInt(id),
      afterID: parseInt(afterID),
      category: "saved",
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (!res.ok) {
        console.log(res);
        throw new Error(res.message || "Error updating the order");
      }
    });
}
