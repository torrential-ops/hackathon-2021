import { shortenIfAddress, useEthers } from "@usedapp/core";
import React, { useEffect, useState } from "react";
import EventButton from "../Buttons/EventButton/EventButton";
import AccountData from "../AccountData/AccountData";
import Event from "../Event/Event";
import Fund from "../Fund/Fund";

export default function Account() {
    const {activateBrowserWallet, account, library} = useEthers();
    const [ens, setEns] = useState<string | null | undefined>(null);
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
        <div>            
            {!account ? (<EventButton text="Connect Wallet" onClick={activateBrowserWallet}/>
            ) : (
            <p>
                Connected: {formatAddress()}
                <br/>
                <AccountData account= {account} transaction = {newTransaction}/> 
            </p>
            )}
            
            <br/>
            <Fund handleUpdate={_handleUpdate}/>                 
            <Event handleUpdate={_handleUpdate}/>    
        </div>
    );
}