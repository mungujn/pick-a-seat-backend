# Pick a seat backend

[![Build Status](https://travis-ci.com/mungujn/pick-a-seat-backend.svg?branch=master)](https://travis-ci.com/mungujn/pick-a-seat-backend)

Backend for a web app for reserving seats. The web app code is available [here](https://www.github.com/mungujn/pick-a-seat-frontend)

The system is built around express.js app declared in the app.js file. The actual server is in the service.js file. This separation helps with testing.
The Express app exposes two endpoints; '/pick-a-seat' and '/check-seat-states'. From the naming, you can see that this is not a REST API.

The '/pick-a-seat' endpoint is hit to select a seat. The endpoint takes a json object with a table number and seat number plus an email addressa and ticket number to validate that the user reserving the seat has permission to do so.

The '/check-seat-states' endpoint takes a table number and returns an array with occupancy details for that table.
