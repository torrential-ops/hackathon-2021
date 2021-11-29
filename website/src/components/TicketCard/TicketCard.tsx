import { Card } from "react-bootstrap";
import EventButton from "../Buttons/EventButton/EventButton";

interface TicketCardProps {
    account?: string;
    header?: string;
    title?: string;
    text?: string;
} 

export default function TicketCard(props: TicketCardProps) {
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
                    <EventButton text='Purchase' onClick={nullFunction}/>
                </Card.Footer>
            </Card>
        </div>
    );
}