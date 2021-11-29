import { useState } from 'react';
import { Button, Card, Form, FormControl, InputGroup } from 'react-bootstrap';
import qrSample from '../../images/QR_example.png';

interface RedeemProps {
	handleUpdate: Function;
}


export default function Redeem(props: RedeemProps) {
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    return (        
        <div>         
            <Card
                bg={'Dark'.toLowerCase()}
                key={1}
                text={'Dark'.toLowerCase() === 'light' ? 'dark' : 'white'}
                >
                <Card.Header>Ticket Redemption</Card.Header>
                <Card.Body>
                    <img
                    alt=""
                    src={qrSample}
                    width="120"
                    height="120"
                    className="d-inline-block align-top"
                    />{' '}
                </Card.Body>
                <Card.Footer>
                    <Button
                        className="ml-auto"
                        variant="dark">
                        <span>Generate QR</span>
                    </Button>
                    <Button
                        className="ml-auto"
                        variant="dark">
                        <span>Upload QR</span>
                    </Button>
                </Card.Footer>
            </Card>
        </div>
    );
}