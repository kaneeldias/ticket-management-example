import express from 'express';
import {createEvent} from "./route-handlers/event-handlers";
import {cancelBooking, createBooking} from "./route-handlers/booking-handlers";
import {errorHandler} from "./route-handlers/error-handlers";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json())

// Routes
app.post("/initialize", createEvent);
app.post('/book',  createBooking);
app.post('/cancel',  cancelBooking);

//Error handling middleware
app.use(errorHandler);

app.listen(3000);