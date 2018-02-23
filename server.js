'use strict';

const express = require('express');
const app = express();

app.use(express.static('public'));

// if server.js is called directly (aka, with `node server.js`), this block runs.
// but we also export the runServer command so other code (for instance, test code) can start the server as needed.
// When we open this file in order to import app and runServer in a test module, 
// we don't want the server to automatically run, and this conditional block makes that possible.

if (require.main === module) {
    app.listen(process.env.PORT || 8080, function () {
        console.info(`App is listening on ${this.address().port}`);
    });
}

// let server;

// function runServer() {
//     const port = process.env.PORT || 8080;
//     return new Promise((resolve, reject) => {
//         server = app.listen(port, () => {
//             console.log(`Your app is listening on port ${port}`);
//             resolve(server);
//         }).on('error', err => {
//             reject(err);
//         });
//     });
// }

// function closeServer() {
//     return new Promise((resolve, reject) => {
//         console.log('Closing server!');
//         server.close(err => {
//             if(err) {
//                 reject(err);
//                 return;
//             }
//             resolve();
//         });
//     });
// }

module.exports = {app};