export const processText = (text) => {
  const matches = /\[JIRA\:([A-Z]+\-[0-9]+)\]/gi.exec(text);
  if (!matches) {
    return text;
  } else {
    text = text.replace(matches[0], `<jira-issue-tag key="${matches[1]}"></jira-issue-tag>`)
  }
  return processText(text);
}

export const createOnceSubsciber = (() => {
  let unsub;
  return {
    subscribe: (target, fn) => {
      if (unsub) {
        unsub();
      }
      unsub = target.subscribe(fn);
    }
  }
});

export const createWatcher = ((val) => {
  let prev = val;
  return {
    onChanged: (newVal, fn) => {
      if (newVal !== prev) {
        fn(newVal, prev);
        prev = newVal;
      }
    }
  }
});