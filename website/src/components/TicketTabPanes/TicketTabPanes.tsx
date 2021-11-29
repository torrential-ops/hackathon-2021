import { Card, Col, ListGroup, Tab } from "react-bootstrap";
import TicketCard from '../TicketCard/TicketCard';

interface TicketTabPaneProps {
    event?: string; // Wallet Address
    transaction?: string;
}

export default function TicketTabPane(props: TicketTabPaneProps) {

    return (
    <div>
        <Tab.Container id="list-group-tabs-example" defaultActiveKey="#link1">
            <Col>
            <Card
            bg={'Dark'.toLowerCase()}
            key={1}
            text={'Dark'.toLowerCase() === 'light' ? 'dark' : 'white'}
            >
            <Card.Body>
            <Card.Text>
                <ListGroup>
                    <ListGroup.Item action href="#link1">
                    Ticket 1
                    </ListGroup.Item>
                    <ListGroup.Item action href="#link2">
                    Ticket 2
                    </ListGroup.Item>
                    <ListGroup.Item action href="#link3">
                    Ticket 3
                    </ListGroup.Item>
                    <ListGroup.Item action href="#link4">
                    Ticket 4
                    </ListGroup.Item>
                    <ListGroup.Item action href="#link5">
                    Ticket 5
                    </ListGroup.Item>
                    <ListGroup.Item action href="#link6">
                    Ticket 6
                    </ListGroup.Item>
                </ListGroup>
                </Card.Text>
                </Card.Body>
            </Card>
            </Col>
            <Col>
            <Tab.Content>
                <Tab.Pane eventKey="#link1">
                    <TicketCard header="Birthday Party" title="April 14th 2021" text="raindrop. 1/10"/>
                </Tab.Pane>
                <Tab.Pane eventKey="#link2">
                    <TicketCard header="Concert" title="May 1st 2022" text="raindrop. 3/5"/>
                </Tab.Pane>
                <Tab.Pane eventKey="#link3">
                    <TicketCard />
                </Tab.Pane>
                <Tab.Pane eventKey="#link4">
                    <TicketCard />
                </Tab.Pane>
                <Tab.Pane eventKey="#link5">
                    <TicketCard />
                </Tab.Pane>
                <Tab.Pane eventKey="#link6">
                    <TicketCard />
                </Tab.Pane>
            </Tab.Content>
            </Col>
        </Tab.Container>
        </div>
    );
}