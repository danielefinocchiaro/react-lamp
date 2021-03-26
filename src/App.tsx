import React, {
  useState,
  useReducer,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import _ from 'lodash/fp';
import classNames from 'classnames';

interface Event {
  status: 'LAMPADINA_SPENTA' | 'LAMPADINA_ACCESA';
  timestamp: Date;
}

interface Button {
  onClick: () => void;
}

interface Counter {
  seconds: number;
}

function Counter(p: Counter) {
  return <div>Seconds in the last minute: {p.seconds}</div>;
}

function BtnOff(p: Button) {
  const style = classNames(
    'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-red-500',
  );

  return (
    <button
      className={style}
      //disabled={state.status === 'stopped' ? true : false}
      onClick={() => p.onClick()}
    >
      Spento
    </button>
  );
}

function BtnOn(p: Button) {
  const style = classNames(
    'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-green-500',
  );

  return (
    <button
      className={style}
      //disabled={state.status === 'started' ? true : false}
      onClick={() => p.onClick()}
    >
      Acceso
    </button>
  );
}

function Lampada(p: Event[]) {
  let actualStatus = p[Object.keys(p).length - 1];
  const style = classNames(
    'flex flex-grow justify-center h-20',
    actualStatus.status === 'LAMPADINA_ACCESA'
      ? 'bg-yellow-500'
      : 'bg-gray-500',
  );
  return <div className={style}>{actualStatus.status}</div>;
}

function App() {
  const [events, setEvents] = useState<Event[]>([
    { status: 'LAMPADINA_SPENTA', timestamp: new Date() },
  ]);
  const [seconds, setSeconds] = useState<number>(0);

  const setLightOn = useCallback(() => {
    let actualStatus = events[events.length - 1];
    if (actualStatus.status === 'LAMPADINA_SPENTA') {
      setEvents([
        ...events,
        { status: 'LAMPADINA_ACCESA', timestamp: new Date() },
      ]);
    }
  }, [events]);

  const setLightOff = useCallback(() => {
    let actualStatus = events[events.length - 1];
    if (actualStatus.status === 'LAMPADINA_ACCESA') {
      setEvents([
        ...events,
        { status: 'LAMPADINA_SPENTA', timestamp: new Date() },
      ]);
    }
  }, [events]);

  function isLastMinute(event: Event) {
    let actualDate = new Date();
    if (
      event.timestamp.getTime() > actualDate.getTime() - 60000 &&
      event.status === 'LAMPADINA_ACCESA'
    )
      return event;
  }

  useEffect(() => {
    const counter = setInterval(() => {
      let lastMinute = events.filter(isLastMinute);
      if (lastMinute.length > 0) {
        console.log(lastMinute);
        let actualDate = new Date();
        let dif = actualDate.getTime() - lastMinute[0].timestamp.getTime();
        var differenceBetween = Math.floor(dif / 1000);
        setSeconds(differenceBetween);
      } else {
        setSeconds(0);
      }
    }, 1000);

    return () => clearInterval(counter);
  }, [events]);

  return (
    <>
      <div className="flex-grow justify-center flex m-4">
        <BtnOn onClick={() => setLightOn()} />
        <BtnOff onClick={() => setLightOff()} />
        <button
          onClick={() => {
            console.log(events);
          }}
        >
          aaa
        </button>
      </div>
      <Lampada {...events} />
      <Counter seconds={seconds} />
    </>
  );
}

export default App;
