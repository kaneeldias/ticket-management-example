import express, {NextFunction, Request, Response} from 'express';
import {CreateEvent} from "./models/event/event-types";
import {Event} from "./models/event/Event";
import {validateCreateEventRequest} from "./models/event/event-utils";

const app = express();
const port = 3000;

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World3!');
});

app.post('/initialize', async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    validateCreateEventRequest(data);
    const event = await Event.create(data);
    res.status(201).json(event);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    
    if (err.isJoi) {
        res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: err.message });
});


app.listen(port);