import { Card, Stack } from "react-bootstrap";
import EventButton from "../Buttons/EventButton/EventButton";

interface TicketCardProps {
    account?: string;
    header?: string;
    title?: string;
    text?: string;
} 

export default function OwnedTicketCard(props: TicketCardProps) {
    var nullVar: string = '';
    const nullFunction = async () => {
        nullVar = 'blank';
    }
    return (        
        <div>
            <Card
                bg={'Dark'.toLowerCase()}
                key={1}
                text={'Dark'.toLowerCase() === 'light' ? 'dark' : 'white'}
                >
                <Card.Header>{props.header}</Card.Header>
                <Card.Body>
                    <Card.Title>{props.title}</Card.Title>
                    <Card.Text>
                        {props.text}
                    </Card.Text>
                    </Card.Body>
                <Card.Footer>
                    <Stack direction="horizontal">
                        <EventButton text='Sell' onClick={nullFunction}/>
                        <EventButton text='Redeem' onClick={nullFunction}/>
                    </Stack>
                    <small className="text-muted">0xE9c83e8A533B8b48c0b677BbDDBfF6985538DB04</small>
                </Card.Footer>
            </Card>
        </div>
    );
}