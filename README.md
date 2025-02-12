# Ticket Management Example

Author: [Kaneel Dias](https://github.com/kaneeldias)

Last Updated: 2025-02-13

[![codecov](https://codecov.io/gh/kaneeldias/ticket-management-example/graph/badge.svg?token=7eoUkqqaOf)](https://codecov.io/gh/kaneeldias/ticket-management-example)

## 1. Introduction

This project is a simple example of a ticket management system. It is a RESTful API developed using Express
that allows users to:

* Create events
* Create bookings for events
    * If an event is sold out, the user will be added to a waiting list
* Cancel bookings
    * Once a booking is cancelled, the next person in the waiting list will be automatically booked
* View the details and status of events
    * Including the number of tickets available and the number of people in the waiting list

## 2. Content

- [1. Introduction](#1-introduction)
- [2. Content](#2-content)
- [3. Tech Stack](#3-tech-stack)
- [4. Additional Features](#4-additional-features)
- [5. Getting Started](#5-getting-started)
    - [5.1 Prerequisites](#51-prerequisites)
    - [5.2 Installation](#52-installation)
        - [5.2.1 Clone the repository](#521-clone-the-repository)
        - [5.2.2 Install dependencies](#522-install-dependencies)
        - [5.2.3 Set up the database](#523-set-up-the-database)
        - [5.2.4 Set up the environment variables](#524-set-up-the-environment-variables)
        - [5.2.5 Generate the Prisma client](#525-generate-the-prisma-client)
        - [5.2.6 Run the migrations](#526-run-the-migrations)
        - [5.2.7 Seed the database with example data (optional)](#527-seed-the-database-with-example-data-optional)
        - [5.2.8 Run the tests (optional)](#528-run-the-tests-optional)
        - [5.2.9 Start the server](#529-start-the-server)
    - [5.3 Usage](#53-usage)
- [6. Design choices](#6-design-choices)
    - [6.1 Database schema](#61-database-schema)
    - [6.2 Models](#62-models)
    - [6.3 Booking Manager & Mutexes](#63-booking-manager--mutexes)
    - [6.4 Event Emitters](#64-event-emitters)
    - [6.5 Rate Limiting](#65-rate-limiting)
    - [6.6 Error Handling](#66-error-handling)
    - [6.7 Logging](#67-logging)
    - [6.8 Testing](#68-testing)
    - [6.9 Code Coverage](#69-code-coverage)
    - [6.10 Continuous Integration](#610-continuous-integration)
  - [6.11 Authentication](#611-authentication-and-authorization)
- [7. API Documentation](#7-api-documentation)
    - [7.1 `POST /login`](#71-post-login-logs-in-a-user)
    - [7.2 `POST /initialize`](#72-post-initialize-creates-a-new-event)
    - [7.3 `POST /book`](#73-post-book-creates-a-new-booking)
    - [7.4 `POST /cancel`](#74-post-cancel-cancels-a-booking)
    - [7.5 `GET /status/:id`](#75-get-statusid-gets-the-details-and-bookings-status-for-an-event)

## 3. Tech Stack

* NodeJS and Express for the main server and API
* TypeScript for type safety
* PostgreSQL for data persistence
* Jest for testing
* Docker for containerization to simplify testing and deployment
* Prisma ORM for database operations
* GitHub Actions for continuous integration

## 4. Additional Features

In addition to the basic functionalities listed above, this project also includes:

* **Concurrency control** via the [`BookingManager`](./src/utils/BookingManager.ts) which ensures thread safety when
  creating and cancelling bookings ensuring that the system is always in a consistent state and avoiding race conditions
* A **user authentication system** that allows users to log in and be provided with a JWT token that can be used to
  access
  specific resources of the API
* Comprehensive **logging** of requests and errors via the [`Logger`](./src/utils/Logger.ts) class
* Comprehensive error handling using **custom error classes** and **middleware**
* Comprehensive testing using Jest with over 97% code coverage
    * Unit tests for most classes and functions
    * Integration tests for all endpoints
* **Continuous Integration** using GitHub Actions
* Docker **containerization** for easy testing and deployment
* **Rate limiting** using the `express-rate-limit` package
* Clear and concise **documentation** of all classes and methods using TSDoc comments
* Compliance with generally accepted **clean code** practices

## 5. Getting Started

### 5.1 Prerequisites

* Git (to clone the repository)
* NodeJS (this project was developed using v20.15.0)
* Docker (optional, for running the PostgreSQL database)
* A PostgreSQL database (optional, if you are not using Docker)

### 5.2 Installation

#### 5.2.1 Clone the repository

Clone this repository to your local machine using the following command:

```bash
git clone https://github.com/kaneeldias/ticket-management-example.git
```

#### 5.2.2 Install dependencies

Navigate to the project directory and install the required dependencies using the following command:

```bash
npm install
```

#### 5.2.3 Set up the database

If you are using Docker, you can run the following command from the project root directory to start a PostgreSQL
database container:

```bash
docker compose up -d
```

This command uses the [`docker-compose.yml`](./docker-compose.yml) file in the project root directory to start a
PostgreSQL database container
and expose it on port 5432.

If you are not using Docker, you can set up a PostgreSQL database on your local machine, or use a cloud-based service

#### 5.2.4 Set up the environment variables

Create a `.env` file in the project root directory and add the following environment variables:

* `PORT` - the port on which you want the API server to be running
* `DATABASE_URL` - the connection string for your PostgreSQL database
* `JWT_SECRET` - a secret key to be used for signing JWT tokens

Example .env file:

```dotenv
PORT=3000
DATABASE_URL=postgresql://ticket-booking:abcd@123@localhost:5432/ticket-booking?schema=public
JWT_SECRET=THIS_IS_AN_EXAMPLE_SECRET
```

#### 5.2.5 Generate the Prisma client

Run the following command to generate the Prisma client:

```bash
npx prisma generate
```

#### 5.2.6 Run the migrations

Run the following command to create the required tables in your database:

```bash
npx prisma migrate dev --name init
```

#### 5.2.7 Seed the database with example data (optional)

Run the following command to seed the database with example data:

```bash
npx prisma db seed
```

#### 5.2.8 Run the tests (optional)

Run the tests to ensure that everything is working as expected:

```bash
npx jest
```

#### 5.2.9 Start the server

Run the following command to start the API server:

```bash
npm start
```

### 5.3 Usage

Once the server is running, you can access the API using a tool like Postman or cURL.

The API has the following endpoints:

- [`POST /login`](#71-post-login-logs-in-a-user) - Logs in a user
- [`POST /initialize`](#72-post-initialize-creates-a-new-event) - Creates a new event
- [`POST /book`](#73-post-book-creates-a-new-booking) - Creates a new booking
- [`POST /cancel`](#74-post-cancel-cancels-a-booking) - Cancels a booking
- [`GET /status/:id`](#75-get-statusid-gets-the-details-and-bookings-status-for-an-event) - Gets the details and
  bookings status for an event

To access the protected endpoints, you will need to provide a JWT token in the `Authorization` header. You can obtain a
JWT token through the [`POST /login`](#71-post-login-logs-in-a-user) endpoint.

You can use the following credentials to log in as a sample user:

```
email: kaneeldias@gmail.com
password: abcd@123
```

This are the credentials for the seed user with the ID 1

cURL request to login and get a JWT token:

```bash
curl -X POST http://localhost:3000/login \
-H "Content-Type: application/json" \
-d '{
  "email": "kaneeldias@gmail.com",
  "password": "abcd@123"
}'
````

## 6. Design choices

### 6.1 Database schema

The schema for the database can be found in the [`schema.prism`](./prisma/schema.prisma) file in the `prisma` directory.

The schema includes the following tables:

- `User` - Stores information about users
- `Event` - Stores information about events
- `Booking` - Stores information about bookings

A `Booking` can have one of the following statuses:

- `CONFIRMED` - The booking is confirmed
- `PENDING` - The booking is pending (the event is sold out and the user is added to the waiting list)
- `CANCELLED` - The booking has been cancelled

The schema also includes relationships between the tables:

- A `User` can have multiple bookings
- An `Event` can have multiple bookings
- A `Booking` is associated with a user and an event

![ER Diagram](./assets/prisma-erd.svg)

### 6.2 Models

The models for the database tables can be found in the [`models`](./src/models) directory. Each model corresponds to a
table in the database and includes methods for interacting with the database.

- [`User.ts`](./src/models/User.ts) - Represents the `User` table
- [`Event.ts`](./src/models/Event.ts) - Represents the `Event` table
- [`Booking.ts`](./src/models/Booking.ts) - Represents the `Booking` table

Each instance of a model represents a row in the corresponding table in the database. The model methods can be used to
perform CRUD operations on the database.

### 6.3 Booking Manager & Mutexes

The [`BookingManager`](./src/utils/BookingManager.ts) class is responsible for managing bookings for events. It ensures
that the system is always in a consistent state by handling concurrency issues when creating and cancelling bookings.

This is achieved through the use of mutexes provided by the `async-mutex` package.

There are individual mutexes for each event and booking which are stored in `Map` objects.

```typescript
import { Mutex } from "async-mutex";

private eventMutexes = new Map<number, Mutex>();
private bookingMutexes = new Map<number, Mutex>();
```

When a user attempts to book a ticket for an event, the [`BookingManager`](./src/utils/BookingManager.ts) acquires a
lock on the event to prevent other users from booking tickets for the same event at the same time. Once the booking is
complete, the lock is released.

```typescript
//BookingManager Class
public async createBooking(userId: number, eventId: number): Promise<Booking> {
    await this.aquireEventMutex(eventId);
    try {
        // Make booking
    } finally {
        await this.releaseEventMutex(eventId);
    }
}
````

Similarly, when a user attempts to cancel a booking, the [`BookingManager`](./src/utils/BookingManager.ts) acquires a
lock on the booking to prevent other users from cancelling the same booking at the same time. Once the cancellation is
complete, the lock is released.

```typescript
//BookingManager Class
public async
cancelBooking(bookingId
:
number
):
Promise < Booking > {
    const booking = await Booking.getById(bookingId);
    const event = await booking.getEvent();
    
    await this.aquireEventMutex(event.getId());
    await this.aquireBookingMutex(bookingId);
    try {
        // Cancel booking
    } finally {
        await this.releaseBookingMutex(bookingId);
        await this.releaseEventMutex(event.getId());
    }
}
````

### 6.4 Event Emitters

The [`BookingManager`](./src/utils/BookingManager.ts) class also uses an event emitter to notify when a booking is or
cancelled. This emit is picked up by the same class to automatically book the next person in the waiting list.

```typescript
//Emitter
this.waitlistHandler.emit("trigger-waitlist-bump", {
    eventId: associatedEvent.getId(),
});

//Receiver
this.waitlistHandler.on("trigger-waitlist-bump", async (event) => {
    await this.bumpWaitlist(event.eventId);
});
```

### 6.5 Rate Limiting

The API uses the `express-rate-limit` middleware package to limit the number of requests that can be made to the API
within a
specified time frame.

### 6.6 Error Handling

The API uses [custom error classes](./src/errors) and middleware to handle errors.
The [`ErrorHandler`](./src/middleware/error-handler.ts) middleware class is responsible for catching errors and
returning
appropriate responses to the client.

The error handler catches expected errors such as validation errors and unauthorized access errors and returns the
appropriate
HTTP status code and error message. If the error is unexpected, the error handler returns a generic error message and a
500 status code.

### 6.7 Logging

The API uses the [`Logger`](./src/middleware/logger.ts) middleware to log requests and errors. The logger logs the
HTTP method, URL, status code, and response time for each request. It also logs any errors that occur during the
request.
It also logs the request body and response body for each request along with the timestamp.

Each request is tagged with a unique request ID that is included in the log messages for that request. This allows the
logs for a single request to be easily identified and correlated.

Logs can be disabled by setting the `LOGGING_ENABLED` environment variable to `false`.

### 6.8 Testing

The API has comprehensive test coverage using Jest. The tests can be found in the [`__tests__`](./__tests__) directory.
The tests include unit tests for most classes and functions and integration tests for all endpoints.

The tests can be run using the following command:

```bash
jest
```

The test cases make use of mocking to mock external dependencies such as the database and the `prisma` client.
This allows the tests to run in isolation and ensures that they are not affected by external factors.

In addition, the test script creates a PostgreSQL database container using Docker and runs the tests against this
database. This ensures that the tests are run against a consistent environment and that the database is reset between
each test run.

### 6.9 Code Coverage

[![codecov](https://codecov.io/gh/kaneeldias/ticket-management-example/graph/badge.svg?token=7eoUkqqaOf)](https://codecov.io/gh/kaneeldias/ticket-management-example)

This project uses codecov to track code coverage. The code coverage report can be
found [here](https://codecov.io/gh/kaneeldias/ticket-management-example).

The code coverage report is integrated with GitHub Actions ([codecov.yaml](./.github/workflows/codecov.yaml)), so that
the code coverage is checked on every push to the main branch in the repository.

![codecoverage on OR](./assets/codecov-pr.png)

The code coverage report shows that the project has over 97% code coverage, with all classes and functions being tested.

### 6.10 Continuous Integration

This project uses GitHub Actions for continuous integration. The CI workflow can be found in
the [`.github/workflows/pull-request.yaml`](./.github/workflows/pull-request.yaml) file.

The CI workflow runs the following steps on every pull request:

- Installs Node.js
- Installs dependencies
- Builds the project
- Runs the unit tests
- Runs the integration tests

The CI workflow ensures that the project builds successfully and that all tests pass before merging a pull request.

### 6.11 Authentication and authorization

The API uses JWT tokens for authentication. When a user logs in, a JWT token is generated and returned to the client.
The client can then include this token in the `Authorization` header of subsequent requests to access protected
endpoints.

> This project does **not** store passwords securely in the database. Passwords are stored in plaintext.

The API uses the `jsonwebtoken` package to generate and verify JWT tokens. The JWT token includes the user's ID and
email address.

## 7. API Documentation

### 7.1 `POST /login` Logs in a user

Logs in a user and returns a JWT token that can be used to access protected endpoints.

Request body:

- `username` (string) - The username of the user
- `password` (string) - The password of the user

Example request body:

```json
{
  "username": "user1",
  "password": "password"
}
```

Example cURL request:

```bash
curl -X POST http://localhost:3000/login \
-H "Content-Type: application/json" \
-d '{
  "email": "kaneeldias@gmail.com",
  "password": "abcd@123"
}'
````

Response body:

- `token` (string) - The JWT token that can be used to access protected endpoints

Example response body:

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJrYW5lZWxkaWFzQGdtYWlsLmNvbSIsImlhdCI6MTczOTM5NjMwNCwiZXhwIjoxNzM5Mzk5OTA0fQ.GoIkaXl3QN5rAE3ynyrq5GuXDCFLu5JIlLordOrl7So"
}
```

### 7.2 `POST /initialize` Creates a new event

Creates a new event with the specified details.

Headers:

- `Authorization` - A JWT token that is required to access this endpoint

Request body:

- `name` (string) - The name of the event
- `description` (string) - A description of the event
- `date` (string) - The date of the event in the format `YYYY-MM-DD`
- `location` (string) - The location of the event
- `ticketLimit` (integer) - The maximum number of tickets that can be sold for the event
- `price` (float) - The price of each ticket

Example request body:

```json
{
  "name": "New Years Eve Party",
  "description": "A night of fun and games",
  "date": "2021-12-31",
  "location": "Colombo",
  "ticketLimit": 1,
  "price": 1000
}
```

Example cURL request:

```bash
curl -X POST http://localhost:3000/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: <token>" \
  -d '{
    "name": "New Years Eve Party",
    "description": "A night of fun and games",
    "date": "2021-12-31",
    "location": "Colombo",
    "ticketLimit": 1,
    "price": 1000
  }'
```

Response body:

- message (string) - A message indicating that the event was created successfully
- event (object) - The details of the event that was created
    - event.id (integer) - The ID of the event
    - event.name (string) - The name of the event
    - event.description (string) - A description of the event
    - event.date (string) - The date of the event in the format `YYYY-MM-DD`
    - event.location (string) - The location of the event
    - event.ticketLimit (integer) - The maximum number of tickets that can be sold for the event
    - event.price (float) - The price of each ticket

Example response body:

```json
{
  "message": "Event created successfully",
  "event": {
    "id": 1,
    "name": "New Year's Eve Party",
    "description": "A night of fun and games",
    "date": "2021-12-31",
    "location": "Colombo",
    "ticketLimit": 1,
    "price": 1000
  }
}
```

### 7.3 `POST /book` Creates a new booking

Creates a new booking for an event for the specified user.

- If the event is sold out, the user will be added to the waiting list.
- If the user is already booked for the event (or in the waiting list), an error will be returned.
- If the user is now authorized to book a ticket for the provided `userId`, an error will be returned.

Headers:

- `Authorization` - A JWT token that is required to access this endpoint

Request body:

- `eventId` (integer) - The ID of the event for which the booking is being made
- `userId` (integer) - The ID of the user making the booking

Example request body:

```json
{
  "eventId": 1,
  "userId": 1
}
```

Example cURL request:

```bash
curl -X POST http://localhost:3000/book \
  -H "Content-Type: application/json" \
  -H "Authorization: <token>"
    -d '{
        "eventId": 1,
        "userId": 1
    }'
```

Response body:

- `message` (string) - A message indicating that the booking was created successfully
- `booking` (object) - The details of the booking that was created
    - `booking.id` (integer) - The ID of the booking
    - `booking.eventId` (integer) - The ID of the event for which the booking was made
    - `booking.userId` (integer) - The ID of the user who made the booking
    - `booking.status` (string) - The status of the booking (`CONFIRMED` or `WAITING`)

Example response body:

```json
{
  "message": "Ticket booked successfully successfully",
  "booking": {
    "id": 1,
    "eventId": 1,
    "userId": 1,
    "status": "CONFIRMED"
  }
}
```

If the user was added to the wait list

```json
{
  "message": "Event is sold out. User added to wait list",
  "booking": {
    "id": 1,
    "eventId": 1,
    "userId": 1,
    "status": "PENDING"
  }
}
```

### 7.4 `POST /cancel` Cancels a booking

Cancels a booking for an event for the specified user.

- If the user is not booked for the event, an error will be returned.
- If the user does not have a booking for the event, an error will be returned.
- If the user does not have the authorization to cancel the booking, an error will be returned.
- Upon the successful cancellation of a booking, the next person in the waiting list will be automatically booked.

Headers:

- `Authorization` - A JWT token that is required to access this endpoint

Request body:

- `eventId` (integer) - The ID of the event for which the booking is being cancelled

Example request body:

```json
{
  "eventId": 1
}
```

Example cURL request:

```bash
curl -X POST http://localhost:3000/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: <token>"
    -d '{
        "id": 1
    }'
```

Response body:

- `message` (string) - A message indicating that the booking was cancelled successfully
- `booking` (object) - The details of the booking that was cancelled
    - `booking.id` (integer) - The ID of the booking
    - `booking.eventId` (integer) - The ID of the event for which the booking was made
    - `booking.userId` (integer) - The ID of the user who made the booking
    - `booking.status` (string) - The status of the booking (`CANCELLED`)

Example response body:

```json
{
  "message": "Booking cancelled successfully",
  "booking": {
    "id": 1,
    "eventId": 1,
    "userId": 1,
    "status": "CANCELLED"
  }
}
```

### 7.5 `GET /status/:id` Gets the details and bookings status for an event

Gets the details of an event and the status of the bookings for that event.

Headers:

- `Authorization` - A JWT token that is required to access this endpoint

Request parameters:

- `id` (integer) - The ID of the event for which the details are being requested

Example cURL request:

```bash
curl -X GET http://localhost:3000/status/1
```

Response body:

- `event` (object) - The details of the event
    - `event.id` (integer) - The ID of the event
    - `event.name` (string) - The name of the event
    - `event.description` (string) - A description of the event
    - `event.date` (string) - The date of the event in the format `YYYY-MM-DD`
    - `event.location` (string) - The location of the event
    - `event.ticketLimit` (integer) - The maximum number of tickets that can be sold for the event
    - `event.price` (float) - The price of each ticket
- `ticketsAvailable` (integer) - The number of tickets available for the event
- `waitingListCount` (integer) - The number of people in the waiting list for the event

Example response body:

```json
{
  "event": {
    "id": 1,
    "name": "Concert",
    "description": "Live music concert",
    "date": "2024-05-20T00:00:00.000Z",
    "location": "New York",
    "ticketLimit": 500,
    "price": 50
  },
  "ticketsAvailable": 499,
  "waitingListCount": 0
}
```
