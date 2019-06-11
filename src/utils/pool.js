import { writable, get } from 'svelte/store';

const now = () => ((new Date()).getTime());

const secondsPast = (date) => {
  return (now() - date.getTime()) / 1000;
}

export class Pool {
  constructor(dataTemplate, fetchFn, fetchAllFn) {
    this.dataTemplate = {
      ...dataTemplate,
      lastFetched: 0,
      isFetching: false,
    };
    this.fetchFn = fetchFn;
    this.fetchAllFn = fetchAllFn;
    this.store = writable([]);
    this.subscribe = this.store.subscribe;
    this.set = this.store.set;
    this.update = this.store.update;
    this.isFetching = writable(false);
  }

  getIsFetching() {
    return this.isFetching;
  }

  fetchAll() {
    if (this.fetchAllFn) {
      this.isFetching.set(true);
      this.fetchAllFn().then(values => {
        this.store.set(
          values.map(d => writable({
            ...this.dataTemplate,
            ...d,
            ok: true, isFetching: false, lastFetched: now()
          }))
        );
        this.isFetching.set(false);
      }).catch(error => {
        this.isFetching.set(false);
        this.store.set([]);
        console.warn(error);
      });
    } else {
      throw new Error('No fetchAllFn specified!');
    }
  }

  getStore() {
    return this.store;
  }

  addByKey(key) {
    let data = this.getByKey(key);
    if (!data) {
      data = {...this.dataTemplate, key};
      this.add(data);
    } else {
      data = get(data);
    }
    
    if (!this.fetchFn || data.isFetching) {
      return;
    }

    this.add({...data, isFetching: true});
    this.fetchFn(key).then(d => {
      this.add({...d, isFetching: false, lastFetched: now(), ok: true});
    }).catch(error => {
      this.add({...this.dataTemplate, key, isFetching: false, lastFetched: now(), ok: false});
      console.warn(error);
    });
  }

  add(data) {
    const pool = get(this.store);
    
    const foundIndex = pool.findIndex((item) => get(item).key === data.key);
    if (foundIndex > -1) {
      pool[foundIndex].set(data);
    } else {
      pool.push(writable(data));
    }
    
    this.store.set(pool);
  }

  reset() {
    get(this.store).map(item => item.set({...this.dataTemplate, key: get(item).key, isFetching: false }));
  }

  kill() {
    this.store.set([]);
  }

  refresh() {
    get(this.store).map(item => this.addByKey(get(item).key));
  }

  getByKey(key) {
    return get(this.store).find(item => get(item).key === key);
  }
}
