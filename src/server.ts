import express from "express";
import { createEvent, getEventStatus } from "./routes/event";
import { cancelBooking, createBooking } from "./routes/booking";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/logger";
import { rateLimiter } from "./middleware/rate-limiter";
import { login } from "./routes/auth";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to log requests
app.use(requestLogger);

// Middleware to rate limit requests
app.use(rateLimiter);

app.post("/login", login);

app.post("/initialize", createEvent);
app.post("/book", createBooking);
app.post("/cancel", cancelBooking);
app.get("/status/:eventId", getEventStatus);

//Error handling middleware
app.use(errorHandler);

app.listen(process.env.PORT || 3000);
