// TMDB library (1.0)

app.classes.api.tmdb = class {
    
    constructor() {
        this.api_key = "";
        this.language = "en-US";
        this.movieClass = app.classes.api.tmdb.movie;
    }

    searchMovies(query) {
        let queryText = "";
        if(query.isText()) {
            queryText = query.value;
        }

        let url = "https://api.themoviedb.org/3/search/movie?";
        url += "api_key=" + this.api_key;
        url += "&language=" + this.language;
        url += "&query=" + encodeURIComponent(queryText);
        url += "&include_adult=false";

        let request = app.request(url);
        let response = request.send();
        let data = response.json();
        
        let searchResults = [];

        if(data?.results != undefined) {
            for(let result of data.results) {
                let movie = new app.classes.api.tmdb.movieResult(result);

                let searchResult = app.searchResult.new();
            
                searchResult.title = movie.title;
                searchResult.subtitle = movie.year;
                searchResult.imageURL = movie.thumbnail;
            
                searchResult.params = {
                    id: movie.id
                };
                
                searchResults.push(searchResult);
            }
        }

        return searchResults;
    }

    getMovie(id) {
        let url = "https://api.themoviedb.org/3/movie/" + id + "?";
        url += "api_key=" + this.api_key;
        url += "&language=" + this.language;

        let request = app.request(url);
        let response = request.send();

        if(response.statusCode == 200) {
            let data = response.json();
            if(data != undefined) {
                return new this.movieClass(data);
            }
        }

        return undefined;
    }
}

app.classes.api.tmdb.movieResult = class {
    constructor(data) {
        this.data = data;
    }

    get id() {
        return this.data.id;
    }

    get title() {
        return this.data.title;
    }

    get releaseDate() {
        let date = new Date(this.data.release_date);
        if(app.date.isValid(date)) {
            return date;
        }
        return undefined;
    }

    get year() {
        let releaseDate = this.releaseDate;
        if(releaseDate != undefined) {
            return releaseDate.getFullYear();
        }
        return undefined;
    }

    get thumbnail() {
        let poster_path = this.data.poster_path;
        if(poster_path != undefined) {
            return "https://image.tmdb.org/t/p/w500" + poster_path;
        }
        return undefined;
    }
}

app.classes.api.tmdb.movie = class {
    constructor(data) {
        this.data = data;
    }

    get id() {
        return this.data.id;
    }

    get title() {
        return this.data.title;
    }

    get overview() {
        return this.data.overview;
    }

    get releaseDate() {
        let date = new Date(this.data.release_date);
        if(app.date.isValid(date)) {
            return date;
        }
        return undefined;
    }

    get genres() {
        let suggestions = [];
        for(let genre of this.data.genres) {
            let name = genre.name;
            let suggestion = app.listItem.suggest(name, name);
            suggestions.push(suggestion);
        }
        return suggestions;
    }

    posterURL(size = "original") {
        let poster_path = this.data.poster_path;
        if(poster_path != undefined) {
            return "https://image.tmdb.org/t/p/" + size + poster_path;
        }
        return undefined;
    }

    requestPoster(size = "original") {
        let url = this.posterURL(size);
        if(url != undefined) {
            return app.image.fromURL(url);
        }
        return undefined;
    }
}

app.api.tmdb = new app.classes.api.tmdb();