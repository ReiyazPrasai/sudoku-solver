export const quadrantIndex = (rowIndex: number, colIndex: number) => {
  let calIndex = colIndex < 3 ? 0 : colIndex > 5 ? 2 : 1;
  return calIndex + (rowIndex - (rowIndex % 3));
};

export const createGrid = () => {
  let grid = [];
  for (let j = 0; j <= 8; j++) {
    grid[j] = [];
    for (let k = 0; k <= 8; k++) {
      grid[j] = [...grid[j], `r${j},c${k},q${quadrantIndex(j, k)}`];
    }
  }
  return grid;
};

export const condition = (
  key: string,
  _id: string,
  _values: any,
  gridId: string[],
  isSolve: boolean = false
) => {
  let _temp = isSolve ? true : _values[key].current && key !== _id;

  return (
    (key.includes(gridId[0]) ||
      key.includes(gridId[1]) ||
      key.includes(gridId[2])) &&
    _temp
  );
};

export const getUsedValues = (_values: any, _id: string, isSolve?: boolean) => {
  let gridId = _id.split(",");

  return Object.keys(_values).reduce((acc: number[], val) => {
    if (condition(val, _id, _values, gridId, isSolve)) {
      acc = [...acc, _values[val].current];
    }
    let result: any = new Set(acc);
    return [...result];
  }, []);
};

const ALL_POSSIBILITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const checkAllPossibilities = (prevValues: any, memo: any = {}): any => {
  const _values = prevValues;
  const possibilities: any = { ...memo };
  let _possibilities: any = {};
  for (let key in _values) {
    if (!_values[key].current) {
      possibilities[key] = (possibilities[key] || ALL_POSSIBILITIES).filter(
        (e: number) => !getUsedValues(prevValues, key, true).includes(e)
      );

      if (possibilities[key].length === 1) {
        _values[key] = { ..._values[key], current: possibilities[key][0] };
      } else if (possibilities[key].length === 2) {
        _possibilities = {
          ..._possibilities,
          [possibilities[key]]: {
            [key]: possibilities[key],
            count: (_possibilities[possibilities[key]]?.count || 0) + 1,
            _key: key,
          },
        };
      }
    }
  }
  if (
    JSON.stringify(possibilities) === JSON.stringify(memo) ||
    !Object.values(_values).includes(null)
  ) {
    return { _values, possibilities: getHighestPossibilities(_possibilities) };
  }
  return checkAllPossibilities(_values, { ...possibilities });
};

const getHighestPossibilities = (obj: any) => {
  let maxCount = 0;
  let result: any = {};
  for (let key in obj) {
    if (maxCount < obj[key].count) {
      maxCount = obj[key].count;
      result = obj[key];
    }
  }
  return { key: result._key, value: result[result._key] };
};
