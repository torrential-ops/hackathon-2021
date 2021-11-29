import React, { useEffect, useState } from 'react';
import { RaindropsAbi } from '../../abis/types';
import { RAINDROPS_ADDRESSES } from '../../constants/addresses';
import useContract from '../../hooks/useContract';
import ABI from '../../abis/Raindrops.abi.json';
import { BigNumber } from '@ethersproject/bignumber';
import { Card, Col, Container, ListGroup, Row, Tab } from 'react-bootstrap';
import TicketCard from '../TicketCard/TicketCard';
import EventCard from '../EventCard/EventCard';
import './AccountData.css';
import { JsxEmit } from 'typescript';
import { addListener } from 'process';

interface AccountDataProps {
    account?: string | null | undefined; // Wallet Address
    transaction?: string;
}

// Need to handle possbility that the account is not logged and display default empty view
export default function AccountData(props: AccountDataProps) {
    const [eventsUpdated, setEventsUpdated] = useState<boolean>(false);
    const [activeEvent, setActiveEvent] = useState<string>('');

    //var eventKey: any; // holds state of the event tab container

    // Use to dynamically generate the ticket cards
    const [eventNames, setEventNames] = useState<string []>([]);
    const [eventDesc, setEventDesc] = useState<string []>([]);
    const [eventDates, setEventDates] = useState<string []>([]);
    const [ticketNumbers, setTicketNumbers] = useState<string []>([]);
    const [owners, setOwners] = useState<string []>([]);
                            
    useEffect(() => {
        getAvailibleEvents()
    }, [])

    useEffect(() => {
        getAvailibleTickets()
    }, [eventsUpdated, activeEvent])

    async function getAvailibleTickets() {
        // Call google cloud function for tickets data
        const eventDataEndpoint: string = 'https://us-central1-hackathon-2021-331600.cloudfunctions.net/Get-Raindrops-Tickets';
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({chain_id: 'rinkeby'})
        };
        fetch(eventDataEndpoint, requestOptions)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Something went wrong');
                }
            })
            .then((responseJson) => {
                for (var key in responseJson) {
                    if (responseJson.hasOwnProperty(key)) {
                        if (responseJson[key][0].name == activeEvent){
                            alert(responseJson[key][0].name);
                        }                        
                    }
                }
            })
            .catch((error) => {
                console.log('Error: ' + error)
            });
    }

    async function getAvailibleEvents() {
        // Call google cloud function for events data
        const eventDataEndpoint: string = 'https://us-central1-hackathon-2021-331600.cloudfunctions.net/Get-Raindrops-Events';
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({chain_id: 'rinkeby'})
        };
        fetch(eventDataEndpoint, requestOptions)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Something went wrong');
                }
            })
            .then((responseJson) => {
                var _eventNames: string [] = [];
                var _eventDesc: string [] = [];
                var _eventDates: string [] = [];
                var _ticketNumbers: string [] = [];
                var _owners: string [] = [];

                for (var key in responseJson) {
                    if (responseJson.hasOwnProperty(key)) {
                        for (var _key in responseJson[key]) {
                            if (responseJson[key].hasOwnProperty(_key)) {
                                if (_key == 'name') {
                                    _eventNames.push(responseJson[key][_key])
                                }
                                else if (_key == 'description') {
                                    _eventDesc.push(responseJson[key][_key])
                                }
                                else if (_key == 'event_date') {
                                    _eventDates.push(responseJson[key][_key])
                                }
                                else if (_key == 'tickets') {
                                    _ticketNumbers.push(responseJson[key][_key])
                                }
                                else if (_key == 'owner') {
                                    _owners.push(responseJson[key][_key])
                                }
                            }
                        }
                    }
                }
                // Set all of the variables
                setEventNames(_eventNames);
                setEventDesc(_eventDesc);
                setEventDates(_eventDates);
                setTicketNumbers(_ticketNumbers);
                setOwners(_owners);

                // Trigger Tickets
                setEventsUpdated(true);
            })
            .catch((error) => {
                console.log('Error: ' + error)
            });        
    }

    const generateEventHTML = (
        eventName: string, eventDesc: string, eventDate: string, ticketNumber: string, owner: string, eventKey: string) => {
            return (
                <Tab.Pane eventKey={eventKey}>
                <EventCard name={eventName} desc={eventDesc} date={eventDate} tickets={ticketNumber} owner={owner}/>
                </Tab.Pane>
              );
    };

    const generateEvents = (
        eventNames: string [], eventDesc: string [], eventDates: string [], ticketNumbers: string [], owners: string []
    ) => {
        var htmlString: JSX.Element [] = [];
        for (let i = 0; i < eventNames.length; i++) {
            var eventKey: string = '#link' + String(i);
            htmlString.push(generateEventHTML(eventNames[i], eventDesc[i], eventDates[i], ticketNumbers[i], owners[i], eventKey));
        }
        return htmlString;
    }

    const generateEventLink = (
        eventName: string, link: string 
    ) => {
        return (
            <ListGroup.Item action href={link}>
            {eventName}
            </ListGroup.Item>
        );
    };

    const generateEventLinks = (
        eventNames: string []
    ) => {
        var htmlString: JSX.Element [] = [];
        for (let i = 0; i < eventNames.length; i++) {
            var eventLink: string = '#link' + String(i);
            htmlString.push(generateEventLink(eventNames[i], eventLink));
        }
        return htmlString;
    }

    return (       
        <div>                       
        <Container>
        <Row>
        <Tab.Container id="list-group-tabs-example" defaultActiveKey="#link0">
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
                    <EventCard />
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
        <Tab.Container id="events" defaultActiveKey="link1">
            <Col>
            <Tab.Content>
                {generateEvents(eventNames, eventDesc, eventDates, ticketNumbers, owners)}                
            </Tab.Content>                
            </Col>
            <Col>
            <Card
            bg={'Dark'.toLowerCase()}
            key={1}
            text={'Dark'.toLowerCase() === 'light' ? 'dark' : 'white'}
            >
            <Card.Body>
            <Card.Text>
                <ListGroup>
                    {generateEventLinks(eventNames)}                    
                </ListGroup>
                </Card.Text>
                </Card.Body>
            </Card>
            </Col>
        </Tab.Container>
        </Row>
        </Container>
        </div>        
    )
}