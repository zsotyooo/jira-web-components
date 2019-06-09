export const processText = (text) => {
  const matches = /\[JIRA\:([A-Z]+\-[0-9]+)\]/gi.exec(text);
  if (!matches) {
    return text;
  } else {
    text = text.replace(matches[0], `<jira-issue-tag key="${matches[1]}"></jira-issue-tag>`)
  }
  return processText(text);
}