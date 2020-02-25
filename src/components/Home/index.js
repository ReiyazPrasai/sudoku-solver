import React, { useState } from "react";
import { Button, Col, Form, Row } from "antd";

import "./App.css";
import SetNumber from "./SelectNumbersModal";

const FormItem = Form.Item;

let sudokuRow = [];

const BasicAddForm = props => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedBox, setSelectBox] = useState([]);

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  const boxIndex = (rowIndex, colIndex) => {
    let calIndex = colIndex < 3 ? 0 : colIndex > 5 ? 2 : 1;
    return [
      calIndex + (rowIndex - (rowIndex % 3)),
      (colIndex % 3) + (rowIndex % 3) * 3
    ];
  };

  for (let i = 0; i <= 8; i++) {
    sudokuRow[i] = [];
    for (let j = 0; j <= 8; j++) {
      sudokuRow[i][j] = getRandomInt(1, 10);
    }
  }
  const mapColElements = valueRow => {
    let sudokuCol = [];
    for (let colIndex = 0; colIndex <= 8; colIndex++) {
      sudokuCol[colIndex] = [];
      valueRow.forEach((item, index) => {
        sudokuCol[colIndex][index] = item[colIndex];
      });
    }
    return sudokuCol;
  };

  const handleOnMouseEnter = (rowIndex, colIndex) => {
    for (let i = 0; i < 9; i++) {
      document.getElementById(`el${rowIndex}${i}`).style.opacity = "0.7";
      document.getElementById(`el${i}${colIndex}`).style.opacity = "0.7";
      document.getElementById(`el${rowIndex}${colIndex}`).style.opacity = "0.8";
    }
  };

  const handleOnMouseLeave = (rowIndex, colIndex) => {
    for (let i = 0; i < 9; i++) {
      document.getElementById(`el${rowIndex}${i}`).style.opacity = "0.78";
      document.getElementById(`el${i}${colIndex}`).style.opacity = "0.78";
      document.getElementById(`el${rowIndex}${colIndex}`).style.opacity =
        "0.78";
    }
  };

  const converToBinary = n => {
    if (n < 0) {
      n = 0xffffffff + n + 1;
    }
    return parseInt(n, 10).toString(2);
  };

  const getAllIndexes = (arr, val) => {
    var indexes = [],
      i = -1;
    while ((i = arr.indexOf(val, i + 1)) !== -1) {
      indexes.push(i);
    }
    return indexes;
  };

  const makeSudokuBox = valueRow => {
    let sudokuBox = [];
    const mapBoxElements = (from, to, upperLimit, lowerLimit) => {
      var acc = [];
      var res = [];
      valueRow
        .filter((item, index) => index >= from && index < to && item)
        .forEach(i => {
          for (let z = upperLimit; z < lowerLimit; z++) {
            acc = acc.concat(i[z]);
          }
          res = res.concat(acc);
          acc = [];
        });
      return res;
    };

    let l = 0;
    let u = 3;
    let t = 0;
    let f = 3;
    for (let boxIndex = 0; boxIndex < 9; boxIndex++) {
      if (boxIndex === 3 || boxIndex === 6) {
        t += 3;
        f += 3;
      }
      sudokuBox = sudokuBox.concat([mapBoxElements(t, f, l, u)]);
      if (l !== 6 && u !== 9) {
        l += 3;
        u += 3;
      } else {
        l = 0;
        u = 3;
      }
    }
    return sudokuBox;
  };

  const handleOpenNumberPad = (rowIndex, colIndex) => {
    setSelectBox([rowIndex, colIndex]);
    setIsModalVisible(true);
  };

  const handleModalHide = () => {
    setIsModalVisible(false);
  };

  const checkForDuplicates = (number, rowIndex, colIndex) => {
    let rows = props.form.getFieldValue(`sudokuElement`);
    let col = mapColElements(rows);
    let box = makeSudokuBox(rows);
    if (number) {
      return (
        getAllIndexes(rows[rowIndex], number).length > 1 ||
        getAllIndexes(col[colIndex], number).length > 1 ||
        getAllIndexes(box[boxIndex(rowIndex, colIndex)[0]], number).length > 1
      );
    }
  };

  const checkIfExists = (number, rowIndex, colIndex) => {
    let rows = props.form.getFieldValue(`sudokuElement`);
    let col = mapColElements(rows);
    let box = makeSudokuBox(rows);
    if (number) {
      return (
        rows[rowIndex].includes(number) ||
        col[colIndex].includes(number) ||
        box[boxIndex(rowIndex, colIndex)[0]].includes(number)
      );
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    let finalSum = 0;
    let rowSum = [];
    let possibilities = [];
    let rows = props.form.getFieldValue("sudokuElement");
    let columns = mapColElements(rows);
    let boxes = makeSudokuBox(rows);
    props.form.validateFields((err, values) => {
      if (!err) {
        const solve = (mainRows, mainColumns, mainBoxes) => {
          setIsLoading(true);

          const calcSum = arr => {
            let sumArray = [];
            arr.forEach((item, index) => {
              let sum = 0;
              sum = item.reduce((acc, val) => {
                if (val === undefined) {
                  return acc + 0;
                }
                return acc + val;
              }, 0);
              sumArray[index] = sum;
            });
            return sumArray;
          };

          rowSum = calcSum(mainRows);
          finalSum = rowSum.reduce((acc, val) => {
            return acc + val;
          }, 0);
          var setValue = (bI, cI, rI, r, pn) => {
            let condition =
              !r?.includes(pn) &&
              !mainColumns?.includes(pn) &&
              !mainBoxes[bI]?.includes(pn);
            if (condition) {
              props.form.setFieldsValue({
                [`sudokuElement[${rI}][${cI}]`]: pn
              });
            }
          };
          var setConfirmedNumber = (boxIndex, colIndex, rowIndex, row) => {
            let possibleNumbers =
              row instanceof Array &&
              row
                ?.map((element, elementIndex) =>
                  !row.includes(elementIndex + 1) &&
                  !mainColumns[colIndex].includes(elementIndex + 1) &&
                  !mainBoxes[boxIndex].includes(elementIndex + 1)
                    ? elementIndex + 1
                    : 10
                )
                .filter(item => item !== 10);

            if (possibleNumbers.length === 1) {
              setValue(boxIndex, colIndex, rowIndex, row, possibleNumbers[0]);
            }
            return possibleNumbers;
          };
          mainRows.forEach((row, rowIndex) => {
            possibilities[rowIndex] = [];
            row.forEach((col, colIndex) => {
              possibilities[rowIndex][colIndex] = [];

              if (col === undefined) {
                if (rowIndex < 3 && colIndex < 3) {
                  possibilities[rowIndex][colIndex] = setConfirmedNumber(
                    0,
                    colIndex,
                    rowIndex,
                    row
                  );
                } else if (rowIndex < 3 && colIndex > 2 && colIndex < 6) {
                  possibilities[rowIndex][colIndex] = setConfirmedNumber(
                    1,
                    colIndex,
                    rowIndex,
                    row
                  );
                } else if (rowIndex < 3 && colIndex > 5 && colIndex < 9) {
                  possibilities[rowIndex][colIndex] = setConfirmedNumber(
                    2,
                    colIndex,
                    rowIndex,
                    row
                  );
                } else if (rowIndex > 2 && rowIndex < 6 && colIndex < 3) {
                  possibilities[rowIndex][colIndex] = setConfirmedNumber(
                    3,
                    colIndex,
                    rowIndex,
                    row
                  );
                } else if (
                  rowIndex > 2 &&
                  rowIndex < 6 &&
                  colIndex > 2 &&
                  colIndex < 6
                ) {
                  possibilities[rowIndex][colIndex] = setConfirmedNumber(
                    4,
                    colIndex,
                    rowIndex,
                    row
                  );
                } else if (
                  rowIndex > 2 &&
                  rowIndex < 6 &&
                  colIndex > 5 &&
                  colIndex < 9
                ) {
                  possibilities[rowIndex][colIndex] = setConfirmedNumber(
                    5,
                    colIndex,
                    rowIndex,
                    row
                  );
                } else if (rowIndex > 5 && rowIndex < 9 && colIndex < 3) {
                  possibilities[rowIndex][colIndex] = setConfirmedNumber(
                    6,
                    colIndex,
                    rowIndex,
                    row
                  );
                } else if (
                  rowIndex > 5 &&
                  rowIndex < 9 &&
                  colIndex > 2 &&
                  colIndex < 6
                ) {
                  possibilities[rowIndex][colIndex] = setConfirmedNumber(
                    7,
                    colIndex,
                    rowIndex,
                    row
                  );
                } else {
                  possibilities[rowIndex][colIndex] = setConfirmedNumber(
                    8,
                    colIndex,
                    rowIndex,
                    row
                  );
                }
              } else {
                possibilities[rowIndex][colIndex] = [col];
              }
            });
          });
          rows = props.form.getFieldValue("sudokuElement");
          columns = mapColElements(rows);
          boxes = makeSudokuBox(rows);
          rowSum = [];
        };

        let count = 40;

        while (finalSum !== 405 && count > 0) {
          count--;
          solve(rows, columns, boxes);
        }

        const firstIteration = rows;
        const firstPossibilities = possibilities;

        const solveByIteration = () => {
          let upperIsSet = true;
          for (let iterationCount = 0; iterationCount <= 15; iterationCount++) {
            let binaryArray = [];

            const binary = converToBinary(iterationCount);
            binaryArray = binary.split("");
            while (binaryArray.length !== 4) {
              binaryArray.unshift(0);
            }
            let reversedBinary = binaryArray.reverse();
            if (upperIsSet) {
              upperIsSet = false;
              reversedBinary.forEach((set, setIndex) => {
                let isSet = true;
                firstPossibilities.forEach((row, rowIndex) => {
                  row.forEach((col, colIndex) => {
                    if (
                      col.length === 2 &&
                      isSet &&
                      props.form.getFieldValue("sudokuElement")[rowIndex][
                        colIndex
                      ] === undefined
                    ) {
                      console.log(col);
                      isSet = false;
                      props.form.setFieldsValue({
                        [`sudokuElement[${rowIndex}][${colIndex}]`]: col[
                          parseInt(set)
                        ]
                      });

                      let count = 15;
                      while (count > 0) {
                        count--;
                        let currentRows = props.form.getFieldValue(
                          "sudokuElement"
                        );
                        solve(
                          currentRows,
                          mapColElements(currentRows),
                          makeSudokuBox(currentRows)
                        );
                      }
                    }
                  });
                });
              });
              if (finalSum !== 405) {
                props.form.setFieldsValue({
                  [`sudokuElement`]: firstIteration
                });
                upperIsSet = true;
                let count = 40;
                while (count > 0) {
                  count--;
                  let currentRows = firstIteration;
                  solve(
                    currentRows,
                    mapColElements(currentRows),
                    makeSudokuBox(currentRows)
                  );
                }
              }
            }
            console.log(iterationCount, finalSum);
          }
        };
        solveByIteration();

        setIsLoading(false);
      }
    });
  };

  return (
    <div className="App">
      <Form onSubmit={handleSubmit}>
        <div className="sudoku-table">
          <table>
            {sudokuRow.map((row, rowIndex) => (
              <tr
                className={"sudoku-row"}
                key={rowIndex}
                style={{ height: 80 }}
              >
                {row.map((col, colIndex) => (
                  <td
                    className={"sudoku-col"}
                    key={colIndex}
                    id={`el${rowIndex}${colIndex}`}
                    style={{
                      minWidth: 80,
                      background:
                        checkForDuplicates(
                          props.form.getFieldValue(
                            `sudokuElement[${rowIndex}][${colIndex}]`
                          ),
                          rowIndex,
                          colIndex
                        ) && "black"
                    }}
                    onMouseEnter={() => handleOnMouseEnter(rowIndex, colIndex)}
                    onMouseLeave={() => handleOnMouseLeave(rowIndex, colIndex)}
                  >
                    <div
                      style={{
                        height: 80,
                        minWidth: "100%"
                      }}
                    >
                      {
                        <FormItem style={{ width: 55 }}>
                          {props.form.getFieldDecorator(
                            `sudokuElement[${rowIndex}][${colIndex}]`,
                            {
                              initialValue:
                                rowIndex === 0 && colIndex === 2
                                  ? 6
                                  : rowIndex === 0 && colIndex === 8
                                  ? 8
                                  : rowIndex === 1 && colIndex === 0
                                  ? 4
                                  : rowIndex === 1 && colIndex === 4
                                  ? 6
                                  : rowIndex === 1 && colIndex === 5
                                  ? 1
                                  : rowIndex === 1 && colIndex === 8
                                  ? 2
                                  : rowIndex === 2 && colIndex === 5
                                  ? 2
                                  : rowIndex === 2 && colIndex === 6
                                  ? 6
                                  : rowIndex === 2 && colIndex === 7
                                  ? 4
                                  : rowIndex === 3 && colIndex === 0
                                  ? 9
                                  : rowIndex === 3 && colIndex === 2
                                  ? 3
                                  : rowIndex === 3 && colIndex === 4
                                  ? 5
                                  : rowIndex === 3 && colIndex === 7
                                  ? 2
                                  : rowIndex === 4 && colIndex === 0
                                  ? 1
                                  : rowIndex === 4 && colIndex === 2
                                  ? 5
                                  : rowIndex === 4 && colIndex === 6
                                  ? 4
                                  : rowIndex === 4 && colIndex === 8
                                  ? 7
                                  : rowIndex === 5 && colIndex === 1
                                  ? 4
                                  : rowIndex === 5 && colIndex === 4
                                  ? 9
                                  : rowIndex === 5 && colIndex === 6
                                  ? 1
                                  : rowIndex === 5 && colIndex === 8
                                  ? 5
                                  : rowIndex === 6 && colIndex === 1
                                  ? 6
                                  : rowIndex === 6 && colIndex === 2
                                  ? 4
                                  : rowIndex === 6 && colIndex === 3
                                  ? 3
                                  : rowIndex === 7 && colIndex === 0
                                  ? 7
                                  : rowIndex === 7 && colIndex === 3
                                  ? 8
                                  : rowIndex === 7 && colIndex === 4
                                  ? 1
                                  : rowIndex === 7 && colIndex === 8
                                  ? 4
                                  : rowIndex === 8 && colIndex === 0
                                  ? 8
                                  : rowIndex === 8 && colIndex === 6
                                  ? 7
                                  : undefined
                            }
                          )(
                            <div className={"individual-box"}>
                              <Button
                                style={{ width: 80, height: 80 }}
                                type="link"
                                onClick={() =>
                                  handleOpenNumberPad(rowIndex, colIndex)
                                }
                              >
                                <span
                                  className={"individual-box"}
                                  style={{
                                    color: checkForDuplicates(
                                      props.form.getFieldValue(
                                        `sudokuElement[${rowIndex}][${colIndex}]`
                                      ),
                                      rowIndex,
                                      colIndex
                                    )
                                      ? "red"
                                      : "white"
                                  }}
                                >
                                  {props.form.getFieldValue(
                                    `sudokuElement[${rowIndex}][${colIndex}]`
                                  )}
                                </span>
                              </Button>
                            </div>
                          )}
                        </FormItem>
                      }
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </table>
          <SetNumber
            selectedBox={selectedBox}
            isModalVisible={isModalVisible}
            hideModal={handleModalHide}
            {...props}
          />
        </div>
        <Row type="flex">
          <Col xl={24} lg={24} md={24} sm={24}>
            <FormItem>
              <Button
                loading={isLoading}
                className={"solve-button"}
                type="primary"
                htmlType="submit"
              >
                Solve
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default Form.create()(BasicAddForm);
