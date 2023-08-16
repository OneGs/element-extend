const createMap = () => Object.create(null);

const includes = (arrOrStr, elem) => {
  return arrOrStr.indexOf(elem) !== -1;
};

const quickDiff = (arrA, arrB) => {
  if (arrA.length !== arrB.length) return true;

  for (let i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) return true;
  }

  return false;
};

const sortValueByIndex = (a, b) => {
  let i = 0;
  do {
    if (a.level < i) return -1;
    if (b.level < i) return 1;
    if (a.index[i] !== b.index[i]) return a.index[i] - b.index[i];
    i++;
    /* eslint-disable*/
  } while (true);
};

const sortValueByLevel = (a, b) => {
  return a.level === b.level ? sortValueByIndex(a, b) : a.level - b.level;
};

const shadowArrayCopy = (arr) => {
  return arr.reduce((result, item) => {
    result.push({...item})
    return result
  }, [])
}

const fuzzysearch = (needle, haystack) => {
  var tlen = haystack.length;
  var qlen = needle.length;
  if (qlen > tlen) {
    return false;
  }
  if (qlen === tlen) {
    return needle === haystack;
  }
  outer: for (var i = 0, j = 0; i < qlen; i++) {
    var nch = needle.charCodeAt(i);
    while (j < tlen) {
      if (haystack.charCodeAt(j++) === nch) {
        continue outer;
      }
    }
    return false;
  }
  return true;
}

const match = (enableFuzzyMatch, needle, haystack) => {
  return enableFuzzyMatch
    ? fuzzysearch(needle, haystack)
    : includes(haystack, needle);
}

const stringifyOptionPropValue = (value) => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && !isNaN(value)) return value + '';
  // istanbul ignore next
  return '';
}

export { 
  createMap, 
  includes, 
  sortValueByLevel, 
  sortValueByIndex, 
  quickDiff, 
  shadowArrayCopy, 
  fuzzysearch, 
  match,
  stringifyOptionPropValue,
 };
