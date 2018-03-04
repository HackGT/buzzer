// This is to avoid using the 'dom' types when one dependency (supertest) needs it.

// error TS2304: Cannot find name 'XMLHttpRequest'
declare interface XMLHttpRequest {}
// error TS2304: Cannot find name 'Blob'
declare interface Blob {}
