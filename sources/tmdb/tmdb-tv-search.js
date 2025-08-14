// TMDB tv search (1.3)
// https://github.com/risolvipro/collections

app.api.tmdb.api_key = app.config.API_KEY;
app.api.tmdb.language = app.config.LANGUAGE;

let results = app.api.tmdb.searchTV(app.query);
app.result(results);
