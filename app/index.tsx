import React from 'react';
import ReactDom from 'react-dom';
import algoliasearch from 'algoliasearch';

interface GeoLoc {
  lat: number;
  lng: number;
}

interface Gym {
  objectID: string;
  name: string;
  description: string;
  createsAt: string;
  updatedAt: string;
  descriptionHtml: string;
  address: string;
  imageUrl: string;
  _geoloc: GeoLoc;
}

const App = () => {
  const appID: string = process.env.ALGOLIA_APP_ID!;
  const apiKey: string = process.env.ALGOLIA_SEARCH_API_KEY!;
  const indexName: string = process.env.ALGOLIA_INDEX_NAME!;

  const searchClient = algoliasearch(appID, apiKey);
  const index = searchClient.initIndex(indexName);

  // let gymHits: Gym[] = [];

  index
    .search({ query: 'yoga' })
    .then(({ hits } = {}) => {
      // gymHits.push(hits);
      // console.log(gymHits);
      return hits;
    })
    .catch(err => {
      console.log(err);
      console.log(err.debugData);
    });
  console.log(hits);
  return (
    <React.Fragment>
      <div>Lol</div>
    </React.Fragment>
  );
};

const Root = () => <App />;
