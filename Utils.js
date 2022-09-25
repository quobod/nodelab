const stringify = (arg) => JSON.stringify(arg);
const parser = (arg) => JSON.parse(arg);
const cls = () => console.clear();

module.exports = {
  stringify,
  parser,
  cls,
};
