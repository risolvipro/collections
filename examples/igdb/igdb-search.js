/**
 * Collections Database default IGDB search
 */

app.api.igdb.client_id = app.config.CLIENT_ID;
app.api.igdb.client_secret = app.config.CLIENT_SECRET;

let results = app.library.search(app.query);
app.result(results);
