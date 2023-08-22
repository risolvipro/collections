// Discogs document (1.0)
// https://github.com/risolvipro/collections

let release = app.api.discogs.getRelease(app.params.id);

if(release == undefined) {
    app.fail();
}

let builder = app.document.builder();

builder.setString(release.title, "title");
builder.setDocuments(release.artists, "artists");
builder.setImage(release.requestImage(), "cover");
builder.setManagedDocuments(release.tracklist, "tracks");
builder.setListItem(release.format, "format");
builder.setListItems(release.genres, "genre");
builder.setListItems(release.styles, "style");
builder.setInteger(release.year, "year");
builder.setString(app.params.barcode, "barcode");

app.result(builder);