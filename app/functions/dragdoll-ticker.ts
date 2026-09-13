import { ticker } from 'dragdoll'

// dragdoll's shared ticker keeps requesting animation frames from the moment
// the module is imported, even with nothing to drag. Tick only while a drag
// with auto-scroll is listening.
ticker.onDemand = true
