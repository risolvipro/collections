// Discogs search (1.0)
// https://github.com/risolvipro/collections

let results = app.api.discogs.search(app.query);
app.result(results);