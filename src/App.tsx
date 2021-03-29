import React, { useState, useCallback } from 'react';
import _ from 'lodash/fp';
import classNames from 'classnames';

interface Event {
  status:
    | 'LAMPADINA_SPENTA'
    | 'LAMPADINA_ACCESA'
    | 'CONTATORE_SPENTO'
    | 'CONTATORE_ACCESO';
  timestamp: Date;
}

interface Command {
  command:
    | 'SPEGNI_LAMPADINA'
    | 'ACCENDI_LAMPADINA'
    | 'SPEGNI_GENERATORE'
    | 'ACCENDI_GENERATORE';
  timestamp: Date;
}

interface Button {
  onClick: () => void;
}

interface Counter {
  seconds: number;
}

/* function Counter(p: Counter) {
  return <div>Seconds in the last minute: {p.seconds}</div>;
}
 */
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

function BtnGeneratorOff(p: Button) {
  const style = classNames(
    'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500',
  );

  return (
    <button
      className={style}
      //disabled={state.status === 'started' ? true : false}
      onClick={() => p.onClick()}
    >
      Contatore OFF
    </button>
  );
}

function BtnGeneratorOn(p: Button) {
  const style = classNames(
    'px-3 py-2 mr-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-purple-500',
  );

  return (
    <button
      className={style}
      //disabled={state.status === 'started' ? true : false}
      onClick={() => p.onClick()}
    >
      Contatore ON
    </button>
  );
}

function Lampada(p: Event[]) {
  if (Object.keys(p).length > 0) {
    let actualStatus = p[Object.keys(p).length - 1];
    const style = classNames(
      'flex flex-grow justify-center h-20',
      actualStatus.status === 'LAMPADINA_ACCESA'
        ? 'bg-yellow-500'
        : 'bg-gray-500',
    );
    return <div className={style}>{actualStatus.status}</div>;
  } else {
    const style = classNames('flex flex-grow justify-center h-20 bg-gray-500');
    return <div className={style}></div>;
  }
}

function isLampadinaEvent(event: Event) {
  return (
    event.status === 'LAMPADINA_SPENTA' || event.status === 'LAMPADINA_ACCESA'
  );
}

function isContatoreEvent(event: Event) {
  return (
    event.status === 'CONTATORE_SPENTO' || event.status === 'CONTATORE_ACCESO'
  );
}

function App() {
  const [events, setEvents] = useState<Event[]>([
    { status: 'CONTATORE_ACCESO', timestamp: new Date() },
  ]);

  const [commands, setCommand] = useState<Command[]>([]);

  const setLightOn = useCallback(() => {
    let LampadinaEvent = events.filter(isLampadinaEvent);
    let ContatoreEvent = events.filter(isContatoreEvent);

    let actualStatusCont = ContatoreEvent[ContatoreEvent.length - 1];
    if (LampadinaEvent.length > 0) {
      let actualStatusLamp = LampadinaEvent[LampadinaEvent.length - 1];
      if (
        actualStatusLamp.status === 'LAMPADINA_SPENTA' &&
        actualStatusCont.status === 'CONTATORE_ACCESO'
      ) {
        setEvents([
          ...events,
          { status: 'LAMPADINA_ACCESA', timestamp: new Date() },
        ]);
      }
    } else {
      if (actualStatusCont.status === 'CONTATORE_ACCESO') {
        setEvents([
          ...events,
          { status: 'LAMPADINA_ACCESA', timestamp: new Date() },
        ]);
      }
    }
  }, [events]);

  const setLightOff = useCallback(() => {
    let LampadinaEvent = events.filter(isLampadinaEvent);
    let ContatoreEvent = events.filter(isContatoreEvent);

    let actualStatusCont = ContatoreEvent[ContatoreEvent.length - 1];
    if (LampadinaEvent.length > 0) {
      let actualStatusLamp = LampadinaEvent[LampadinaEvent.length - 1];
      if (
        actualStatusLamp.status === 'LAMPADINA_ACCESA' &&
        actualStatusCont.status === 'CONTATORE_ACCESO'
      ) {
        setEvents([
          ...events,
          { status: 'LAMPADINA_SPENTA', timestamp: new Date() },
        ]);
      }
    } else {
      if (actualStatusCont.status === 'CONTATORE_ACCESO') {
        setEvents([
          ...events,
          { status: 'LAMPADINA_SPENTA', timestamp: new Date() },
        ]);
      }
    }
  }, [events]);

  const setGenOff = useCallback(() => {
    let ContatoreEvent = events.filter(isContatoreEvent);

    let actualStatusCont = ContatoreEvent[ContatoreEvent.length - 1];

    if (actualStatusCont.status === 'CONTATORE_ACCESO') {
      setEvents([
        ...events,
        { status: 'CONTATORE_SPENTO', timestamp: new Date() },
      ]);
    }
  }, [events]);

  const setGenOn = useCallback(() => {
    let ContatoreEvent = events.filter(isContatoreEvent);

    let actualStatusCont = ContatoreEvent[ContatoreEvent.length - 1];

    if (actualStatusCont.status === 'CONTATORE_SPENTO') {
      setEvents([
        ...events,
        { status: 'CONTATORE_ACCESO', timestamp: new Date() },
      ]);
    }
  }, [events]);

  function doCommand(
    command:
      | 'SPEGNI_LAMPADINA'
      | 'ACCENDI_LAMPADINA'
      | 'SPEGNI_GENERATORE'
      | 'ACCENDI_GENERATORE',
  ) {
    switch (command) {
      case 'SPEGNI_LAMPADINA':
        setCommand([
          ...commands,
          { command: 'SPEGNI_LAMPADINA', timestamp: new Date() },
        ]);

        setLightOff();
        break;
      case 'ACCENDI_LAMPADINA':
        setCommand([
          ...commands,
          { command: 'ACCENDI_LAMPADINA', timestamp: new Date() },
        ]);

        setLightOn();
        break;
      case 'ACCENDI_GENERATORE':
        setCommand([
          ...commands,
          { command: 'ACCENDI_GENERATORE', timestamp: new Date() },
        ]);

        setGenOn();
        break;
      case 'SPEGNI_GENERATORE':
        setCommand([
          ...commands,
          { command: 'SPEGNI_GENERATORE', timestamp: new Date() },
        ]);

        setGenOff();
        break;
    }
  }

  return (
    <>
      <div className="flex-grow justify-evenly flex m-4">
        <BtnOn onClick={() => doCommand('ACCENDI_LAMPADINA')} />
        <BtnOff onClick={() => doCommand('SPEGNI_LAMPADINA')} />
        <button
          className="border border-black px-3 py-2 mr-2 rounded"
          onClick={() => {
            console.log(events, commands);
          }}
        >
          Log
        </button>
        <BtnGeneratorOn
          onClick={() => {
            doCommand('ACCENDI_GENERATORE');
          }}
        />
        <BtnGeneratorOff
          onClick={() => {
            doCommand('SPEGNI_GENERATORE');
          }}
        />
      </div>
      <Lampada {...events} />
      {/* <Counter seconds={seconds} /> */}
    </>
  );
}

export default App;
/*
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
  }, [events]); */
