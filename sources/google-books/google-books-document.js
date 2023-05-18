// Google Books document (1.0)
// https://github.com/risolvipro/collections

let volume = app.api.googleBooks.getVolume(app.params.id);

if(volume == undefined) {
    app.fail();
}

let builder = app.document.builder();

builder.setString(volume.title, "title");
builder.setDocuments(volume.authors, "authors");
builder.setImage(volume.requestImage(), "cover");
builder.setListItems(volume.categories(app.params.categories), "genre");
builder.setString(volume.publisher, "publisher");
builder.setDate(volume.publishedDate, "published-date");
builder.setInteger(volume.pageCount, "page-count");
builder.setString(volume.ISBN_13, "isbn");

app.result(builder);