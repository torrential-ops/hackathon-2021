import { Card } from "react-bootstrap";
import { shortenIfAddress, useEthers } from "@usedapp/core";
import EventButton from "../Buttons/EventButton/EventButton";

interface EventCardProps {
    account?: string;
    name?: string;
    desc?: string;
    date?: string;
    tickets?: string;
    owner?: string;
} 

export default function EventCard(props: EventCardProps) {
    // ETH Address Shortening
    const formatAddress = (address: string | undefined) => {
        return shortenIfAddress(address);
    }

    return (        
        <div>
            <Card
                bg={'Dark'.toLowerCase()}
                key={1}
                text={'Dark'.toLowerCase() === 'light' ? 'dark' : 'white'}
                >
                <Card.Header>{props.name}</Card.Header>
                <Card.Body>
                    <Card.Text>
                        {props.desc} <br/>
                        Date: {props.date} <br/>
                        Tickets: {props.tickets} <br/>
                    </Card.Text>
                    </Card.Body>
                <Card.Footer>
                    <small className="text-muted">Event Creator: {formatAddress(props.owner)}</small>
                </Card.Footer>
            </Card>
        </div>
    );
}