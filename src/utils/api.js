import { config } from '../global/global-config.js';
import { auth } from '../auth/auth.js';

const getHeaders = () => ({
  'accept': 'application/json',
  'aontent-type': 'application/json',
  'authorization': `Basic ${btoa(auth.getEmail()+':'+auth.getApiKey())}`,
});

export const tick = async (time) => (new Promise((resolve, reject) => { setTimeout(resolve, time); }));

export const fetchApi = async (url) => {
  const cUrl = config.getCorsUrl();
  if (!cUrl) {
    return Promise.reject('No CORS server URL specified!');
  }
  
  const baseUrl = auth.getUrl();
  if (!baseUrl || !auth.getEmail() || !auth.getApiKey()) {
    console.warn('Not authenticated!');
    return Promise.reject();
  }
  
  if (!url) {
    console.warn('No URL specified!');
    return Promise.reject();
  }
  try {
    const rawResponse = await fetch(`${cUrl}/${baseUrl}${url}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!rawResponse || !rawResponse.ok) {
      let error = rawResponse;
      let status = '';
      if ((typeof rawResponse['ok']) !== 'undefined') {
        error = await rawResponse.json();
        status = rawResponse.status;
      }
      return Promise.reject(error);
    }
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