// IGDB document (1.1)
// https://github.com/risolvipro/collections

app.api.igdb.client_id = "YOUR CLIENT ID";
app.api.igdb.client_secret = "YOUR CLIENT SECRET";

let game = app.api.igdb.getGame(app.params.id);

if(game == undefined) {
    app.fail();
}

let builder = app.document.builder();

builder.setString(game.name, "title");
builder.setImage(game.requestCover(), "cover");
builder.setListItems(game.platforms, "platform");
builder.setListItems(game.genres, "genre");
builder.setDate(game.firstReleaseDate, "release-date");
builder.setString(game.summary, "summary");

app.result(builder);