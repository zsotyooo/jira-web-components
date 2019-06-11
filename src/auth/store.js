import { writable, get } from 'svelte/store';
import { fetchApi, tick } from '../utils/api.js';
import { createSavedStoreFor } from '../utils/storage.js';

const fetchAuthUser = async () => {
  await tick(100);
  if (!get(authUserIsFetching)) {
    authUser.set(emptyUser);
    authUserIsFetching.set(true);
    try {
      const { accountId, key, name, emailAddress, displayName, avatarUrls } = await fetchApi('/rest/api/3/myself');
      authUser.set({ accountId, key, name, emailAddress, displayName, avatar: avatarUrls['48x48'] });
      authUserIsFetching.set(false);
    } catch(error) {
      console.warn(`Authentication error: ${error}`);
      authUser.set(emptyUser);
      authUserIsFetching.set(false);
    }
  }
};

export const emptyUser = {
  accountId: '',
  key: '',
  name: '',
  emailAddress: '',
  avatar: '',
  displayName: '',
};

export let authUserIsFetching = writable(false);

export let isAuthenticated = writable(false);

export const email = createSavedStoreFor('email');

export const apiKey = createSavedStoreFor('apiKey');

export const url = createSavedStoreFor('url');

export const authUser = writable(emptyUser);

authUser.subscribe(v => {
  isAuthenticated.set(!!v.accountId);
});

email.subscribe(v => {
  fetchAuthUser();
});

apiKey.subscribe(v => {
  fetchAuthUser();
});

url.subscribe(v => {
  fetchAuthUser();
});