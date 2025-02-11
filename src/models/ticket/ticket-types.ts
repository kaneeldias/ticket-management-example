import {User} from "../user/user-types";
import {EventType} from "../event/event-types";

export type Ticket = {
    id: string;
    event: EventType
    user: User
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}