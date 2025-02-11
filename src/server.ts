import express from 'express';
import {createEvent, getEventStatus} from "./routes/event";
import {cancelBooking, createBooking} from "./routes/booking";
import {errorHandler} from "./middleware/error-handler";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json())

// Routes
app.post("/initialize", createEvent);
app.post('/book',  createBooking);
app.post('/cancel',  cancelBooking);
app.get('status/:eventId', getEventStatus);

//Error handling middleware
app.use(errorHandler);

app.listen(3000);