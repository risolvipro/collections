// TMDB library (1.2)

app.classes.api.tmdb = class {
    
    constructor() {
        this.api_key = "";
        this.language = "en-US";
        this.movieClass = app.classes.api.tmdb.movie;
        this.tvClass = app.classes.api.tmdb.tv;
        this.seasonClass = app.classes.api.tmdb.season;
        this.episodeClass = app.classes.api.tmdb.episode;
        this.apiErrorMessage = "In order to use this feature, please register your personal API Key at developer.themoviedb.org";
        this.baseURL = "https://api.themoviedb.org/3";
    }

    getEndpoint(url){
        return this.baseURL + url;
    }

    //
    // Movie
    //

    searchMovies(query) {
        if(!this.#hasApiKeys()) {
            app.api.error(this.apiErrorMessage);
            return [];
        }

        let queryText = "";
        if(query.isText()) {
            queryText = query.value;
        }

        let url = this.getEndpoint("/search/movie") + "?";
        url += "api_key=" + this.api_key;
        url += "&language=" + encodeURIComponent(this.language);
        url += "&query=" + encodeURIComponent(queryText);
        url += "&include_adult=false";

        let request = app.request(url);
        let response = request.send();

        let searchResults = [];

        if(response.statusCode == 200) {
            let data = response.json();
            
            if(data?.results != undefined) {
                for(let result of data.results) {
                    let movie = new app.classes.api.tmdb.movieResult(result);
                    let year = movie.year;

                    let searchResult = app.searchResult.new();
                
                    searchResult.title = movie.title;
                    if(year != undefined){
                        searchResult.subtitle = year.toString();
                    }
                    searchResult.imageURL = movie.thumbnail;
                
                    searchResult.params = {
                        id: movie.id
                    };
                    
                    searchResults.push(searchResult);
                }
            }
        }

        return searchResults;
    }

    getMovie(id) {
        if(!this.#hasApiKeys()) {
            app.api.error(this.apiErrorMessage);
            return undefined;
        }

        let url = this.getEndpoint("/movie/" + id) + "?";
        url += "api_key=" + this.api_key;
        url += "&language=" + encodeURIComponent(this.language);

        let request = app.request(url);
        let response = request.send();

        if(response.statusCode == 200) {
            let data = response.json();
            if(data != undefined) {
                let creditsData = this.getMovieCredits(id);
                return new this.movieClass(data, creditsData);
            }
        }

        return undefined;
    }

    getMovieCredits(id) {
        let url = this.getEndpoint("/movie/" + id + "/credits") + "?";
        url += "api_key=" + this.api_key;
        url += "&language=" + encodeURIComponent(this.language);

        let request = app.request(url);
        let response = request.send();

        if(response.statusCode == 200) {
            return response.json();
        }
        return undefined;
    }

    //
    // TV
    //

    searchTV(query) {
        if(!this.#hasApiKeys()) {
            app.api.error(this.apiErrorMessage);
            return [];
        }

        let queryText = "";
        if(query.isText()) {
            queryText = query.value;
        }

        let url = this.getEndpoint("/search/tv") + "?";
        url += "api_key=" + this.api_key;
        url += "&language=" + encodeURIComponent(this.language);
        url += "&query=" + encodeURIComponent(queryText);
        url += "&include_adult=false";

        let request = app.request(url);
        let response = request.send();
        let data = response.json();
        
        let searchResults = [];

        if(data?.results != undefined) {
            for(let result of data.results) {
                let tvShow = new app.classes.api.tmdb.tvResult(result);
                let year = tvShow.year;

                let searchResult = app.searchResult.new();
            
                searchResult.title = tvShow.name;
                if(year != undefined){
                    searchResult.subtitle = year.toString();
                }
                searchResult.imageURL = tvShow.thumbnail;
            
                searchResult.params = {
                    id: tvShow.id
                };
                
                searchResults.push(searchResult);
            }
        }

        return searchResults;
    }

    getTV(id) {
        if(!this.#hasApiKeys()) {
            app.api.error(this.apiErrorMessage);
            return undefined;
        }

        let url = this.getEndpoint("/tv/" + id) + "?";
        url += "api_key=" + this.api_key;
        url += "&language=" + encodeURIComponent(this.language);

        let request = app.request(url);
        let response = request.send();

        if(response.statusCode == 200) {
            let data = response.json();
            if(data != undefined) {
                let creditsData = this.getTVCredits(id);
                return new this.tvClass(data, creditsData);
            }
        }

        return undefined;
    }

    getTVCredits(id) {
        let url = this.getEndpoint("/tv/" + id + "/credits") + "?";
        url += "api_key=" + this.api_key;
        url += "&language=" + encodeURIComponent(this.language);

        let request = app.request(url);
        let response = request.send();

        if(response.statusCode == 200) {
            return response.json();
        }
        return undefined;
    }

    getEpisodes(showID, seasonNumber){
        let url = this.getEndpoint("/tv/" + showID + "/season/" + seasonNumber) + "?";
        url += "api_key=" + this.api_key;
        url += "&language=" + encodeURIComponent(this.language);

        let request = app.request(url);
        let response = request.send();
        
        let episodes = [];

        if(response.statusCode == 200) {
            let data = response.json();

            if(data?.episodes != undefined) {
                for(let episodeData of data.episodes) {
                    let episode = new app.api.tmdb.episodeClass(episodeData);
                    episodes.push(episode);
                }
            }
        }

        return episodes;
    }

    imageURL(path, size = "original") {
        return "https://image.tmdb.org/t/p/" + size + path;
    }

    #hasApiKeys() {
        if(this.api_key == "YOUR API KEY"){
            return false;
        }
        return true;
    }
}

//
// Movie
//

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
            return app.api.tmdb.imageURL(poster_path, "w500");
        }
        return undefined;
    }
}

app.classes.api.tmdb.movie = class {
    constructor(data, creditsData) {
        this.data = data;
        this.creditsData = {};
        if(creditsData != undefined){
            this.creditsData = creditsData;
        }
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
        if(this.data.genres != undefined){
            for(let genre of this.data.genres) {
                let id = genre.id;
                let name = genre.name;
                let suggestion = app.listItem.suggest(id, name);
                suggestions.push(suggestion);
            }
        }
        return suggestions;
    }

    posterURL(size = "original") {
        let poster_path = this.data.poster_path;
        if(poster_path != undefined) {
            return app.api.tmdb.imageURL(poster_path, size);
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

    get runtime() {
        let runtime = this.data.runtime;
        if(runtime != undefined){
            return runtime * 60;
        }
        return undefined;
    }

    actors(limit = 10) {
        let actors = [];
        let cast = this.creditsData.cast;
        if(cast != undefined){
            let length = Math.min(limit, cast.length);
            for(let i = 0; i < length; i++) {
                let member = cast[i];
                let actor = app.document.builder();
                actor.setIdentifier("tmdb-id");
                actor.setString(member.name, "name");
                actor.setString(member.id, "tmdb-id");

                this.configureActor(actor, member);

                actors.push(actor);
            }
        }
        return actors;
    }

    get directors() {
        let directors = [];
        let crew = this.creditsData.crew;
        if(crew != undefined){
            for(let member of crew) {
                if(member.job == "Director"){
                    let director = app.document.builder();
                    director.setIdentifier("tmdb-id");
                    director.setString(member.name, "name");
                    director.setString(member.id, "tmdb-id");
                    
                    this.configureDirector(director, member);

                    directors.push(director);
                }
            }
        }
        return directors;
    }

    configureActor(document, data) {
        // Configure the actor with additional data
        // document.setString(data.name, "name");
    }

    configureDirector(document, data) {
        // Configure the director with additional data
        // document.setString(data.name, "name");
    }
}

//
// TV
//

app.classes.api.tmdb.tvResult = class {
    constructor(data) {
        this.data = data;
    }

    get id() {
        return this.data.id;
    }

    get name() {
        return this.data.name;
    }

    get firstAirDate() {
        let date = new Date(this.data.first_air_date);
        if(app.date.isValid(date)) {
            return date;
        }
        return undefined;
    }

    get year() {
        let firstAirDate = this.firstAirDate;
        if(firstAirDate != undefined) {
            return firstAirDate.getFullYear();
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

app.classes.api.tmdb.tv = class {
    constructor(data, creditsData) {
        this.data = data;
        this.creditsData = {};
        if(creditsData != undefined){
            this.creditsData = creditsData;
        }
    }

    get id() {
        return this.data.id;
    }

    get name() {
        return this.data.name;
    }

    get overview() {
        return this.data.overview;
    }

    get firstAirDate() {
        let date = new Date(this.data.first_air_date);
        if(app.date.isValid(date)) {
            return date;
        }
        return undefined;
    }

    get genres() {
        let suggestions = [];
        if(this.data.genres != undefined){
            for(let genre of this.data.genres) {
                let id = genre.id;
                let name = genre.name;
                let suggestion = app.listItem.suggest(id, name);
                suggestions.push(suggestion);
            }
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

    actors(limit = 10) {
        let actors = [];
        let cast = this.creditsData.cast;
        if(cast != undefined){
            let length = Math.min(limit, cast.length);
            for(let i = 0; i < length; i++) {
                let member = cast[i];

                let actor = app.document.builder();
                actor.setIdentifier("tmdb-id");
                actor.setString(member.name, "name");
                actor.setString(member.id, "tmdb-id");

                this.configureActor(actor, member);

                actors.push(actor);
            }
        }
        return actors;
    }

    get seasons() {
        let documents = [];
        if(this.data.seasons != undefined){
            for(let seasonData of this.data.seasons) {
                let season = new app.api.tmdb.seasonClass(seasonData);

                let document = app.document.builder();
                document.setString(season.name, "name");
                document.setInteger(season.seasonNumber, "season-number");
                document.setDate(season.airDate, "air-date");
                
                let episodes = app.api.tmdb.getEpisodes(this.id, season.seasonNumber);
                let epDocuments = [];

                for(let episode of episodes){
                    let epDocument = app.document.builder();
                    epDocument.setString(episode.name, "name");
                    epDocument.setInteger(episode.seasonNumber, "season-number");
                    epDocument.setInteger(episode.episodeNumber, "episode-number");
                    epDocument.setDate(episode.airDate, "air-date");
                    epDocument.setDecimal(episode.runtime, "runtime");
                    epDocument.setString(episode.id, "tmdb-id");

                    this.configureEpisode(epDocument, episode);

                    epDocuments.push(epDocument);
                }

                document.setManagedDocuments(epDocuments, "episodes");
                document.setString(season.id, "tmdb-id");

                this.configureSeason(document, season);

                documents.push(document);
            }
        }
        return documents;
    }    

    configureActor(document, data) {
        // Configure the actor with additional data
        // document.setString(data.name, "name");
    }

    configureSeason(document, season) {
        // Configure the season with additional data
        // document.setString(season.name, "name");
    }

    configureEpisode(document, episode) {
        // Configure the episode with additional data
        // episode.setString(episode.name, "name");
    }
}

app.classes.api.tmdb.season = class {
    constructor(data) {
        this.data = data;
    }

    get id() {
        return this.data.id;
    }

    get name() {
        return this.data.name;
    }

    get airDate() {
        let date = new Date(this.data.air_date);
        if(app.date.isValid(date)) {
            return date;
        }
        return undefined;
    }

    get seasonNumber() {
        return this.data.season_number;
    }
}

app.classes.api.tmdb.episode = class {
    constructor(data) {
        this.data = data;
    }

    get id() {
        return this.data.id;
    }

    get name() {
        return this.data.name;
    }

    get airDate() {
        let date = new Date(this.data.air_date);
        if(app.date.isValid(date)) {
            return date;
        }
        return undefined;
    }

    get seasonNumber() {
        return this.data.season_number;
    }

    get episodeNumber() {
        return this.data.episode_number;
    }

    get runtime() {
        let runtime = this.data.runtime;
        if(runtime != undefined){
            return runtime * 60;
        }
        return undefined;
    }
}

app.api.tmdb = new app.classes.api.tmdb();
