// Check whether a movie/series is liked or saved
export async function mediaStatus(user, id) {
  const response = await fetch("/get-data", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  const userData = data[user];

  // Check all liked/saved media for matches
  const likedMedia = userData.liked.movies.concat(userData.liked.series);
  const savedMedia = userData.saved.movies.concat(userData.saved.series);

  let liked = likedMedia.includes(id);
  let saved = savedMedia.includes(id);

  return [liked, saved];
}

// Like a medium and put it in your favourites
export function likeMedia(user, id, type) {
  fetch("/like-media", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([user, id, type]),
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => console.error(error));
}

// Save a medium and put it in your watchlist
export function saveMedia(user, id, type) {
  fetch("/save-media", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([user, id, type]),
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => console.error(error));
}

// Unlike a medium and remove it from your favourites
export function unlikeMedia(user, id, type) {
  fetch("/unlike-media", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([user, id, type]),
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => console.error(error));
}

// Unsave a medium and remove it from your watchlist
export function unsaveMedia(user, id, type) {
  fetch("/unsave-media", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([user, id, type]),
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => console.error(error));
}
