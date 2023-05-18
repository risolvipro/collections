// Google Books library (1.0)

app.classes.api.googleBooks = class {
    
    constructor() {
        this.volumeClass = app.classes.api.googleBooks.volume;
    }

    search(query) {
        let searchResults = [];

        let baseURL = "https://www.googleapis.com/books/v1/volumes?q=";

        let url = undefined;

        if(query.isText()) {
            url = baseURL + encodeURIComponent(query.value);
        }
        else if(query.isBarcode()) {
            url = baseURL + "isbn:" + encodeURIComponent(query.value);
        }

        if(url != undefined) {
            let request = app.request(url);
            let response = request.send();
            let data = response.json();

            if(data?.items != undefined) {
                for(let item of data.items) {
                    let volumeInfo = item.volumeInfo;
                    let subtitle = volumeInfo.authors?.join(", ");
                
                    let searchResult = app.searchResult.new();
                
                    searchResult.title = volumeInfo.title;
                    searchResult.subtitle = subtitle;
                    searchResult.imageURL = volumeInfo.imageLinks?.thumbnail;
                
                    let categories = volumeInfo.categories ?? [];
                
                    searchResult.params = {
                        id: item.id,
                        categories: categories
                    };
                    
                    searchResults.push(searchResult);
                }
            }
        }

        return searchResults;
    }

    getVolume(id) {
        let request = app.request("https://www.googleapis.com/books/v1/volumes/" + id);
        let response = request.send();
        let data = response.json();
        if(data?.volumeInfo != undefined) {
            let volume = new this.volumeClass(data);
            return volume;
        }
        return undefined;
    }
}

app.classes.api.googleBooks.volume = class {
    constructor(data) {
        this.data = data;
    }

    get volumeInfo() {
        return this.data.volumeInfo;
    }

    get id() {
        return this.data.id;
    }

    get title() {
        return this.volumeInfo.title;
    }

    get publisher() {
        return this.volumeInfo.publisher;
    }

    get publishedDate() {
        let date = new Date(this.volumeInfo.publishedDate);
        if(app.date.isValid(date)) {
            return date;
        }
        return undefined;
    }

    get pageCount() {
        return this.volumeInfo.pageCount;
    }

    get authors() {
        let authors = [];
        for(let name of this.volumeInfo.authors) {
            let author = app.document.builder();
            author.setIdentifier("name");
            author.setString(name, "name");
            authors.push(author);
        }
        return authors;
    }

    requestImage() {
        if(this.volumeInfo.imageLinks != undefined){
            let sizes = ["extraLarge", "large", "medium", "small", "thumbnail", "smallThumbnail"];
        
            for(let size of sizes){
                let imageURL = this.volumeInfo.imageLinks[size];
                if(imageURL != undefined) {
                    return app.image.fromURL(imageURL);
                }
            }
        }

        return undefined;
    }

    categories(categories) {
        let suggestions = [];
        for(let category of categories) {
            let suggestion = app.listItem.suggest(category, category);
            suggestions.push(suggestion);
        }
        return suggestions;
    }

    get ISBN_13() {
        for(let id of this.volumeInfo.industryIdentifiers) {
            if(id.type == "ISBN_13") {
                return id.identifier;
            }
        }
        return undefined;
    }
}

app.api.googleBooks = new app.classes.api.googleBooks();