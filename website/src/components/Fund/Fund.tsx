import React, { useState } from "react";
import { RaindropsAbi } from "../../abis/types";
import { RAINDROPS_ADDRESSES } from "../../constants/addresses";
import useContract from "../../hooks/useContract";
import Button from "../Buttons/FundButton/FundButton";
import ABI from '../../abis/Raindrops.abi.json';
import { getExplorerTransactionLink, useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { Card, FormControl, InputGroup } from 'react-bootstrap'

interface EventProps {
	handleUpdate: Function;
}


export default function Event(props: EventProps) {
    const contract = useContract<RaindropsAbi>(RAINDROPS_ADDRESSES, ABI);
    const {library, chainId} = useEthers();
    const [txHash, setTxHash] = useState<string | undefined>(undefined);
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    const [inputAmount, setInputAmount] = useState<string>("");

    const deposit = async (amount: string) => {
        const signer = library?.getSigner();

        if(signer) {
            // This override allows me to send a msg.value with a contract call
            let overrides = {
                value: ethers.utils.parseEther(amount)
            }

            const tx = await contract?.connect(signer).addFunds(overrides);

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

    const withdraw = async (amount: string) => {
        const signer = library?.getSigner();

        if(signer) {
            const tx = await contract?.connect(signer).removeFunds(ethers.utils.parseEther(amount));

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
                <Card.Header>Funding Panel</Card.Header>
                <Card.Body>
                <InputGroup className="mb-3">
                    <FormControl
                    type="text"
                    value={inputAmount}
                    onChange={(
                        ev: React.ChangeEvent<HTMLInputElement>,
                        ): void => setInputAmount(ev.target.value
                    )}
                    placeholder="Amount"
                    aria-label="Amount"
                    aria-describedby="basic-addon2"
                    />
                    <InputGroup.Text id="basic-addon2">Ether</InputGroup.Text>
                </InputGroup>
                </Card.Body>
                <Card.Footer>
                    <Button text='Add ETH' onClick={deposit} amount={inputAmount} isDisabled={isDisabled}/>
                    <Button text='Withdraw ETH' onClick={withdraw} amount={inputAmount} isDisabled={isDisabled}/>
                </Card.Footer>
            </Card>
            
            <div>
                <a href={txHash} target="_blank" rel="noreferrer">
                    {txHash}
                </a>
            </div>
        </div>
    );
}