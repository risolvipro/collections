// TMDB movies document (1.0)
// https://github.com/risolvipro/collections

app.api.tmdb.api_key = "YOUR API KEY";
app.api.tmdb.language = "en-US";

let movie = app.api.tmdb.getMovie(app.params.id);

if(movie == undefined) {
    app.fail();
}

let builder = app.document.builder();

builder.setString(movie.title, "title");
builder.setImage(movie.requestPoster(), "poster");
builder.setString(movie.overview, "overview");
builder.setListItems(movie.genres, "genre");
builder.setDate(movie.releaseDate, "release-date");

app.result(builder);
