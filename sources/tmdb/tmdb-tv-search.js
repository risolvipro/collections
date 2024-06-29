// TMDB tv search (1.2)
// https://github.com/risolvipro/collections

app.api.tmdb.api_key = "YOUR API KEY";
app.api.tmdb.language = "en-US";

let results = app.api.tmdb.searchTV(app.query);
app.result(results);