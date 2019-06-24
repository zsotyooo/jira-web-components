import { writable, derived, get } from 'svelte/store';
import { readData, hydrateData, deleteData } from '../utils/storage.js';
import { config } from '../global/global-config.js';

export const dataTemplate = {
  emial: '',
  apiKey: '',
  url: '',
}

const now = () => ((new Date()).getTime());

const getData = (...data) => [dataTemplate, ...data].reduce((a, c) => ({...a, ...c}), {});

export const auth = (() => {
  const store = writable(getData({}));
  const { subscribe, update, set } = store;

  const setEmail = (email) =>
    update(currentData => getData(currentData, { email }));
  const setApiKey = (apiKey) =>
    update(currentData => getData(currentData, { apiKey }));
  const setUrl = (url) =>
    update(currentData => getData(currentData, { url }));
  const reset = () => {
    setEmail('');
    setApiKey('');
    setUrl('');
  };
  const getEmail = () => get(store).email;
  const getApiKey = () => get(store).apiKey;
  const getUrl = () => get(store).url;
  const email =
    derived(store, data => data.email, '');
  const apiKey =
    derived(store, data => data.apiKey, '');
  const url =
    derived(store, data => data.url, '');

  const init = () => {
    let unsubHydrate = null;
    config.onSafeOff(() => {
      const isValid = config.getIsValid();

      if (unsubHydrate) {
        unsubHydrate();
        unsubHydrate = null;
      }
      reset();
      if (isValid) {
        deleteData('email');
        deleteData('apiKey');
        deleteData('url');
      }
    });

    config.onSafeOn(() => {
      const isValid = config.getIsValid();
      if (isValid) {
        setEmail(readData('email'));
        setApiKey(readData('apiKey'));
        setUrl(readData('url'));
        if (!unsubHydrate) {
          unsubHydrate = subscribe(({email, apiKey, url}) => {
            hydrateData('email', email);
            hydrateData('apiKey', apiKey);
            hydrateData('url', url);
          });
        };
      }
    });
  }

  init();

  return {
    subscribe,
    setEmail,
    setApiKey,
    setUrl,
    getEmail,
    getApiKey,
    getUrl,
    reset,
    email,
    apiKey,
    url,
  }
})();
