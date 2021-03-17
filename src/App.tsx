import React, { useState, useReducer, useEffect } from 'react';
import _ from 'lodash/fp';
import classNames from 'classnames';

interface State {
  status: 'stopped' | 'started' | 'paused';
  seconds: number;
  laps: number[];
}

interface Action {
  type: 'START' | 'STOP' | 'PAUSE' | 'RESET' | 'LAP' | 'UPDATE';
  payload?: {};
}

function App() {
  const [pauseEffect, setPauseEffect] = useState('Pause');
  const [state, dispatch] = useReducer(reducer, {
    status: 'stopped',
    seconds: 0,
    laps: new Array().fill(0),
  });

  function reducer(state: State, payload: Action): State {
    switch (payload.type) {
      case 'START':
        return { ...state, seconds: state.seconds, status: 'started' };
      case 'STOP':
        console.log(state);
        return { ...state, seconds: state.seconds, status: 'stopped' };
      case 'PAUSE':
        if (pauseEffect === 'Pause') {
          setPauseEffect('Play');
          return { ...state, status: 'paused' };
        } else {
          setPauseEffect('Pause');
          return { ...state, status: 'started' };
        }
      case 'RESET':
        return { status: 'stopped', laps: [], seconds: 0 };
      case 'LAP':
        return { ...state, laps: [...state.laps, state.seconds], seconds: 0 };
      case 'UPDATE':
        return { ...state, seconds: state.seconds + 1 };
    }
  }

  useEffect(() => {
    if (state.status === 'paused') {
      console.log('pausa');
      return;
    }

    if (state.status === 'stopped') {
      console.log('stoppato');
      return;
    }

    const counter = setInterval(() => {
      dispatch({ type: 'UPDATE' });
    }, 1000);

    return () => clearInterval(counter);
  }, [state]);

  interface Button {
    onClick: () => void;
    text?: string;
  }

  function BtnStart(p: Button) {
    const style = classNames(
      'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-green-500',
    );

    return (
      <button
        className={style}
        disabled={state.status === 'started' ? true : false}
        onClick={p.onClick}
      >
        {p.text}
      </button>
    );
  }

  function BtnStop(p: Button) {
    const style = classNames(
      'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-red-500',
    );

    return (
      <button
        className={style}
        disabled={state.status === 'stopped' ? true : false}
        onClick={p.onClick}
      >
        Stop
      </button>
    );
  }

  function BtnPause(p: Button) {
    const style = classNames(
      'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500',
    );

    return (
      <button
        className={style}
        disabled={state.status === 'stopped' ? true : false}
        onClick={p.onClick}
      >
        {p.text}
      </button>
    );
  }

  function BtnReset(p: Button) {
    const style = classNames(
      'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500',
    );

    return (
      <button
        className={style}
        disabled={state.status === 'stopped' ? true : false}
        onClick={p.onClick}
      >
        {p.text}
      </button>
    );
  }

  function BtnLap(p: Button) {
    const style = classNames(
      'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed',
      p.text === 'Stop' ? 'bg-red-500' : 'bg-yellow-500',
    );

    return (
      <button
        className={style}
        disabled={state.status === 'stopped' ? true : false}
        onClick={p.onClick}
      >
        {p.text}
      </button>
    );
  }

  return (
    <>
      <div className="flex m-4">
        <BtnStart text="Start" onClick={() => dispatch({ type: 'START' })} />
        <BtnStop text="Stop" onClick={() => dispatch({ type: 'STOP' })} />
        <BtnPause
          onClick={() => dispatch({ type: 'PAUSE' })}
          text={pauseEffect}
        />
        <BtnReset text="Reset" onClick={() => dispatch({ type: 'RESET' })} />
        <BtnLap text="Lap" onClick={() => dispatch({ type: 'LAP' })} />
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
    </>
  );
}

export default App;
