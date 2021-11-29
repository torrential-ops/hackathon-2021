import { shortenIfAddress, useEthers } from "@usedapp/core";
import { useEffect, useState } from "react";
import { Navbar } from "react-bootstrap";
import { RaindropsAbi } from '../abis/types';
import EventButton from "../components/Buttons/EventButton/EventButton";
import LinkButton from "../components/Buttons/LinkButton/LinkButton";
import { RAINDROPS_ADDRESSES } from "../constants/addresses";
import useContract from "../hooks/useContract";
import ABI from '../abis/Raindrops.abi.json';
import torrentialLogo from '../images/torrential.png';
import OwnedTicketCard from "../components/OwnedTicketCard/OwnedTicketCard";

export default function Account() {
    const {deactivate, activateBrowserWallet, account, library} = useEthers();
    const [ens, setEns] = useState<string | null | undefined>(null);
    const contract = useContract<RaindropsAbi>(RAINDROPS_ADDRESSES, ABI);
    const [ticketNumbers, setTicketNumbers] = useState<string [] | null>(null);

    // ETH Address Shortening
    const formatAddress = () => {
        return ens ?? shortenIfAddress(account);
    }

    useEffect(() => {
        if (account != null){
            getAccountTickets('0xE9c83e8A533B8b48c0b677BbDDBfF6985538DB04')
        }        
    }, [])

    async function getAccountTickets(account:string) {
        // Call google cloud function for tickets data
        const eventDataEndpoint: string = 'https://us-central1-hackathon-2021-331600.cloudfunctions.net/Get-Account-Tickets';
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({address: account})
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
                    setTicketNumbers(responseJson[key])
                }
            })
            .catch((error) => {
                console.log('Error: ' + error)
            });
    }

    return (
        <div>
            <>
            <Navbar className="mx-left" bg="dark" variant="dark">
            <Navbar.Brand href="https://torrential.finance">
                <img
                alt=""
                src={torrentialLogo}
                width="30"
                height="30"
                className="d-inline-block align-top"
                />{' '}
                &nbsp;raindrops.
            </Navbar.Brand>            
            {!account ? (<EventButton text="Connect Wallet" onClick={activateBrowserWallet} />
            ) : (
                <EventButton text={formatAddress()} onClick={deactivate} />
                )}
            <a href="/"><LinkButton text="Dashboard"/></a>
            </Navbar>            
            </>
            <OwnedTicketCard header={'Owner: 0x0'} title={'Eventname-Ticket Number'} text={'QR Code'} />
        </div>
    )
}