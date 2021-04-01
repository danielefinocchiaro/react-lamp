import React, { useState, useEffect } from 'react';

import _ from 'lodash/fp';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { v4 } from 'uuid';
import { map } from 'lodash';

interface Event {
  type:
    | 'LAMPADINA_ACCESA'
    | 'LAMPADINA_SPENTA'
    | 'CONTATORE_ACCESO'
    | 'CONTATORE_SPENTO'; // LAMPADINA_SPENTA O LAMPADINA_ACCESA;
  timestamp: Date;
  traceId: string;
  objId?: number;
}
interface Command {
  type:
    | 'ACCENDI_LAMPADINA'
    | 'SPEGNI_LAMPADINA'
    | 'ACCENDI_CONTATORE'
    | 'SPEGNI_CONTATORE';
  timestamp: Date;
  traceId: string;
  objId?: number;
}

// Reducer o Projector, legge tutti gli eventi e li proietta o riduce in uno stato.
function isLightOn(events: Event[], idObj: number): boolean {
  let LampadinaEvent = events.filter((event) => {
    return (
      (event.objId === idObj && event.type === 'LAMPADINA_SPENTA') ||
      event.type === 'LAMPADINA_ACCESA'
    );
  });
  //let ContatoreEvent = events.filter(isContatoreEvent);

  const lastEvent = LampadinaEvent[LampadinaEvent.length - 1];

  console.log('lamapda acceso ultimo evento', lastEvent);
  if (lastEvent === undefined) {
    return false;
  } else {
    return lastEvent.type === 'LAMPADINA_ACCESA';
  }
}

function isContatoreOn(events: Event[]): boolean {
  let ContatoreEvent = events.filter((event) => {
    return (
      event.type === 'CONTATORE_SPENTO' || event.type === 'CONTATORE_ACCESO'
    );
  });

  const lastEvent = ContatoreEvent[ContatoreEvent.length - 1];

  console.log('contatore acceso ultimo evento', lastEvent);
  if (lastEvent === undefined) {
    return false;
  } else {
    console.log('CONTATORE acceso', lastEvent.type === 'CONTATORE_ACCESO');
    return lastEvent.type === 'CONTATORE_ACCESO';
  }
}

function Button(props: {
  className?: string;
  title: string;
  onClick: () => void;
}) {
  const className = classNames(
    'px-2 py-1 cursor-pointer m-1 rounded',
    props.className,
  );
  return (
    <div className={className} onClick={props.onClick}>
      {props.title}
    </div>
  );
}

function Lampadina(props: { isTurnedOn: boolean }) {
  const className = classNames('m-1 text-center p-2 rounded bg-gray-300', {
    'bg-yellow-400': props.isTurnedOn,
  });
  return (
    <div className={className}>{props.isTurnedOn ? 'ACCESA' : 'SPENTA'}</div>
  );
}

function Contatore(props: {
  events: Event[];
  onClick: (
    type:
      | 'ACCENDI_LAMPADINA'
      | 'SPEGNI_LAMPADINA'
      | 'ACCENDI_CONTATORE'
      | 'SPEGNI_CONTATORE',
  ) => void;
}) {
  return (
    <div className="flex flex-col">
      <button
        onClick={() => console.log(isContatoreOn(props.events), props.events)}
      >
        Log
      </button>
      <Button
        className="bg-green-300 hover:bg-green-200"
        title="Accendi cont"
        onClick={() => props.onClick('ACCENDI_CONTATORE')}
      />
      <Button
        className="bg-red-300 hover:bg-red-200"
        title="Spegni cont"
        onClick={() => props.onClick('SPEGNI_CONTATORE')}
      />
    </div>
  );
}

//  UTENTE
//    |
//  invia
//    |
// COMANDO rappresenta l'intezione di dell'utente di interagire con il sistema  ====> [DB COMANDI] Write Store
//    |
//    |
// - [ LOGICA DI BUSINESS  ] -------------------------------------------------------------
//    |
//    |
// EVENTO rapprenta un cambiamento di stato già accaduto nel sistema   ====> [DB EVENTI] Read Store
//   |
//   |
// UTENTE vede il cambio di stato nel sistema

function useCommand() {
  const [commands, setCommands] = useState<Command[]>([]);

  function sendCommand(
    type:
      | 'ACCENDI_LAMPADINA'
      | 'SPEGNI_LAMPADINA'
      | 'ACCENDI_CONTATORE'
      | 'SPEGNI_CONTATORE',
    obj?: number,
  ) {
    // Scrivere sul db dei comandi, il comando che l'utente mi istruiscre.
    if (obj !== null) {
      setCommands((prev) => [
        ...prev,
        { type, timestamp: new Date(), traceId: v4(), objId: obj },
      ]);
    } else {
      setCommands((prev) => [
        ...prev,
        { type, timestamp: new Date(), traceId: v4() },
      ]);
    }
  }

  return { commands, sendCommand };
}

function useBusinessLogic(
  commands: Command[],
  events: Event[],
  emitEvent: (
    type:
      | 'LAMPADINA_ACCESA'
      | 'LAMPADINA_SPENTA'
      | 'CONTATORE_ACCESO'
      | 'CONTATORE_SPENTO',
    traceId: string,
  ) => void,
) {
  const [position, setPosition] = useState(-1);
  return () => {
    // Leggere i comandi che l'utente manda, gestice la logica applicative ed emettere gli eventi per i cambi di stato.
    commands.forEach((command, index) => {
      if (index > position) {
        //console.log('Eseguo comando', command);
        switch (command.type) {
          case 'ACCENDI_LAMPADINA':
            if (!isLightOn(events) && isContatoreOn(events)) {
              emitEvent('LAMPADINA_ACCESA', command.traceId);
            }
            break;
          case 'SPEGNI_LAMPADINA':
            if (isLightOn(events) && isContatoreOn(events)) {
              emitEvent('LAMPADINA_SPENTA', command.traceId);
            }
            break;
          case 'SPEGNI_CONTATORE':
            if (isContatoreOn(events)) {
              emitEvent('CONTATORE_SPENTO', command.traceId);
            }

            break;
          case 'ACCENDI_CONTATORE':
            if (!isContatoreOn(events)) {
              emitEvent('CONTATORE_ACCESO', command.traceId);
            }

            break;
        }
        // Quando finisco di leggere i comandi, aggiorno la position.
        setPosition(index);
      }
    });
  };
}

function useEvent() {
  const [events, setEvents] = useState<Event[]>([
    { type: 'CONTATORE_ACCESO', timestamp: new Date(), traceId: v4() },
  ]);

  function emitEvent(
    type:
      | 'LAMPADINA_ACCESA'
      | 'LAMPADINA_SPENTA'
      | 'CONTATORE_ACCESO'
      | 'CONTATORE_SPENTO',
    traceId?: string,
  ) {
    // Scrive sul db degli eventi, l'evento che il sistema ha emesso.
    setEvents((prev) => [
      ...prev,
      { type, timestamp: new Date(), traceId: traceId ?? v4() },
    ]);
  }

  return { events, emitEvent };
}

function Luce(props: {
  events: Event[];
  funCommand: (
    type:
      | 'ACCENDI_LAMPADINA'
      | 'SPEGNI_LAMPADINA'
      | 'ACCENDI_CONTATORE'
      | 'SPEGNI_CONTATORE',
  ) => void;
  idLamp: number;
}) {
  const isTurnedOn = isLightOn(props.events);

  return (
    <div className="flex flex-col">
      <Lampadina isTurnedOn={isTurnedOn} />

      <div className="flex">
        <Button
          className="bg-yellow-300 hover:bg-yellow-200"
          title="Accendi"
          onClick={() => props.funCommand('ACCENDI_LAMPADINA')}
        />
        <Button
          className="bg-gray-300 hover:bg-gray-200"
          title="Spegni"
          onClick={() => props.funCommand('SPEGNI_LAMPADINA')}
        />
      </div>
    </div>
  );
}

function App() {
  const { events, emitEvent } = useEvent();
  const { commands, sendCommand } = useCommand();

  const runBusinessLogic = useBusinessLogic(commands, events, emitEvent);

  useEffect(() => {
    runBusinessLogic();
  }, [commands]);

  let lamp = new Array(3);

  return (
    <>
      <Contatore events={events} onClick={sendCommand} />
      {lamp.fill([]).map((e, i) => {
        return <Luce events={events} funCommand={sendCommand} idLamp={i} />;
      })}

      <div className="flex flex-col m-1 mt-4">
        {events.map((e, i) => (
          <div key={i}>
            {e.type} - {e.timestamp.toString()}
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
