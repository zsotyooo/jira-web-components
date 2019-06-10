import { readData } from './storage.js';

const getHeaders = () => ({
  'accept': 'application/json',
  'aontent-type': 'application/json',
  'authorization': `Basic ${btoa(readData('email')+':'+readData('apiKey'))}`,
});

export const tick = async (time) => (new Promise((resolve, reject) => { setTimeout(resolve, time); }));

export const fetchApi = async (url) => {
  const corsUrl = readData('cors');
  if (!corsUrl) {
    return Promise.reject('No CORS server URL specified!');
  }
  const baseUrl = readData('url');
  if (!baseUrl || !url) {
    return Promise.reject('No URL specified!');
  }
  try {
    const rawResponse = await fetch(`${corsUrl}/${baseUrl}${url}`, {
      method: 'GET',
      headers: getHeaders()
    });
    try {
      const content = await rawResponse.json();
      return content;
    } catch(error) {
      return Promise.reject(error);
    }
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