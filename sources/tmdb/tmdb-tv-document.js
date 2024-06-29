// TMDB tv document (1.2)
// https://github.com/risolvipro/collections

app.api.tmdb.api_key = "YOUR API KEY";
app.api.tmdb.language = "en-US";

let tvShow = app.api.tmdb.getTV(app.params.id);

if(tvShow == undefined) {
    app.fail();
}

let builder = app.document.builder();

builder.setString(tvShow.name, "name");
builder.setImage(tvShow.requestPoster(), "poster");
builder.setString(tvShow.overview, "overview");
builder.setListItems(tvShow.genres, "genre");
builder.setDate(tvShow.firstAirDate, "air-date");
builder.setDocuments(tvShow.actors(10), "actors");
builder.setManagedDocuments(tvShow.seasons, "seasons");
builder.setString(tvShow.id, "tmdb-id");

app.result(builder);