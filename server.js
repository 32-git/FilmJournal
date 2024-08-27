const express = require("express");
const app = express();
const fs = require("fs");

app.use(express.json());

const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));

app.use(express.static(__dirname + "/public"));

app.get("/get-data", (req, res) => {
  res.send(data);
});

app.post("/get-user", (req, res) => {
  const { username } = req.body;
  if (Object.keys(data).includes(username)) {
    res.send(JSON.stringify(data[username]));
  } else {
    return res.status(404).send({ message: "This user does not exist" });
  }
});

app.post("/add-user", (req, res) => {
  const { username, password } = req.body;

  if (Object.keys(data).includes(username)) {
    return res.status(400).send({ message: "Username already exists" });
  } else {
    data[username] = {
      "password": password,
      "liked": {
        "movies": [],
        "series": [],
      },
      "saved": {
        "movies": [],
        "series": [],
      },
    };

    try {
      fs.writeFileSync("./data.json", JSON.stringify(data, null, 2), "utf-8");
      res.send(`Welcome to FilmJournal, ${username}!`);
    } catch (err) {
      return res.status(500);
    }
  }
});

app.post("/get-favourites", (req, res) => {
  const { username } = req.body;
  res.send(data[username].liked);
});

app.post("/get-watchlist", (req, res) => {
  const { username } = req.body;
  res.send(data[username].saved);
});

app.post("/like-media", (req, res) => {
  const [username, movieID, mediaType] = req.body;
  const type = mediaType === "movie" ? "movies" : "series";
  const userData = data[username];

  userData.liked[type].push(movieID);

  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2), "utf-8", (err) => {
    if (err) throw err;
  });
  res.sendStatus(200, "Movie has been liked.");
});

app.post("/save-media", (req, res) => {
  const [username, id, mediaType] = req.body;
  const type = mediaType === "movie" ? "movies" : "series";
  const userData = data[username];

  userData.saved[type].push(id);

  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2), "utf-8", (err) => {
    if (err) throw err;
  });
  res.send("Media has been saved.");
});

app.post("/unlike-media", (req, res) => {
  const [username, id, mediaType] = req.body;
  const type = mediaType === "movie" ? "movies" : "series";
  const userData = data[username];

  userData.liked[type] = userData.liked[type].filter((item) => item !== id);
  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2), "utf-8", (err) => {
    if (err) throw err;
  });
  res.send("Media has been unliked.");
});

app.post("/unsave-media", (req, res) => {
  let [username, id, mediaType] = req.body;
  const type = mediaType === "movie" ? "movies" : "series";
  const userData = data[username];

  userData.saved[type] = userData.saved[type].filter((item) => item !== id);
  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2), "utf-8", (err) => {
    if (err) throw err;
  });
  res.send("Media has been unsaved.");
});

app.post("/change-sort-order", (req, res) => {
  const { username, mediaType, id, afterID, category } = req.body;
  const type = mediaType == "movie" ? "movies" : "series";
  const userData = data[username];

  // Get the array of the relevant list (liked/saved media)
  let relevantMedia = userData[category][type];
  relevantMedia = relevantMedia.filter((item) => item !== id); // remove the ID first
  if (afterID == null) {
    relevantMedia.push(id);
  } else {
    relevantMedia.splice(relevantMedia.indexOf(afterID), 0, id);
  }

  userData[category][type] = relevantMedia;

  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2), "utf-8", (err) => {
    if (err) throw err;
  });

  return res.send({ message: `idk` });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.use((req, res) => {
  res.status(404);
  res.send(`<h1>Error 404: Resource not found<h1>`);
});
