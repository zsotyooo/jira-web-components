import { writable, derived, get } from 'svelte/store';
import { fetchApi } from '../utils/api.js';
import { createKeyedStore } from '../utils/store.js';
import { config } from '../global/global-config.js';

const getAvatars = () => {
  const r = Math.random();
  return {
    '16x16': `https://avatars.dicebear.com/v2/identicon/${r}.svg`,
    '24x24': `https://avatars.dicebear.com/v2/identicon/${r}.svg`,
    '32x32': `https://avatars.dicebear.com/v2/identicon/${r}.svg`,
    '48x48': `https://avatars.dicebear.com/v2/identicon/${r}.svg`,
  }
}

export const dataTemplate = {
  accountId: null,
  key: '',
  name: '',
  emailAddress: '',
  avatarUrls: getAvatars(),
  displayName: '',
  isFetching: null,
  lastFetchTime: null,
  ok: null,
  error: null,
  result: null,
  errorResult: null,
}

const _d = (...data) => [dataTemplate, ...data, { key: 'authuser'}].reduce((a, c) => ({...a, ...c}), {});

export const authUser = (() => {

  const {
    subscribe,
    setIsFetching,
    setData,
    setSuccess,
    setError,
    loaded,
    ok,
    fetching,
    isFetching,
    isLoaded,
    isOk,
    getData,
    getKey,
    reset,
  } = createKeyedStore('authuser', _d);
  
  const authenticate = async () => {
    try {
      setIsFetching(true);
      const result = await fetchApi('/rest/api/3/myself');
      const { accountId, key, name, emailAddress, displayName, avatarUrls } = result;
      setSuccess({ accountId, key, name, emailAddress, displayName, avatarUrls }, result);
    } catch(error) {
      console.warn(`Authentication error: ${JSON.stringify(error)}`);
      setError(error);
    }
  }

  const onLogin = (fn) => {
    return ok.subscribe((_isAuthenticated) => {
      if (_isAuthenticated === true) {
        fn();
      }
    });
  };

  const onLogout = (fn) => {
    return ok.subscribe((_isAuthenticated) => {
      if (_isAuthenticated === false) {
        fn();
      }
    });
  };

  const init = () => {
    config.onSafeOff(() => {
      const isValid = config.getIsValid();
      reset();
    });
    config.onSafeOn(() => {
      const isValid = config.getIsValid();
      authenticate();
    });
  }

  init();

  return {
    subscribe,
    setIsFetching,
    setSuccess,
    setError,
    authenticated: ok,
    fetching,
    authenticate,
    isFetching,
    isAuthenticated: isOk,
    getUserData: getData,
    reset,
    onLogin,
    onLogout,
  }
})();
