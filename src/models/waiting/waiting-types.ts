import {User} from "../user/user-types";
import {EventType} from "../event/event-types";

export type WaitingTypes = {
    id: string;
    user: User;
    event: EventType;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}