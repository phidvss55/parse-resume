const __chunk = (array: any[], size = 1): any[] => {
  if (!Array.isArray(array) || !array.length) {
    return [];
  }

  let result: any = [];
  let index = 0;

  while (index < array.length) {
    result.push(array.slice(index, (index += size)));
  }

  return result;
};

export { __chunk };
