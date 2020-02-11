const cheerio = require('cheerio');
const got = require('got');
const algoliasearch = require('algoliasearch');
const omit = require('lodash/omit');
const isEqual = require('lodash/isEqual');

const API_URL = 'https://api.prod.gymlib.com/api';
const DEFAULT_HEADERS = {
  'content-type': 'application/json',
  Authorization: 'Bearer 3dPkLt2b4sVEZ3u6YUd5Vl0wRz7y64OZFrybJM',
};

async function getLocationId(query) {
  try {
    const result = await got.post(API_URL, {
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        operationName: 'WHERE_SUGGESTIONS_QUERY',
        variables: { query },
        query: `
          query WHERE_SUGGESTIONS_QUERY($query: String!) {
            geosuggestions(query: $query) { id text }
          }`,
      }),
    });

    return JSON.parse(result.body).data.geosuggestions[0].id;
  } catch (err) {
    return null;
  }
}

async function getGyms(locationId) {
  try {
    const result = await got.post(API_URL, {
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        operationName: null,
        variables: {},
        query: `{
          gymSearch(location: {id: "${locationId}"}, pagination: { first: 0, offset: 500 }) {
            results {
              gym {
                id
                name
                description
                address
                city
                zipCode
                mainPicture
                latitude
                longitude
              }
            }
            total
          }
        }
        `,
      }),
    });

    return JSON.parse(result.body).data.gymSearch.results.map(r => r.gym);
  } catch (err) {
    return [];
  }
}

async function updateGymIndex(gyms) {
  const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
  const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

  const { results: existingGyms } = await index.getObjects(gyms.map(g => g.id));

  const existingGymsById = existingGyms.filter(Boolean).reduce((acc, gym) => ((acc[gym.objectID] = gym), acc), {});

  const now = new Date().toISOString();
  // either new gyms or gyms that have changed
  const updatedGyms = gyms
    .map(gym => ({
      objectID: gym.id,
      createdAt: existingGymsById[gym.id] ? existingGymsById[gym.id].createdAt : now,
      updatedAt: now,
      name: gym.name,
      description:
        typeof gym.description === 'string'
          ? cheerio
              .load(gym.description)
              .text()
              .trim()
          : '',
      descriptionHtml: gym.description,
      address: [gym.address, gym.city, gym.zipCode].filter(Boolean).join(', '),
      imageUrl: gym.mainPicture,
      _geoloc: { lat: gym.latitude, lng: gym.longitude },
    }))
    .filter(gym => !isEqual(omit(gym, 'updatedAt'), omit(existingGymsById[gym.objectID], 'updatedAt')));

  console.log(`Saving ${updatedGyms.length} gyms`);
  return index.saveObjects(updatedGyms);
}

module.exports = async (req, res) => {
  try {
    console.log('Loading location id');
    const locationId = await getLocationId('Lyon, France');

    console.log('Loading gyms');
    const gyms = await getGyms(locationId);

    console.log('Indexing gyms');
    await updateGymIndex(gyms);
    console.log('done indexing');
    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};
