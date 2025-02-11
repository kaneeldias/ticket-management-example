export type EventType = {
    id: string;
    name: string;
    description: string;
    date: Date;
    location: string;
    ticketLimit: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export type CreateEvent = {
    name: string;
    description: string;
    date: Date;
    location: string;
    ticketLimit: number;
    price: number;
}