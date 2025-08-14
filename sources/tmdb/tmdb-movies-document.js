// TMDB movies document (1.3)
// https://github.com/risolvipro/collections

app.api.tmdb.api_key = app.config.API_KEY;
app.api.tmdb.language = app.config.LANGUAGE;

let movie = app.api.tmdb.getMovie(app.params.id);

if(movie == undefined) {
    app.fail();
}

let builder = app.document.builder();

builder.setString(movie.title, "title");
builder.setString(movie.id, "tmdb-id");
builder.setImage(movie.requestPoster(), "poster");
builder.setString(movie.overview, "overview");
builder.setListItems(movie.genres, "genre");
builder.setDate(movie.releaseDate, "release-date");
builder.setDecimal(movie.runtime, "runtime");
builder.setDocuments(movie.actors(10), "actors");
builder.setDocuments(movie.directors, "directors");

app.result(builder);
