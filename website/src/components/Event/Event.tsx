import React, { useState } from "react";
import { RaindropsAbi } from "../../abis/types";
import { RAINDROPS_ADDRESSES } from "../../constants/addresses";
import useContract from "../../hooks/useContract";
import Button from "../Buttons/EventButton/EventButton";
import ABI from '../../abis/Raindrops.abi.json'
import { getExplorerTransactionLink, useEthers } from "@usedapp/core";
import { BigNumber } from '@ethersproject/bignumber'
import { Card, Container, FormControl, InputGroup, Row, Col } from "react-bootstrap";

interface EventProps {
	handleUpdate: Function;
}


export default function Event(props: EventProps) {
    const contract = useContract<RaindropsAbi>(RAINDROPS_ADDRESSES, ABI);
    const {library, chainId} = useEthers();
    const [txHash, setTxHash] = useState<string | undefined>(undefined);
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    const [eventName, setEventName] = useState<string>("");
    const [eventDesc, setEventDesc] = useState<string>("");
    const [eventDate, setEventDate] = useState<string>("");
    const [eventTickets, setEventTickets] = useState<string>("");
    const [ticketPrice, setTicketPrice] = useState<string>("");


    const createEvent = async (name: string, description: string, date: string, tickets: string, price: string) => {
        const signer = library?.getSigner();

        if(signer) {
            const tx = await contract?.connect(signer).createNewEvent(name, description, BigNumber.from(date),
             BigNumber.from(tickets), BigNumber.from(price));

            if(chainId && tx) {
                setIsDisabled(true);
                const link = getExplorerTransactionLink(tx?.hash, chainId);
                setTxHash(link);
            }

            await tx?.wait();

            setTxHash(undefined);
            setIsDisabled(false);
        }
    }

    const addTickets = async (name: string, tickets: string, price: string) => {
        const signer = library?.getSigner();

        if(signer) {
            const tx = await contract?.connect(signer).addTickets(name, BigNumber.from(tickets),
             BigNumber.from(price));

            if(chainId && tx) {
                setIsDisabled(true);
                const link = getExplorerTransactionLink(tx?.hash, chainId);
                setTxHash(link);
            }

            await tx?.wait();

            setTxHash(undefined);
            setIsDisabled(false);
        }
    }

    return (        
        <div>
            <Card
                bg={'Dark'.toLowerCase()}
                key={1}
                text={'Dark'.toLowerCase() === 'light' ? 'dark' : 'white'}
                >
                <Card.Header>Events and Tickets Panel</Card.Header>
                <Card.Body>
                    <Container>
                    <Row>
                    <Col>
                        <InputGroup className="mb-3">
                            <FormControl
                            type="text"
                            value={eventName}
                            onChange={(
                                ev: React.ChangeEvent<HTMLInputElement>,
                                ): void => setEventName(ev.target.value
                            )}
                            placeholder="Event Name"
                            aria-label="Event Name"
                            aria-describedby="basic-addon2"
                            />
                            <InputGroup.Text id="basic-addon2">string</InputGroup.Text>
                        </InputGroup>
                        <InputGroup className="mb-3">
                                <FormControl
                                type="text"
                                value={ticketPrice}
                                onChange={(
                                    ev: React.ChangeEvent<HTMLInputElement>,
                                    ): void => setTicketPrice(ev.target.value
                                )}
                                placeholder="Ticket Price"
                                aria-label="Ticket Price"
                                aria-describedby="basic-addon2"
                                />
                                <InputGroup.Text id="basic-addon2">uint256</InputGroup.Text>
                        </InputGroup>                        
                    </Col>
                    <Col>
                        <InputGroup className="mb-3">
                            <FormControl
                            type="text"
                            value={eventDate}
                            onChange={(
                                ev: React.ChangeEvent<HTMLInputElement>,
                                ): void => setEventDate(ev.target.value
                            )}
                            placeholder="Event Date"
                            aria-label="Event Date"
                            aria-describedby="basic-addon2"
                            />
                            <InputGroup.Text id="basic-addon2">uint256</InputGroup.Text>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <FormControl
                            type="text"
                            value={eventTickets}
                            onChange={(
                                ev: React.ChangeEvent<HTMLInputElement>,
                                ): void => setEventTickets(ev.target.value
                            )}
                            placeholder="Event Tickets"
                            aria-label="Event Tickets"
                            aria-describedby="basic-addon2"
                            />
                            <InputGroup.Text id="basic-addon2">uint256</InputGroup.Text>
                        </InputGroup>
                    </Col>
                    </Row>
                    <Row>
                        <InputGroup className="mb-3">
                            <FormControl
                            type="text"
                            value={eventDesc}
                            onChange={(
                                ev: React.ChangeEvent<HTMLInputElement>,
                                ): void => setEventDesc(ev.target.value
                            )}
                            placeholder="Event Description"
                            aria-label="Event Description"
                            aria-describedby="basic-addon2"
                            />
                            <InputGroup.Text id="basic-addon2">string</InputGroup.Text>
                        </InputGroup>
                    </Row>
                    </Container> 
                </Card.Body>
                <Card.Footer>
                    <Button text='Create new event' onClick={createEvent} name={eventName} description={eventDesc} date={eventDate} tickets={eventTickets} price={ticketPrice} isDisabled={isDisabled}/>
                    <Button text='Add Tickets to event' onClick={addTickets} name={eventName} tickets={eventTickets} price={ticketPrice} isDisabled={isDisabled}/>
                </Card.Footer>
            </Card>
            <br/>            
            <div>
                <a href={txHash} target="_blank" rel="noreferrer">
                    {txHash}
                </a>
            </div>
        </div>
    );
}