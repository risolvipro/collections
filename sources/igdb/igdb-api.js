// IGDB library (1.2)

app.classes.api.igdb = class {
    #baseFields

    constructor() {
        this.client_id = undefined;
        this.client_secret = undefined;
        this.#baseFields = ["name", "cover.*", "platforms.*", "first_release_date", "genres.*", "summary"];
        this.extraFields = [];
        this.gameClass = app.classes.api.igdb.game;
        this.keyErrorMessage = "In order to use this feature, please register your personal API Keys at igdb.com/api";
    }

    #fields() {
        let fields = [];

        for(let field of this.#baseFields){
            fields.push(field);
        }

        for(let field of this.extraFields){
            if(fields.indexOf(field) < 0){
                fields.push(field);
            }
        }

        return fields;
    }

    #fieldsToString() {
        let fields = this.#fields();
        return fields.join(",");
    }

    #hasApiKeys() {
        if(this.client_id === undefined || this.client_secret === undefined){
            return false;
        }
        else if(this.client_id == "YOUR CLIENT ID" || this.client_secret == "YOUR CLIENT SECRET"){
            return false;
        }
        return true;
    }

    request(endpoint, body) {
        let access_token = app.storage.igdb_access_token;
        
        let url = "https://api.igdb.com/v4" + endpoint;

        let request = app.request(url);
        request.method = "POST";
        request.addHeaderValue(this.client_id, "Client-ID");
        request.addHeaderValue("Bearer " + access_token, "Authorization");
        request.body = body;
        
        return request;
    }

    search(query) {
        if(!this.#hasApiKeys()){
            let error = app.error.new(this.keyErrorMessage, app.error.type.API_KEY_REQUIRED);
            app.setError(error);
            return [];
        }

        this.refreshTokenIfNeeded();

        let searchResults = [];

        let access_token = app.storage.igdb_access_token;
        if(access_token != undefined) {
            let queryText = "";
            if(query.isText()) {
                queryText = query.value;
            }
            let escapedQuery = queryText.replace('"', '\"');
            let body = 'search "' + escapedQuery +'"; fields name,cover.*,platforms.*;';

            let request = this.request("/games/", body);
            let response = request.send();

            if(response.statusCode == 200) {
                let data = response.json();
                if(data != undefined) {

                    for(let object of data) {
                        let game = new app.classes.api.igdb.game(object);
                        let platforms = game.platforms_strings;

                        let searchResult = app.searchResult.new();
            
                        searchResult.title = game.name;
                        if(platforms.length > 0){
                            searchResult.subtitle = platforms.join(", ");
                        }
                        searchResult.imageURL = game.dataCoverURL;
                    
                        searchResult.params = {
                            id: game.id
                        };
                        
                        searchResults.push(searchResult);
                    }
                }
            }
            else if(response.statusCode == 401) {
                this.clearToken();
            }
        }

        return searchResults;
    }

    getGame(id) {
         if(!this.#hasApiKeys()){
            let error = app.error.new(this.keyErrorMessage, app.error.type.API_KEY_REQUIRED);
            app.setError(error);
            return undefined;
        }

        this.refreshTokenIfNeeded();

        let access_token = app.storage.igdb_access_token;
        if(access_token != undefined) {
            let body = 'where id = ' + id +'; fields ' + this.#fieldsToString() + ';';

            let request = this.request("/games/", body);
            let response = request.send();

            if(response.statusCode == 200) {
                let data = response.json();
                if(data != undefined && data[0] != undefined) {
                    return new this.gameClass(data[0]);
                }
            }
            else if(response.statusCode == 401) {
                this.clearToken();
            }
        }
        return undefined;
    }

    refreshTokenIfNeeded() {
        
        let refresh = true;

        let access_token = app.storage.igdb_access_token;
        let expirationDate = app.storage.igdb_expiration_date;
        
        if(access_token != undefined && expirationDate != undefined) {
            if(app.date.isValid(expirationDate)) {
                let now = new Date();
                
                if((now - expirationDate) < 0) {
                    refresh = false;
                }
            }
        }

        if(refresh){
            let url = "https://id.twitch.tv/oauth2/token?";
            url += "&client_id=" + this.client_id;
            url += "&client_secret=" + this.client_secret;
            url += "&grant_type=client_credentials";

            let request = app.request(url);
            request.method = "POST";

            let response = request.send();

            if(response.statusCode == 200) {
                let data = response.json();
                if(data != undefined) {
                    let access_token = data.access_token;

                    let now = new Date();
                    let expirationSeconds = parseInt(data.expires_in);
                    let expirationDate = new Date(now.getTime() + expirationSeconds * 1000);

                    app.storage.igdb_access_token = access_token;
                    app.storage.igdb_expiration_date = expirationDate;
                }
            }
        }
    }

    clearToken() {
        delete app.storage.igdb_access_token;
        delete app.storage.igdb_expiration_date;
    }
}

app.classes.api.igdb.game = class {

    constructor(data) {
        this.data = data;
    }

    get id() {
        return this.data.id;
    }

    get name() {
        return this.data.name;
    }

    get summary() {
        return this.data.summary;
    }

    get dataCoverURL() {
        let url = this.data.cover?.url;
        if(url != undefined && url != null) {
            return "https:" + url;
        }
        return undefined;
    }

    get firstReleaseDate() {
        let first_release_date = this.data.first_release_date;
        if(first_release_date != undefined){
            return app.date.fromUnixTimestamp(first_release_date);
        }
        return undefined;
    }

    coverURL(size = "original") {
        if(this.data.cover != undefined) {
            let image_id = this.data.cover.image_id;
            return "https://images.igdb.com/igdb/image/upload/t_" + size + "/" + image_id + ".jpg";
        }
        return undefined;
    }

    requestCover(size = "original") {
        let url = this.coverURL(size);
        if(url != undefined) {
            return app.image.fromURL(url);
        }
        return undefined;
    }

    get platforms() {
        let suggestions = [];

        if(this.data.platforms != undefined){
            for(let platform of this.data.platforms){
                let name = platform.name;
                if(name != undefined){
                    let suggestion = app.listItem.suggest(name, name);
                    suggestions.push(suggestion);
                }
            }
        }

        return suggestions;
    }

    get platforms_strings() {
        let strings = [];
        if(this.data.platforms != undefined){
            for(let platform of this.data.platforms){
                let name = platform.name;
                if(name != undefined){
                    strings.push(name);
                }
            }
        }
        return strings;
    }

    get genres() {
        let suggestions = [];

        if(this.data.genres != undefined){
            for(let genre of this.data.genres){
                let name = genre.name;
                if(name != undefined){
                    let suggestion = app.listItem.suggest(name, name);
                    suggestions.push(suggestion);
                }
            }
        }

        return suggestions;
    }
}

app.api.igdb = new app.classes.api.igdb();
