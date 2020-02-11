import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import algoliasearch from 'algoliasearch';
import makeCancelable from '../Utils/makeCancellable';
import Header from './Header';

import { Map, TileLayer, Marker, Popup, Circle } from 'react-leaflet';

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

type LatLngTuple = [number, number];

// Create one regular function that does the call and return a promise of hits
const useGyms = (lat: number, long: number, query = '') => {
  const appID: string = process.env.ALGOLIA_APP_ID!;
  const apiKey: string = process.env.ALGOLIA_SEARCH_API_KEY!;
  const indexName: string = process.env.ALGOLIA_INDEX_NAME!;
  const searchClient = algoliasearch(appID, apiKey);
  // put client init in a useMemo with empty array
  const algoliaIndex = searchClient.initIndex(indexName);

  const [results, setResults] = useState<Gym[]>([]);

  useEffect(() => {
    const searchPromise = makeCancelable(
      algoliaIndex.search({
        query,
        aroundLatLng: `${lat},${long}`,
        hitsPerPage: 30,
      })
    );
    searchPromise.then(result => setResults(result.hits));
    return () => {
      searchPromise.cancel();
    };
  }, [lat, long, query]);
  return results;
};

// Create a hook that calls that function, triggers the search with a useEffect and stores the gyms using useState

const App = () => {
  const [mapCenter, setMapCenter] = useState<LatLngTuple>([45.74846, 4.84671]);
  const gymList: Gym[] = useGyms(...mapCenter);

  return (
    <React.Fragment>
      <Header />
      <Map
        center={[45.74846, 4.84671]}
        zoom={13}
        id="mapid"
        onmoveend={evt => {
          const { lat, lng } = evt.target.getCenter();
          setMapCenter([lat, lng]);
        }}
      >
        <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* bin */}
        <Circle center={mapCenter} radius={6000} />
        {gymList.map(gym => (
          <Marker key={gym.objectID} position={[gym._geoloc.lat, gym._geoloc.lng]}>
            <Popup>
              <div>
                <h4>{gym.name}</h4>
                <img src={gym.imageUrl} alt={gym.name} />
              </div>
            </Popup>
          </Marker>
        ))}
      </Map>
      {gymList.length > 0 ? (
        <ol>
          {gymList.map(gym => (
            <li key={gym.objectID}>
              <img src={gym.imageUrl} alt="" />
              <p>{gym.name}</p>
            </li>
          ))}
        </ol>
      ) : (
        <div>pas de gyms</div>
      )}
    </React.Fragment>
  );
};

const Root = () => <App />;

ReactDom.render(<Root />, document.getElementById('root'));
