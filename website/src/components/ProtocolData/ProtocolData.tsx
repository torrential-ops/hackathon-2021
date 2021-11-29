import React, { useEffect, useState } from 'react';
import { RaindropsAbi } from '../../abis/types';
import { RAINDROPS_ADDRESSES } from '../../constants/addresses';
import useContract from '../../hooks/useContract';
import ABI from '../../abis/Raindrops.abi.json';
import { BigNumber } from '@ethersproject/bignumber';
import { Card, CardGroup, Stack } from 'react-bootstrap';
import './ProtocolData.css'


export default function ProtocolData() {
    const [numberOfTickets, setNumberOfTickets] = useState<number | null>(null);
    const [numberOfEvents, setNumberOfEvents] = useState<number | null>(null);
    const [depositAmount, setDepositAmount] = useState<number | null>(null);
    const [resalePercent, setResalePercent] = useState<number | null>(null);
    const [protocolPercent, setProtocolPercent] = useState<number | null>(null);
    const [treasuryBalance, setTreasuryBalance] = useState<number | null>(null);
    const [depositBalance, setDepositBalance] = useState<number | null>(null);

    const contract = useContract<RaindropsAbi>(RAINDROPS_ADDRESSES, ABI);

    useEffect(() => {
        const getProtocolData = async () => {
            if(!!contract) {
                const _numberOfTickets: BigNumber = await contract.totalTickets();
                setNumberOfTickets(_numberOfTickets.toNumber());
                const _numberOfEvents: BigNumber = await contract.totalEvents();
                setNumberOfEvents(_numberOfEvents.toNumber());
                const _depositAmount: BigNumber = await contract.depositAmount();
                setDepositAmount(_depositAmount.toNumber());
                const _resalePercent: BigNumber = await contract.creatorPercent();
                setResalePercent(_resalePercent.toNumber());
                const _protocolPercent: BigNumber = await contract.protocolPercent();
                setProtocolPercent(_protocolPercent.toNumber());
                const _treasuryBalance: BigNumber = await contract.protocolTreasury();
                setTreasuryBalance(_treasuryBalance.toNumber());
                const _depositBalance: BigNumber = await contract.depositBalance();
                setDepositBalance(_depositBalance.toNumber());
            }
        }
        getProtocolData();
    }, [contract])

    return (
        <div className="protocol-data">
            <Stack direction="horizontal" gap={5}>
                <Card
                    bg={'Dark'.toLowerCase()}
                    key={1}
                    text={'Dark'.toLowerCase() === 'light' ? 'dark' : 'white'}
                    style={{flex: 1}}
                    className="mx-5"
                    >
                    <Card.Header>Total Tickets Created</Card.Header>
                    <Card.Body>
                    <Card.Title>{numberOfTickets}</Card.Title>
                    </Card.Body>
                    <Card.Footer>
                        <small className="text-muted">Last updated 3 mins ago</small>
                    </Card.Footer>
                </Card>
                <Card
                    bg={'Dark'.toLowerCase()}
                    key={1}
                    text={'Dark'.toLowerCase() === 'light' ? 'dark' : 'white'}
                    style={{flex: 1}}
                    className="mx-5"
                    >
                    <Card.Header>Total Events Created</Card.Header>
                    <Card.Body>
                    <Card.Title>{numberOfEvents}</Card.Title>
                    </Card.Body>
                    <Card.Footer>
                        <small className="text-muted">Last updated 3 mins ago</small>
                    </Card.Footer>
                </Card>
                <Card
                    bg={'Dark'.toLowerCase()}
                    key={1}
                    text={'Dark'.toLowerCase() === 'light' ? 'dark' : 'white'}
                    style={{flex: 1}}
                    className="mx-5"
                    >
                    <Card.Header>Protocol Balances</Card.Header>
                    <Card.Body>
                    <Card.Text>
                    Ticket Deposits: {depositBalance} <br/>
                    Protocol Treasury: {treasuryBalance} <br/>
                    </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                        <small className="text-muted">Last updated 3 mins ago</small>
                    </Card.Footer>
                </Card>
                <Card
                    bg={'Dark'.toLowerCase()}
                    key={1}
                    text={'Dark'.toLowerCase() === 'light' ? 'dark' : 'white'}
                    style={{flex: 1}}
                    className="mx-5"
                    >
                    <Card.Header>Protocol Fees</Card.Header>
                    <Card.Body>
                    <Card.Text>
                    Deposit Fee: {depositAmount} <br/>
                    Resale Fee: {resalePercent} <br/>
                    Protocol Fee: {protocolPercent} <br/>
                    </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                        <small className="text-muted">Last updated 3 mins ago</small>
                    </Card.Footer>
                </Card>
            </Stack>
            <br/>
        </div>
    );
}