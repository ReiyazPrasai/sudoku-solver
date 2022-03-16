import React, { useState, useRef, useEffect } from "react";

import "./box.css";
import { getUsedValues } from "../../utils";

const VALID_BACKGROUND = "linear-gradient(135deg, aqua, turquoise)";
const INVALID_BACKGROUND = "grey";

const Box = (props: any) => {
  const { id, setValues, index, setFocus, values } = props;
  const [isActive, setIsActive] = useState<boolean>(false);

  let ref = useRef<HTMLDivElement>(null);

  const setNewValues = (callBack: (previousValues: any) => any) => {
    setValues((pv: any) => ({
      ...pv,
      [id]: callBack(pv[id]),
    }));
  };

  const handleClick = () => {
    !isActive ? ref.current?.focus() : ref.current?.blur();
    !isActive && setNewValues((e) => ({ ...e, previous: e.current }));
    setIsActive(!isActive);

    let grid = id.split(",");
    let row = grid[0].match(new RegExp(/[0-9]/))?.[0];
    let col = grid[1].match(new RegExp(/[0-9]/))?.[0];

    !isActive ? setFocus({ r: Number(row), c: Number(col) }) : setFocus(null);
  };

  const handleKeyUp = (e: any) => {
    e.stopPropagation();
    if (e.key == values[id]?.previous) return;
    let _values = getUsedValues(values, id);
    if (e.key === "Escape" || e.key === "Enter") {
      ref.current?.blur();
      e.key === "Escape" &&
        setNewValues((pv) => {
          return {
            ...pv,
            current: pv.previous,
          };
        });
      setFocus(null);
      return setIsActive(false);
    }
    if (e.key === "Backspace" || e.key === "0") {
      return setNewValues((pv) => ({
        ...values[id],
        current: null,
        background: VALID_BACKGROUND,
      }));
    }
    if (isNaN(Number(e.key))) return;
    return setNewValues((pv) => ({
      ...pv,
      current: Number(e.key),
      background: _values.includes(Number(e.key))
        ? INVALID_BACKGROUND
        : VALID_BACKGROUND,
    }));
  };

  const setNewFocus = (prop: any, moveValue: number) => {
    setFocus((e: any) => {
      if (e[prop] + moveValue < 0 || e[prop] + moveValue > 8) return e;
      ref.current?.blur();

      return { ...e, [prop]: e[prop] + moveValue };
    });
  };

  const moveFocus = (key: string) => {
    const allowedKeys = ["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"];
    if (allowedKeys.includes(key)) {
      if (key === "ArrowUp") {
        setNewFocus("r", -1);
      }
      if (key === "ArrowDown") {
        setNewFocus("r", 1);
      }
      if (key === "ArrowLeft") {
        setNewFocus("c", -1);
      }
      if (key === "ArrowRight") {
        setNewFocus("c", 1);
      }

      setIsActive(false);
    }
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.onfocus = () => {
        setNewValues((e) => ({
          ...e,
          previous: e.current,
        }));
      };
    }
  }, [ref.current]);

  useEffect(() => {
    if (!values[id]) {
      setNewValues((e) => ({
        current: null,
        previous: null,
        background: VALID_BACKGROUND,
      }));
    } else if (values[id].current) {
      setNewValues((e) => {
        if (e.previous && e.previous === values[id].current) return e;
        return { ...e, previous: e.current, current: values[id].current };
      });
    }
  }, [values[id]]);

  return (
    <div
      ref={ref}
      onKeyUp={handleKeyUp}
      onKeyDown={(e) => {
        e.stopPropagation();
        moveFocus(e.key);
      }}
      className="box"
      key={id}
      id={id}
      tabIndex={index}
      onClick={handleClick}
      style={{ background: values[id]?.background }}
    >
      {values[id]?.current}
    </div>
  );
};

export default React.memo(Box);
