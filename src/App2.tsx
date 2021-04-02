import React, { useState, useEffect } from 'react';

import _ from 'lodash/fp';
import classNames from 'classnames';
import { v4 } from 'uuid';

interface Event {
  type:
    | 'LAMPADINA_ACCESA'
    | 'LAMPADINA_SPENTA'
    | 'CONTATORE_ACCESO'
    | 'CONTATORE_SPENTO';
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
      event.objId === idObj &&
      (event.type === 'LAMPADINA_SPENTA' || event.type === 'LAMPADINA_ACCESA')
    );
  });

  const lastEvent = LampadinaEvent[LampadinaEvent.length - 1];

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

  if (lastEvent === undefined) {
    return false;
  } else {
    return lastEvent.type === 'CONTATORE_ACCESO';
  }
}

function Luce(props: {
  events: Event[];
  doCommand: (
    type:
      | 'ACCENDI_LAMPADINA'
      | 'SPEGNI_LAMPADINA'
      | 'ACCENDI_CONTATORE'
      | 'SPEGNI_CONTATORE',
    idObj: number,
  ) => void;
  idLamp: number;
}) {
  const isTurnedOn = isLightOn(props.events, props.idLamp);
  const isTurnedOnCont = isContatoreOn(props.events);
  return (
    <div className="flex flex-col">
      <Lampadina isTurnedOn={isTurnedOn} isTurnedOnCont={isTurnedOnCont} />

      <div className="flex">
        <Button
          className="bg-yellow-300 hover:bg-yellow-200"
          title="Accendi"
          onClick={() => props.doCommand('ACCENDI_LAMPADINA', props.idLamp)}
        />
        <Button
          className="bg-gray-300 hover:bg-gray-200"
          title="Spegni"
          onClick={() => props.doCommand('SPEGNI_LAMPADINA', props.idLamp)}
        />
      </div>
    </div>
  );
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

function Lampadina(props: { isTurnedOn: boolean; isTurnedOnCont: boolean }) {
  const className = classNames('m-1 text-center p-2 rounded bg-gray-300', {
    'bg-yellow-400': props.isTurnedOn && props.isTurnedOnCont,
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
    setCommands((prev) => [
      ...prev,
      { type, timestamp: new Date(), traceId: v4(), objId: obj },
    ]);
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
    idObj?: number,
  ) => void,
) {
  const [position, setPosition] = useState(-1);
  return () => {
    // Leggere i comandi che l'utente manda, gestice la logica applicative ed emettere gli eventi per i cambi di stato.
    commands.forEach((command, index) => {
      if (index > position) {
        switch (command.type) {
          case 'ACCENDI_LAMPADINA':
            if (!isLightOn(events, command.objId) && isContatoreOn(events)) {
              emitEvent('LAMPADINA_ACCESA', command.traceId, command.objId);
            }
            break;
          case 'SPEGNI_LAMPADINA':
            if (isLightOn(events, command.objId) && isContatoreOn(events)) {
              emitEvent('LAMPADINA_SPENTA', command.traceId, command.objId);
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
    idObj?: number,
  ) {
    // Scrive sul db degli eventi, l'evento che il sistema ha emesso.
    setEvents((prev) => [
      ...prev,
      { type, timestamp: new Date(), traceId: traceId ?? v4(), objId: idObj },
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

  let lamp = new Array(3);

  return (
    <>
      <Contatore events={events} onClick={sendCommand} />
      {lamp.fill([]).map((e, i) => {
        return (
          <Luce events={events} doCommand={sendCommand} idLamp={i} key={i} />
        );
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
