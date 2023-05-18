// TMDB movies search (1.0)
// https://github.com/risolvipro/collections/sources/

app.api.tmdb.api_key = "YOUR API KEY";
app.api.tmdb.language = "en-US";

let results = app.api.tmdb.searchMovies(app.query);
app.result(results);