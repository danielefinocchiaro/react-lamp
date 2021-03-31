import React, { useState, useEffect } from 'react';

import _ from 'lodash/fp';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { v4 } from 'uuid';

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
function isLightOn(events: Event[]): boolean {
  const lastEvent = events.reverse().find((elem) => {
    return elem.type === 'LAMPADINA_ACCESA' || elem.type === 'LAMPADINA_SPENTA';
  });
  console.log('lamapda acceso ultimo evento', lastEvent);
  if (lastEvent === undefined) {
    return false;
  } else {
    return lastEvent.type === 'LAMPADINA_ACCESA';
  }
}

function isContatoreOn(events: Event[]): boolean {
  const lastEvent = events.find((elem) => {
    return elem.type === 'CONTATORE_ACCESO' || elem.type === 'CONTATORE_SPENTO';
  });
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

function App() {
  const { events, emitEvent } = useEvent();
  const { commands, sendCommand } = useCommand();

  const runBusinessLogic = useBusinessLogic(commands, events, emitEvent);

  useEffect(() => {
    runBusinessLogic();
  }, [commands]);

  const isTurnedOn = isLightOn(events);

  return (
    <>
      <div className="flex flex-col">
        <button onClick={() => console.log(isContatoreOn(events), events)}>
          Log
        </button>
        <Button
          className="bg-green-300 hover:bg-green-200"
          title="Accendi cont"
          onClick={() => sendCommand('ACCENDI_CONTATORE')}
        />
        <Button
          className="bg-red-300 hover:bg-red-200"
          title="Spegni cont"
          onClick={() => sendCommand('SPEGNI_CONTATORE')}
        />
      </div>
      <div className="flex flex-col">
        <Lampadina isTurnedOn={isTurnedOn} />

        <div className="flex">
          <Button
            className="bg-yellow-300 hover:bg-yellow-200"
            title="Accendi"
            onClick={() => sendCommand('ACCENDI_LAMPADINA')}
          />
          <Button
            className="bg-gray-300 hover:bg-gray-200"
            title="Spegni"
            onClick={() => sendCommand('SPEGNI_LAMPADINA')}
          />
        </div>

        {/* <Lampadina isTurnedOn={isTurnedOn} />

        <div className="flex">
          <Button
            className="bg-yellow-300 hover:bg-yellow-200"
            title="Accendi"
            onClick={() => sendCommand('ACCENDI_LAMPADINA')}
          />
          <Button
            className="bg-gray-300 hover:bg-gray-200"
            title="Spegni"
            onClick={() => sendCommand('SPEGNI_LAMPADINA')}
          />
        </div> */}

        <div className="flex flex-col m-1 mt-4">
          {events.map((e) => (
            <div>
              {e.type} - {e.timestamp.toString()}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
