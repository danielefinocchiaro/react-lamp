import React, { useState, useReducer, useEffect } from 'react';
import _ from 'lodash/fp';
import classNames from 'classnames';

interface P {}

function App(props: P) {
  const [timer, setTimer] = useState(0);
  const [pause, setPause] = useState(true);
  const [stop, setStop] = useState(false);
  const [laps, setLaps] = useState<string[]>([]);
  const [state, setState] = useState('stop');

  interface Button {
    onClick: () => void;
    text?: string;
  }

  function newLap() {
    let str = `Lap ${laps.length}: ${timer} seconds!`;
    const newLaps = [...laps, str];
    setLaps(newLaps);
    setTimer(0);
  }

  function BtnStart(p: Button) {
    const style = classNames(
      'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-green-500',
    );

    return (
      <button
        className={style}
        disabled={state === 'start' ? true : false}
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
        disabled={state === 'stop' ? true : false}
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
    console.log(p.text);
    return (
      <button
        className={style}
        disabled={state === 'stop' ? true : false}
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
        disabled={state === 'stop' ? true : false}
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
        disabled={state === 'stop' ? true : false}
        onClick={p.onClick}
      >
        {p.text}
      </button>
    );
  }

  useEffect(() => {
    console.log(state === 'stop' ? true : false);
    if (pause) {
      return;
    }

    if (stop) {
      setTimer(0);
    }

    const counter = setInterval(() => {
      setTimer((s) => s + 1);
    }, 1000);

    return () => clearInterval(counter);
  }, [pause]);

  const [pauseEffect, setPauseEffect] = useState('Pause');
  return (
    <>
      <div className="flex m-4">
        <BtnStart
          text="Start"
          onClick={() => {
            setPause((p) => !p);
            setState('start');
          }}
        />
        <BtnStop
          text="Stop"
          onClick={() => {
            setPause((p) => !p);
            setStop((s) => !s);
            setState('stop');
          }}
        />
        <BtnPause
          onClick={() => {
            setPause((p) => !p);
            if (pauseEffect === 'Pause') {
              setPauseEffect('Play');
            } else {
              setPauseEffect('Pause');
            }
          }}
          text={pauseEffect}
        />
        <BtnReset
          text="Reset"
          onClick={() => {
            setPause(true);
            setTimer(0);
            setState('stop');
          }}
        />
        <BtnLap text="Lap" onClick={() => newLap()} />
      </div>
      <div className="p-4">Timer: {timer} seconds!</div>
      <div>LAP:</div>
      <div>
        {laps.map((lap, i) => {
          return <div key={i}>{lap}</div>;
        })}
      </div>
    </>
  );
}

export default App;
