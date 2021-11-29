import React from 'react';
import { Button } from "react-bootstrap";

interface ButtonProps {
    text: string;
    onClick: Function;
    name?: string,
    description?: string,
    date?: string,
    tickets?: string,
    price?: string,
    isDisabled?: boolean;
}

export default function EventButton(props: ButtonProps) {
    return (
        <Button
            className="ml-auto"
            variant="dark"
            onClick={() => props.onClick(props.name, props.description, props.date, props.tickets, props.price)}
            disabled={props.isDisabled}>
            {props.isDisabled ? (
                <div className='loader' />
            ) : (
                <span>{props.text}</span>
            )}
        </Button>
    );
}