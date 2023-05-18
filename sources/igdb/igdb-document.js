// IGDB document (1.0)
// https://github.com/risolvipro/collections

app.api.igdb.client_id = "YOUR CLIENT ID";
app.api.igdb.client_secret = "YOUR CLIENT SECRET";

let game = app.api.igdb.getGame(app.params.id);

if(game == undefined) {
    app.fail();
}

let builder = app.document.builder();

builder.setString(game.name, "name");
builder.setImage(game.requestCover(), "cover");
builder.setDate(game.firstReleaseDate, "release-date");
builder.setListItems(game.platforms, "platforms");
builder.setListItems(game.genres, "genre");

app.result(builder);