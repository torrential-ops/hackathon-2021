import React from 'react';
import { Button } from "react-bootstrap";

interface ButtonProps {
    text: string;
    isDisabled?: boolean;
}

export default function LinkButton(props: ButtonProps) {
    return (
        <Button
            className="ml-auto"
            variant="dark"
            disabled={props.isDisabled}>
            {props.isDisabled ? (
                <div className='loader' />
            ) : (
                <span>{props.text}</span>
            )}
        </Button>
    );
}