import express from "express";
import { createEvent, getEventStatus } from "./routes/event";
import { cancelBooking, createBooking } from "./routes/booking";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/logger";
import { rateLimiter } from "./middleware/rate-limiter";
import { login } from "./routes/auth";
import { verifyLoggedIn } from "./middleware/auth";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to log requests
app.use(requestLogger);

// Middleware to rate limit requests
app.use(rateLimiter);

/**
 * Logs in a user with the given email and password.
 * Returns a JWT token if successful.
 */
app.post("/login", login);

/**
 * Initializes an event with the given name and ticket count.
 * Only logged-in users can initialize events.
 *
 * Returns the event details if successful.
 */
app.post("/initialize", verifyLoggedIn, createEvent);

/**
 * Books a ticket for the given user with the given event
 * Only logged-in users can book tickets.
 * The logged-in user must be the same as the user for whom the ticket is being booked.
 * If the event is full, the user will be added to the waitlist.
 * If the user already has a ticket for the event, the booking will be rejected.
 * If the user is already on the waitlist, the booking will be rejected.
 *
 * Returns the booking details if successful.
 */
app.post("/book", verifyLoggedIn, createBooking);

/**
 * Cancels the booking for the given user with the given event
 * Only logged-in users can cancel bookings.
 * The logged-in user must be the same as the user for whom the booking is being canceled.
 *
 * Returns the booking details if successful.
 */
app.post("/cancel", verifyLoggedIn, cancelBooking);

/**
 * Retrieves the status of the event with the given ID.
 * It is not necessary to be logged in to check the status of an event.
 *
 * Returns the event as well as the number of tickets available and number of people in the waiting list.
 */
app.get("/status/:eventId", getEventStatus);

//Error handling middleware
app.use(errorHandler);

app.listen(process.env.PORT || 3000);
