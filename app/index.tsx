import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import algoliasearch from 'algoliasearch';
import makeCancelable from '../Utils/makeCancellable';

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

// Create one regular function that does the call and return a promise of hits
const getHits = query => {
  const appID: string = process.env.ALGOLIA_APP_ID!;
  const apiKey: string = process.env.ALGOLIA_SEARCH_API_KEY!;
  const indexName: string = process.env.ALGOLIA_INDEX_NAME!;
  const searchClient = algoliasearch(appID, apiKey);
  const algoliaIndex = searchClient.initIndex(indexName);

  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const searchPromise = makeCancelable(
      algoliaIndex.search({ query, hitsPerPage: 100 })
    );
    searchPromise.then(result => setResults(result.hits));
    return () => {
      searchPromise.cancel();
    };
  }, [query]);
  return results;
};

// Create a hook that calls that function, triggers the search with a useEffect and stores the gyms using useState

const App = () => {
  const [gyms, setGyms] = useState(0);
  const gymList: Gym[] = getHits('');

  useEffect(() => {
    setGyms(gymList);
  });

  return (
    <React.Fragment>
      {gymList.length > 0 ? (
        <ul>
          {gymList.map(gym => (
            <li key={gym.objectID}>{gym.name}</li>
          ))}
        </ul>
      ) : (
        <div>pas de gyms</div>
      )}
    </React.Fragment>
  );
};

const Root = () => <App />;

ReactDom.render(<Root />, document.getElementById('root'));
