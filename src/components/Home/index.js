import React, { useState } from "react";
import { Button, Col, Form, Row, Icon } from "antd";

import "./App.css";
import SetNumber from "./SelectNumbersModal";
import {
  getLocalStorage,
  setLocalStorage,
  clearLocalStorage
} from "../../utils/storageUtil";

const FormItem = Form.Item;

let sudokuRow = [];

const BasicAddForm = props => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState([])
  const {
    getFieldDecorator,
    getFieldValue,
    setFieldsValue,
    resetFields,
    validateFields
  } = props.form;

  const [selectedBox, setSelectBox] = useState([]);

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
      sudokuRow[i][j] = [];
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
    let rows = getFieldValue(`sudokuElement`);
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

  const checkIfExists = (number, row, column, box) => {
    if (number) {
      return (
        !row.includes(number) &&
        !column.includes(number) &&
        !box.includes(number)
      );
    }
  };

  const comparePreviousIteration = (count, array) => {
    if (count < 20) {
      let currentValue = JSON.stringify(array);
      let previousValue = JSON.stringify(getLocalStorage("previousValue"));
      setLocalStorage("previousValue", array);
      return currentValue === previousValue;
    }
    setLocalStorage("previousValue", array);
  };

  const handleSubmit = e => {
    e.preventDefault();
    let finalSum = 0;
    let rowSum = [];
    let possibilities = [];
    let rows = getFieldValue("sudokuElement");
    setRows(rows);
    let columns = mapColElements(rows);
    let boxes = makeSudokuBox(rows);
    validateFields((err, values) => {
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
            if (checkIfExists(pn, r, mainColumns[cI], mainBoxes[bI])) {
              setFieldsValue({
                [`sudokuElement[${rI}][${cI}]`]: pn
              });
            }
          };
          var setConfirmedNumber = (boxIndex, colIndex, rowIndex, row) => {
            let possibleNumbers =
              row instanceof Array &&
              row
                ?.map((element, elementIndex) =>
                  checkIfExists(
                    elementIndex + 1,
                    row,
                    mainColumns[colIndex],
                    mainBoxes[boxIndex]
                  )
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
                let calIndex = colIndex < 3 ? 0 : colIndex > 5 ? 2 : 1;
                let boxIndex = calIndex + (rowIndex - (rowIndex % 3));
                possibilities[rowIndex][colIndex] = setConfirmedNumber(
                  boxIndex,
                  colIndex,
                  rowIndex,
                  row
                );
              } else {
                possibilities[rowIndex][colIndex] = [col];
              }
            });
          });
          rows = getFieldValue("sudokuElement");
          columns = mapColElements(rows);
          boxes = makeSudokuBox(rows);
          rowSum = [];
        };

        let count = 20;

        while (finalSum !== 405 && count > 0) {
          if (comparePreviousIteration(count, rows)) {
            break;
          }
          count--;
          solve(rows, columns, boxes);
        }

        const firstIteration = rows;
        const firstPossibilities = possibilities;

        const solveByIteration = () => {
          let upperIsSet = true;
          for (let iterationCount = 0; iterationCount <= 31; iterationCount++) {
            let binaryArray = [];

            const binary = converToBinary(iterationCount);
            binaryArray = binary.split("");
            while (binaryArray.length !== 5) {
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
                      getFieldValue("sudokuElement")[rowIndex][colIndex] ===
                        undefined
                    ) {
                      isSet = false;
                      setFieldsValue({
                        [`sudokuElement[${rowIndex}][${colIndex}]`]: col[
                          parseInt(set)
                        ]
                      });

                      let count = 20;
                      while (count > 0) {
                        count--;
                        let currentRows = getFieldValue("sudokuElement");
                        if (comparePreviousIteration(count, currentRows)) {
                          break;
                        }
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
              if (finalSum === 405) {
                break;
              }
              setFieldsValue({
                [`sudokuElement`]: firstIteration
              });
              upperIsSet = true;
              let count = 20;
              while (count > 0) {
                count--;
                let currentRows = firstIteration;
                if (comparePreviousIteration(count, currentRows)) {
                  break;
                }
                solve(
                  currentRows,
                  mapColElements(currentRows),
                  makeSudokuBox(currentRows)
                );
              }
            }
          }
        };
        solveByIteration();
        clearLocalStorage("previousValue");
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="App">
      <Form onSubmit={handleSubmit}>
        <div className="sudoku-table">
          <table>
            <tbody>
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
                            getFieldValue(
                              `sudokuElement[${rowIndex}][${colIndex}]`
                            ),
                            rowIndex,
                            colIndex
                          ) && "black"
                      }}
                      onMouseEnter={() =>
                        handleOnMouseEnter(rowIndex, colIndex)
                      }
                      onMouseLeave={() =>
                        handleOnMouseLeave(rowIndex, colIndex)
                      }
                    >
                      <div
                        style={{
                          height: 80,
                          minWidth: "100%"
                        }}
                      >
                        {
                          <FormItem style={{ width: 55 }}>
                            {getFieldDecorator(
                              `sudokuElement[${rowIndex}][${colIndex}]`,
                              {

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
                                        getFieldValue(
                                          `sudokuElement[${rowIndex}][${colIndex}]`
                                        ),
                                        rowIndex,
                                        colIndex
                                      )
                                        ? "red"
                                        : "white"
                                    }}
                                  >
                                    {getFieldValue(
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
            </tbody>
          </table>
          <SetNumber
            selectedBox={selectedBox}
            setRows={setRows}
            isModalVisible={isModalVisible}
            hideModal={handleModalHide}
            {...props}
          />
        </div>
        <Row type="flex">
          <Col xl={12} lg={24} md={24} sm={24}>
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
          <Col xl={12} lg={24} md={24} sm={24}>
            <FormItem>
              <Button
                className={"solve-button"}
                type="primary"
                onClick={() => resetFields()}
              >
                clear
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div className={"undo"}>
        <Button
          className={"undo-button"}
          type="primary"
          onClick={() =>{console.log(rows)}
            // setFieldsValue({
            //   [`sudokuElement`]: rows
            // })

          }
        >
          <Icon style={{ marginBottom: 10 }} type="undo" />
        </Button>
      </div>
    </div>
  );
};

export default Form.create()(BasicAddForm);
