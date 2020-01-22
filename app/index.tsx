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

const appID: string = process.env.ALGOLIA_APP_ID;
const apiKey: string = process.env.ALGOLIA_SEARCH_API_KEY;
const indexName: string = process.env.ALGOLIA_INDEX_NAME;

const searchClient = algoliasearch(appID, apiKey);
const index = searchClient.initIndex(indexName);

console.log(index);

index
  .search({ query: 'yoga' })
  .then(({ hits } = {}) => {
    console.log(hits);
  })
  .catch(err => {
    console.log(err);
    console.log(err.debugData);
  });

const Root = () => <div>heyyy y'allllszzz</div>;

ReactDom.render(<Root />, document.getElementById('root'));
