/**
 * The logic behind additional fields' data fetch
 */

app.library.collections = {};

/**
 * Extend the default game class with the new fields' data getters
 */
app.library.collections.game = class extends app.classes.api.igdb.game {
  get developers() {
    if (!this.data.involved_companies) return [];
    return this.data.involved_companies
      .filter(({ developer }) => developer)
      .map(({ company }) => app.listItem.suggest(company.name, company.name));
  }

  get franchises() {
    if (!this.data.franchises) return [];
    return this.data.franchises.map(({ name }) =>
      app.listItem.suggest(name, name),
    );
  }

  get publishers() {
    if (!this.data.involved_companies) return [];
    return this.data.involved_companies
      .filter(({ publisher }) => publisher)
      .map(({ company }) => app.listItem.suggest(company.name, company.name));
  }

  get rating() {
    const { total_rating } = this.data;
    return total_rating ? (total_rating / 10).toFixed(1) : undefined;
  }

  get themes() {
    if (!this.data.themes) return [];
    return this.data.themes.map(({ name }) => app.listItem.suggest(name, name));
  }
};

/**
 * Time To Beat is a separate request we need to make to the IGDB API.
 * We reuse the approach used by the author for fetching games
 * to be consistent and keep to DRY principles.
 */
app.library.timeToBeat = (id) => {
  app.api.igdb.refreshTokenIfNeeded();
  const access_token = app.storage.igdb_access_token;
  if (!access_token) return undefined;

  const request = app.api.igdb.request(
    "/game_time_to_beats/",
    `where game_id = ${id}; fields completely, hastily, normally;`,
  );
  const response = request.send();
  const { statusCode } = response;

  if (statusCode === 200) {
    const data = response.json();
    const { completely, hastily, normally } = data?.[0] || {};

    if (completely || hastily || normally) {
      return `Hastily: ${app.shared.secondsToHours(hastily)}\nNormally: ${app.shared.secondsToHours(normally)}\nCompletely: ${app.shared.secondsToHours(completely)}`;
    }

    return undefined;
  } else if (statusCode === 401) {
    app.api.igdb.clearToken();
  }

  return undefined;
};

app.library.search = (query) => {
  app.api.igdb.refreshTokenIfNeeded();
  const access_token = app.storage.igdb_access_token;
  if (!access_token) return undefined;

  const searchResults = [];
  let queryText = "";

  if (query.isText()) {
    queryText = query.value;
  }

  const request = app.api.igdb.request(
    "/games/",
    `search "${queryText.replace('"', '\"')}"; limit 50; fields name,cover.*,first_release_date;`,
  );
  const response = request.send();
  const { statusCode } = response;

  if (statusCode === 200) {
    const data = response.json();

    if (data) {
      const mappedResults = data.map((gameData) => {
        const game = new app.classes.api.igdb.game(gameData);
        const searchResult = app.searchResult.new();

        searchResult.title = game.name;
        searchResult.imageURL = game.dataCoverURL;
        searchResult.params = {
          id: game.id,
        };

        if (game.firstReleaseDate) {
          searchResult.subtitle = game.firstReleaseDate.toLocaleDateString(
            undefined,
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            },
          );
        }

        return searchResult;
      });

      searchResults.push(...mappedResults);
    }
  } else if (statusCode === 401) {
    app.api.igdb.clearToken();
  }

  return searchResults;
};
