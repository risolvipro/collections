// Discogs library (1.0)

app.classes.api.discogs = class {
    
    constructor() {
        
        this.releaseClass = app.classes.api.discogs.release;
    }

    search(query){
        let searchResults = [];

        let response = app.api.discogs.searchRequest(query);
        if(response != undefined && response.results != undefined){

            for(let result of response.results){
                let release = new app.classes.api.discogs.releaseResult(result);

                let searchResult = app.searchResult.new();
                
                searchResult.title = release.formattedTitle;
                searchResult.subtitle = release.artist;
                searchResult.imageURL = release.thumb;
                
                let params = {
                    id: release.id
                };
                if(app.query.isBarcode()){
                    params.barcode = app.query.value;
                }
                searchResult.params = params;
                
                searchResults.push(searchResult);
            }
        }
        return searchResults;
    }

    getRelease(releaseID){
        let response = app.api.discogs.releaseRequest(releaseID);
        if(response != undefined){
            return new this.releaseClass(response);
        }
        return undefined;
    }
}

app.classes.api.discogs.releaseResult = class {
    constructor(data) {
        this.data = data;

        this.id = data.id;

        this.title = data.title;
        this.artist = undefined;

        if(data.title != undefined){
            let [artist, ...rest] = data.title.split(" - ");

            if(rest.length > 0){
                this.artist = artist;
                this.title = rest.join(" - ");
            }
        }
    }

    get formattedTitle() {
        let formats = this.data.formats;
        if(formats != undefined && formats.length > 0){
            let name = formats[0].name;
            if(name != undefined){
                return this.title + " (" + name + ")";
            }
        }
        return this.title;
    }

    get thumb(){
        return this.data.thumb;
    }
}

app.classes.api.discogs.release = class {
    constructor(data) {
        this.data = data;
    }

    get id(){
        return this.data.id;
    }

    get title(){
        return this.data.title;
    }    

    get artists() {
        let artists = [];
        if(this.data.artists != undefined){
            for(let data of this.data.artists) {
                let artist = app.document.builder();
                artist.setIdentifier("discogs-id");
                artist.setString(data.name, "name");
                artist.setString(data.id.toString(), "discogs-id");
                artists.push(artist);
            }
        }
        return artists;
    }

    get tracklist() {
        let tracks = [];
        let tracklist = this.data.tracklist;
        if(tracklist != undefined){
            for(let i = 0; i < tracklist.length; i++) {
                let data = tracklist[i];
                let track = app.document.builder();

                let position = (i + 1).toString();
                if(data.position != undefined){
                    position = data.position;
                }

                track.setString(data.title, "title");
                track.setString(position, "position");

                if(data.duration != undefined){
                    let duration_comps = data.duration.split(":");
                    
                    let hours = 0;
                    let minutes = 0;
                    let seconds = 0;

                    if(duration_comps.length == 1){
                        seconds = parseInt(duration_comps[0]);
                    }
                    else if(duration_comps.length == 2){
                        minutes = parseInt(duration_comps[0]);
                        seconds = parseInt(duration_comps[1]);
                    }
                    else if(duration_comps.length == 3){
                        hours = parseInt(duration_comps[0]);
                        minutes = parseInt(duration_comps[1]);
                        seconds = parseInt(duration_comps[2]);
                    }

                    track.setDecimal(hours * 3600 + minutes * 60 + seconds, "duration");
                }

                tracks.push(track);
            }
        }
        return tracks;
    }

    get imageURL(){
        let images = this.data.images;
        if(images != undefined){
            if(images.length > 0){
                let proposedImage = undefined;

                for(let image in images){
                    if(image.type == "primary"){
                        proposedImage = image;
                        break;
                    }
                }

                if(proposedImage == undefined){
                    proposedImage = images[0];
                }

                return proposedImage.resource_url;
            }
        }
        return undefined;
    }

    requestImage() {
        let imageURL = this.imageURL;

        if(imageURL != undefined){
            return app.image.fromURL(imageURL);
        }

        return undefined;
    }

    get genres() {
        let suggestions = [];
        if(this.data.genres != undefined){
            for(let genre of this.data.genres) {
                let suggestion = app.listItem.suggest(genre, genre);
                suggestions.push(suggestion);
            }
        }
        return suggestions;
    }

    get styles() {
        let suggestions = [];
        if(this.data.styles != undefined){
            for(let style of this.data.styles) {
                let suggestion = app.listItem.suggest(style, style);
                suggestions.push(suggestion);
            }
        }
        return suggestions;
    }

    get format() {
        let formats = this.data.formats;
        if(formats != undefined && formats.length > 0){
            let name = formats[0].name;
            if(name != undefined){
                return app.listItem.suggest(name, name);
            }
        }
        return undefined;
    }

    get year() {
        return parseInt(this.data.year);
    }
}

app.api.discogs = new app.classes.api.discogs();