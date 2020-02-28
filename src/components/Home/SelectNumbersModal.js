import React, { Fragment, useState } from "react";

import { Button, Checkbox, Form, Modal, Row, Input, Icon } from "antd";
import { setLocalStorage } from "../../utils/storageUtil";

const FormItem = Form.Item;

const SetNumber = props => {
  const { isModalVisible, hideModal, selectedBox, setRows } = props;
  const {getFieldValue, setFieldsValue} = props.form
  let numbers = [];
  let count = 1;
  let right = 0;

  if (selectedBox[1] > 5) {
    right = '-27%';
  } else if (selectedBox[1] < 3) {
    right = '27%';
  } else {
      right = 12
  }
  for (let i = 0; i < 3; i++) {
    numbers[i] = [];
    for (let j = 0; j < 3; j++) {
      numbers[i][j] = count;
      count++;
    }
  }

  const handleSetNumber = number => {
    setFieldsValue({
      [`sudokuElement[${selectedBox[0]}][${selectedBox[1]}]`]: number
    });
    // setRows([...getFieldValue("sudokuElement")])
    hideModal();
  };

  return (
    <Modal
      width="12.5%"
      closable={false}
      onOk={hideModal}
      onCancel={hideModal}
      visible={isModalVisible}
      style={{ top: '35%', right: right }}
      footer={false}
    >
      <div>
        <table>
          {numbers.map(item => (
            <tr>
              {item.map(number => (
                <td>
                  <Button
                    className={"numbers"}
                    style={{ marginTop: 2 }}
                    type="link"
                    htmlType="submit"
                    onClick={() => handleSetNumber(number)}
                  >
                    {number}
                  </Button>
                </td>
              ))}
            </tr>
          ))}
        </table>
        <div>
          <Button
            className={"numbers"}
            style={{ marginTop: 2, marginLeft: 84 }}
            type="link"
            htmlType="submit"
            onClick={() => handleSetNumber(undefined)}
          >
            <Icon style={{ marginBottom: 10 }} type="close" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default SetNumber;
