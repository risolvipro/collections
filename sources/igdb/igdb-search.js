// IGDB search (1.0)
// https://github.com/risolvipro/collections

app.api.igdb.client_id = "YOUR CLIENT ID";
app.api.igdb.client_secret = "YOUR CLIENT SECRET";

let results = app.api.igdb.search(app.query);
app.result(results);