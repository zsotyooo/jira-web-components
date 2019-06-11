import { get } from 'svelte/store';
import { corsUrl } from '../global/store.js';
import { email, apiKey, url as bUrl} from '../auth/store.js';
import { readData } from './storage.js';


const getHeaders = () => ({
  'accept': 'application/json',
  'aontent-type': 'application/json',
  'authorization': `Basic ${btoa(get(email)+':'+get(apiKey))}`,
});

export const tick = async (time) => (new Promise((resolve, reject) => { setTimeout(resolve, time); }));

export const fetchApi = async (url) => {
  const cUrl = get(corsUrl);
  if (!cUrl) {
    return Promise.reject('No CORS server URL specified!');
  }
  
  const baseUrl = get(bUrl);
  if (!bUrl || ! get(email) || !get(apiKey)) {
    return Promise.reject('Not authenticated!');
  }
  
  if (!url) {
    return Promise.reject('No URL specified!');
  }
  try {
    const rawResponse = await fetch(`${cUrl}/${baseUrl}${url}`, {
      method: 'GET',
      headers: getHeaders()
    });
    const content = await rawResponse.json();
    return Promise.resolve(content);
  } catch(error) {
    return Promise.reject(error);
  }
}

export const fetchAllPages = async (url, max = 50) => {
  let isLast = false;
  let startAt = 0;
  let maxResult = max;
  const ret = [];
  while (!isLast) {
    let res = await fetchApi(url.replace('%start%', startAt).replace('%max%', maxResult));
    isLast = res.isLast;
    maxResult = res.maxResult;
    startAt = res.startAt + maxResult;
    ret.push(res);
  }
  return Promise.resolve(ret);
}