import React from 'react';
import { Button } from "react-bootstrap";

interface ButtonProps {
    text: string;
    onClick: Function;
    amount?: string,
    isDisabled?: boolean;
}

export default function FundButton(props: ButtonProps) {
    return (
        <Button
            className="ml-auto"
            variant="dark"
            onClick={() => props.onClick(props.amount)}
            disabled={props.isDisabled}>
            {props.isDisabled ? (
                <div className='loader' />
            ) : (
                <span>{props.text}</span>
            )}
        </Button>
    );
}