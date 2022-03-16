import { useState, useMemo, memo, SyntheticEvent } from "react";

import "./grid.css";
import Box from "../box";
import data from "./values.json";
import { useFocus } from "../../useFocus";
import { checkAllPossibilities, createGrid } from "../../utils";

const SudokuGrid = () => {
  const { setFocus } = useFocus();
  const [values, setValues] = useState<any>(data);

  let grid = useMemo(createGrid, []);

  const handleSolve = (e: SyntheticEvent) => {
    e.preventDefault();
    // console.log(JSON.stringify(values));
    let _count = 0;
    const solve = (
      valueObj: any = {},
      indexList: any = { isReitarated: false, list: "" },
      count: number = 81
    ): any => {
      const { _values, possibilities } = checkAllPossibilities(valueObj);
      if (possibilities.value && possibilities.key) {
        valueObj = {
          ..._values,
          [possibilities.key]: {
            ...valueObj[possibilities.key],
            current: !indexList.isReitarated
              ? possibilities.value[0]
              : possibilities.value[Number(indexList.list.charAt(count))],
          },
        };
        if (!indexList.isReitarated) {
          indexList.list += "0";
        }

        return solve(
          { ...valueObj },
          { isReitarated: indexList.isReitarated, list: indexList.list },
          (count -= 1)
        );
      }
      _count += 1;
      if (
        Object.values(valueObj).filter((e: any) => e.current).length !== 81 &&
        _count <= 50
      ) {
        let list = (parseInt(indexList.list, 2) + 1).toString(2);

        return solve(
          { ...values },
          { isReitarated: true, list: list },
          (count = list.length - 1)
        );
      }
      return valueObj;
    };
    let test = { ...solve({ ...values }) };
    setValues(test);
  };

  return (
    <div className={"page-wrapper"}>
      <div className="grid-container">
        {grid.map((row: Array<string>, index: number) => (
          <div key={index} id={`r${index}`} className="j-c">
            {row.map((col: string, colIndex: number) => (
              <div id={`r${index},c${colIndex}`} key={col}>
                <Box
                  id={col}
                  index={colIndex}
                  setValues={setValues}
                  setFocus={setFocus}
                  values={values}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <button className="solve-button" onClick={handleSolve}>
        Solve
      </button>
    </div>
  );
};

export default memo(SudokuGrid);
