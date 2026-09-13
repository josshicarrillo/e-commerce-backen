export const toEventDTO = (event) => event;

export const toEventListDTO = (events = []) => events.map(toEventDTO);