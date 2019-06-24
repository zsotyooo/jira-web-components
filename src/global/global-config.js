import { writable, derived, get } from 'svelte/store';

export const dataTemplate = {
  corsUrl: null,
  isSafe: null,
}

const getData = (...data) => [dataTemplate, ...data].reduce((a, c) => ({...a, ...c}), {});

export const config = (() => {
  const store = writable(getData({}));
  const { subscribe, update, set } = store;
  
  const isSafe =
    derived(store, data => data.isSafe, null);
  const corsUrl =
    derived(store, data => data.corsUrl, null);
  const valid =
    derived(store, ({isSafe, corsUrl}) => (isSafe === true || isSafe === false) && !!corsUrl, false);

  const setIsSafe = (_isSafe) => {
    if (_isSafe === false || _isSafe === 'false') {
      update(currentData => getData(currentData, {isSafe: false}));
    }
    if (_isSafe === true || _isSafe === 'true') {
      update(currentData => getData(currentData, {isSafe: true}));
    }
  };
  const setCorsUrl = (corsUrl) =>
    update(currentData => getData(currentData, { corsUrl }));
  
  const getIsSafe = () => get(isSafe);
  const getCorsUrl = () => get(corsUrl);
  const getIsValid = () => get(valid);

  const onSafeOff = (fn) => {
    subscribe(({isSafe}) => {
      if (!(isSafe === true)) {
        fn();
      }
    });
  };

  const onSafeOn = (fn) => {
    subscribe(({isSafe}) => {
      if (isSafe === true) {
        fn();
      }
    });
  };

  return {
    subscribe,
    isSafe,
    corsUrl,
    valid,
    setIsSafe,
    setCorsUrl,
    getIsSafe,
    getCorsUrl,
    getIsValid,
    onSafeOff,
    onSafeOn,
  }
})();