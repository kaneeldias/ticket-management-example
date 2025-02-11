export type CreateEvent = {
    name: string;
    description: string;
    date: Date;
    location: string;
    ticketLimit: number;
    price: number;
}

export type CreateBooking = {
    eventId: string;
    userId: string;
}
