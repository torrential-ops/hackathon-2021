import { shortenIfAddress, useEthers } from "@usedapp/core";
import { useEffect, useState } from "react";
import { Container, Navbar, Stack } from "react-bootstrap";
import EventButton from "../components/Buttons/EventButton/EventButton";
import LinkButton from "../components/Buttons/LinkButton/LinkButton";
import Account from "../components/Account/Account";
import ProtocolData from "../components/ProtocolData/ProtocolData";
import torrentialLogo from '../images/torrential.png';
import './Home.css';
import AccountData from "../components/AccountData/AccountData";
import Fund from "../components/Fund/Fund";
import Event from "../components/Event/Event";
import Redeem from "../components/Redeem/Redeem";
import { Link } from "react-router-dom";

export default function Home() {
    const {active} = useEthers();

    const {deactivate, activateBrowserWallet, account, library} = useEthers();
    const [ens, setEns] = useState<string | null | undefined>(null);
    // Variable to control display of tickets & events associated with an address
    const [signedIn, setSignedIn] = useState<boolean>(false);
    const [newTransaction, setNewTransaction] = useState<string | undefined>(
		undefined
	);

    // ENS Substitution
    useEffect(() => {
        const isEns = async () => {
            if (account && library) {
            const _ens = await library?.lookupAddress(account);
            setEns(_ens);
            }
        }

        isEns();
    }, [account, library])

    // ETH Address Shortening
    const formatAddress = () => {
        return ens ?? shortenIfAddress(account);
    }

    const _handleUpdate = (_newTransaction: string) => {
		setNewTransaction(_newTransaction);
	};

    return (
        <div className='home'>
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
            <a href="/Account"><LinkButton text="My Tickets"/></a>
            </Navbar>            
            </>

            <ProtocolData />
            <AccountData account= {account} transaction = {newTransaction}/>
            <br/>
            <Stack className='function-stack' direction="horizontal" gap={5}>
                <Fund handleUpdate={_handleUpdate}/>                 
                <Event handleUpdate={_handleUpdate}/>
                <Redeem handleUpdate={_handleUpdate}/>
            </Stack>            
        </div>
    )
}