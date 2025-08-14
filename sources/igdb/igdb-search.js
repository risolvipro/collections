// IGDB search (1.2)
// https://github.com/risolvipro/collections

app.api.igdb.client_id = app.config.CLIENT_ID;
app.api.igdb.client_secret = app.config.CLIENT_SECRET;

let results = app.api.igdb.search(app.query);
app.result(results);
