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