import React, { useState, useReducer } from 'react';
import arrayMove from 'array-move';
import classNames from 'classnames';
import _ from 'lodash/fp';

import * as Icons from 'heroicons-react';

import faker from 'faker';

interface P {}

interface Button {
  text: string;
  onClick: () => void;
}

interface Data {
  name: string;
  favorite: boolean;
}

interface Element {
  btnUp: Button;
  btnDown: Button;
  btnRemove: Button;
  btnFavorite: () => void;
  data: Data;
  index: number;
}

function ButtonAction(props: Button) {
  const style = classNames(
    'm-1 cursor-pointer rounded p-1',
    props.text === 'Remove' ? 'bg-red-300' : 'bg-green-300',
  );
  return (
    <div className={style} onClick={props.onClick}>
      {props.text}
    </div>
  );
}

function Element(props: Element) {
  const styleElement = classNames(
    'flex items-center mx-1',
    props.data.favorite ? 'bg-yellow-200' : '',
  );
  console.log(props.data);
  return (
    <div className={styleElement}>
      <div className="flex-grow">{props.data.name}</div>
      <Icons.StarOutline
        onClick={props.btnFavorite}
        className="cursor-pointer"
      />
      <ButtonAction {...props.btnUp} />
      <ButtonAction {...props.btnDown} />
      <ButtonAction {...props.btnRemove} />
    </div>
  );
}

interface action {
  type: string;
  index: number;
}

function reducer(state: Data[], action: action) {
  switch (action.type) {
    case 'MoveUp':
      if (action.index !== 0) {
        return arrayMove(state, action.index, action.index - 1);
      }
      break;
    case 'MoveDown':
      if (action.index !== state.length) {
        return arrayMove(state, action.index, action.index + 1);
      }
      break;
    case 'Remove':
      return state.filter((p, i) => i != action.index);
    case 'Add':
      let person = { name: faker.name.findName(), favorite: false };
      let newState = [...state, person];
      return newState;
    case 'Favorite':
      return _.update(
        `${action.index}.favorite`,
        (prev: boolean) => !prev,
        state,
      );
  }
  return state;
}

function App(props: P) {
  let peopleArr = new Array(20).fill({}).map(() => ({
    name: faker.name.findName(),
    favorite: false,
  }));

  const [people, dispatch] = useReducer(reducer, peopleArr);

  return (
    <div className="flex flex-col">
      {people.map((p: Data, i: number) => {
        return (
          <Element
            data={p}
            index={i}
            btnFavorite={() => dispatch({ type: 'Favorite', index: i })}
            btnUp={{
              text: 'Up',
              onClick: () => dispatch({ type: 'MoveUp', index: i }),
            }}
            btnDown={{
              text: 'Down',
              onClick: () => dispatch({ type: 'MoveDown', index: i }),
            }}
            btnRemove={{
              text: 'Remove',
              onClick: () => dispatch({ type: 'Remove', index: i }),
            }}
            key={i}
          />
        );
      })}
      <div
        className="m-1 cursor-pointer bg-blue-300 rounded p-1"
        onClick={() => dispatch({ type: 'Add', index: 0 })}
      >
        Add
      </div>
    </div>
  );
}

export default App;
