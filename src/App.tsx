import React, {
  useState,
  useReducer,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import _ from 'lodash/fp';
import classNames from 'classnames';
import type { Dispatch } from 'react';

interface State {
  status: 'stopped' | 'started' | 'paused';
  seconds: number;
  laps: number[];
}

interface Action {
  type: 'START' | 'STOP' | 'PAUSE' | 'RESET' | 'LAP' | 'UPDATE';
  payload?: {};
}

interface Context {
  state: State;
  dispatch: Dispatch<Action>;
}

function useMyCustomHook() {
  const reducerFunction = useCallback(
    (state: State, payload: Action): State => {
      switch (payload.type) {
        case 'START':
          if (state.status === 'stopped') {
            return { ...state, seconds: 0, status: 'started' };
          } else {
            return { ...state, seconds: state.seconds, status: 'started' };
          }
        case 'STOP':
          return { ...state, seconds: state.seconds, status: 'stopped' };
        case 'PAUSE':
          if (state.status === 'paused') {
            return { ...state, status: 'started' };
          } else {
            return { ...state, status: 'paused' };
          }
        case 'RESET':
          return { ...state, status: 'stopped', laps: [], seconds: 0 };
        case 'LAP':
          return { ...state, laps: [...state.laps, state.seconds], seconds: 0 };
        case 'UPDATE':
          return { ...state, seconds: state.seconds + 1 };
      }
    },
    [],
  );
  const [state, dispatch] = useReducer(reducerFunction, {
    status: 'stopped',
    seconds: 0,
    laps: new Array().fill(0),
  });

  useEffect(() => {
    if (state.status === 'paused') {
      return;
    }

    if (state.status === 'stopped') {
      return;
    }

    const counter = setInterval(() => {
      dispatch({ type: 'UPDATE' });
    }, 1000);

    return () => clearInterval(counter);
  }, [state.status]);

  return {
    state,
    dispatch,
  };
}

function BtnLap() {
  const { state, dispatch } = useContext(StateContext);
  const style = classNames(
    'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed',
    'bg-yellow-500',
  );

  return (
    <button
      className={style}
      disabled={state.status === 'stopped' ? true : false}
      onClick={() => dispatch({ type: 'LAP' })}
    >
      Lap
    </button>
  );
}
function BtnStart() {
  const { state, dispatch } = useContext(StateContext);
  const style = classNames(
    'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-green-500',
  );

  return (
    <button
      className={style}
      disabled={state.status === 'started' ? true : false}
      onClick={() => dispatch({ type: 'START' })}
    >
      Start
    </button>
  );
}

function BtnStop() {
  const { state, dispatch } = useContext(StateContext);

  const style = classNames(
    'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-red-500',
  );

  return (
    <button
      className={style}
      disabled={state.status === 'stopped' ? true : false}
      onClick={() => dispatch({ type: 'STOP' })}
    >
      Stop
    </button>
  );
}

function BtnPause() {
  const { state, dispatch } = useContext(StateContext);

  const style = classNames(
    'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500',
  );

  return (
    <button
      className={style}
      disabled={state.status === 'stopped' ? true : false}
      onClick={() => dispatch({ type: 'PAUSE' })}
    >
      {state.status === 'paused' ? 'Play' : 'Pause'}
    </button>
  );
}

function BtnReset() {
  const { state, dispatch } = useContext(StateContext);

  const style = classNames(
    'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500',
  );

  return (
    <button
      className={style}
      disabled={state.status === 'stopped' ? true : false}
      onClick={() => dispatch({ type: 'RESET' })}
    >
      Reset
    </button>
  );
}

const StateContext = React.createContext<Context>({
  state: {
    status: 'stopped',
    seconds: 0,
    laps: new Array().fill(0),
  },
  dispatch: () => {},
});

function App() {
  const { state, dispatch } = useMyCustomHook();
  return (
    <>
      <StateContext.Provider value={{ state, dispatch }}>
        <div className="flex m-4">
          <BtnStart />
          <BtnStop />
          <BtnPause />
          <BtnReset />
          <BtnLap />
        </div>
        <div className="p-4">Timer: {state.seconds} seconds!</div>
        <div>LAP:</div>
        <div>
          {state.laps.map((lap, i) => {
            return (
              <div key={i}>
                Lap {i + 1}: {lap} seconds!
              </div>
            );
          })}
        </div>
      </StateContext.Provider>
    </>
  );
}

export default App;
