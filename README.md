# Chainlink Fall Hackathon 2021 - Torrential Labs Submission
Raindrops Decentralized Tickets <br />
Website: https://raindrops.torrential.finance/ <br />
Etherscan: https://rinkeby.etherscan.io/address/0x189b5b93053dbb00640bd9fc5493584ae261505d <br />

# Raindrops Protocol Overview
## Overview
Raindrops is a decentralized ticketing protocol that uses NFTs as fully customizable smart tickets. This project leverages Ethereum-based smart contracts to create and track the status of each ticket, the Google Cloud Platform for ticket redemption, and Chainlink to provide a ticket API to the Ethereum blockchain. Using Raindrops, event hosts can move on from the current antiquated standard of digital ticketing into a world of complete customization, where artists and hosts can benefit from smart ticket resells, reward verified attendees, or even sell rights to potential future revenue of an event before it takes place.
## Key Protocol Features
**Ticket Marketplace:** Buy and sell tickets before or after an event takes place. Each ticket is a limited collectable item that can traded even after the event has ended. <br />
**Revenue Passthrough:** Middlemen are removed from the ticket resale process and a portion of every ticket resale is sent to the event organizer. Artists and event organizers benefit financially from the protocol allowing access to the large resale market. <br />
**Ticket Deposits:** Event creators pay a redeemable deposit fee for every minted smart ticket. The deposit fee is redeemed and paid to the ticket holder upon entry to the event, providing a financial incentive for ticket holders to actually attend events. <br />
## Quick-Start / How to Interact With Contracts
## Public Contract Functions
**Add Funds (addFunds):** Deposit ETH funds into the protocol to buy tickets, create events, and create tickets. <br />
**Remove Funds (removeFunds):** Withdraw your ETH funds from the protocol. <br />
**Create Event (createNewEvent):** Creates a new event in the protocol including an initial batch of tickets. Created tickets are listed for sale at the specified price. <br />
**Add Tickets (addTickets):** Add additional tickets to an already created event. Tickets are listed for sale once created. <br />
**List Ticket (listTicket):** List a ticket for sale at the specified price. <br />
**Delist Ticket (delistTicket):** Remove the ability for a ticket to be sold. <br />
**Buy Ticket (buyTicket):** Purchase a listed ticket for the specified price. <br />

## Restricted Contract Functions
**Set URI (setTokenURI):** Restricted to the owner of the contract. Sets the URI link for a raindrops ticket. URI link holds an image of the ticket and other metadata. <br />
**Redeem Tickets (redeemTickets):** Redeem the specified tickets after they have been scanned at an event or the event has already occurred. Deposit amount is paid out to the ticket holder if the ticket was redeemed at the event. If the event passes without the ticket being redeemed the deposit is paid to the protocol. <br />
**Remove Treasury Funds (removeFundsTreasury):** Withdraw protocol funds, can only be done by the specified treasury manager address. <br />
**Set Creator Percent (setCreatorPercent):** Change the percent fee that the event creator recieves from the resale of a ticket. Default is 5%.  <br />
**Set Protcol Percent (setProtocolPercent):** Change the percent fee that the protocol recieves from the resale of a ticket. Default is 5%.  <br />
**Set Deposit Amount (setDepositAmount):** Change the flat fee that is paid per ticket as a deposit. The deposit is refunded to the ticket holder at the time of redemption. If the ticket isn't redeemed at the event then the deposit is paid to the protocol. Default is 0.00005 ETH.  <br />

## System Architecture
![ChainLink Hackathon Fall 2021 - System Architecture](https://user-images.githubusercontent.com/85575746/143173584-f68ef55a-2e51-4be7-9a49-074590353c33.png)

## Cloud Architecture
![ChainLink Hackathon Fall 2021 - Cloud Architecture](https://user-images.githubusercontent.com/85575746/143792609-34a6d827-e4cf-4841-ac9c-0e13a275733f.png)

## Ticket Redemption Architecture
The following section describes the steps that are taken both in the cloud and on the blockchain to successfully and securely redeem a raindrops smart ticket. A diagram follows the step by step walkthrough and provides an overview of the process. <br/>
**Step 1:** The holder of the ticket wants to generate a QR code which will be scanned for entry into an event and used to claim the ticket deposit. <br/>
**Step 2:** A request is made to a cloud function to generate a known message that indicates the ticket number which is also saved in the datastore. <br/>
**Step 3:** The message is signed using the private key from the ticket holders Ethereum wallet. <br/>
**Step 4:** The signed message is sent to another cloud function which encodes it as a QR code which is returned to the ticket holder. <br/>
**Step 5:** The QR code is presented by the ticket holder at the event and is scanned. <br/>
**Step 6:** The QR code scanner sends the signed message from the QR code to a cloud function which determines if the ticket is valid. Since the original unsigned message is in the datastore the wallet address of the signer can be extracted from the signed message. The signer address is checked against the ticket to be redeemed to ensure ownership of the ticket on-chain. The ticket is also checked to make sure it hasn't already been redeemed. If all of the checks are valid a new entry is added to the datastore to mark the ticket as pending on-chain redemption. <br/>
**Step 7:** When a set amount of tickets are pending redemption a message is sent to the Ticket Validated Pub/Sub Topic. The message triggers an additional cloud function which manages the on-chain redemption of tickets. This service is called the Redemption Daemon and it interacts with the datastore, the Pub/Sub topic, triggers the Chainlink API, and calls the batch redemption function in the raindrops smart contract. <br/>
**Step 8:** The first action the Redemption Daemon takes is to call the custom consumer contract which will initiate the Ticket Redemption API. This consumer calls yet another cloud function that acts as an API layer to the datastore. The cloud function provides a bytes encoded string with the ticket numbers which will be supplied to the blockchain. <br/>
**Step 9:** The Chainlink node handles the custom bytes32 job and makes a state change on the blockchain. The redeemableTickets variable is now updated on-chain with the latest batch of tickets to be redeemed. <br/>
**Step 10:** The Redemption Daemon reads the updated state of the redeemableTickets variable, decodes it into an array of ticket numbers, and then calls the batch redemption function within the raindrops contract. <br/>
**Step 11:** Once the raindrops redeem function is called the ticket holders are credited the deposit amount of their tickets within the raindrops protocol. The tickets are marked on-chain as redeemed and can no longer pay out deposits.
![ChainLink Hackathon Fall 2021 - Ticket Redemption](https://user-images.githubusercontent.com/85575746/143792624-f76c486b-ddc8-4143-9dcc-614d6215c15c.png)

## Raindrops Smart Ticket
<p float="left">
  <img src="https://user-images.githubusercontent.com/85575746/143174814-9c6f977b-9ea6-485c-8f33-d8d287dec7ba.png" width="300" >
  <img src="https://user-images.githubusercontent.com/85575746/143175786-c98f23a1-70ae-467a-90c4-16295b5c6a38.png" width="300" >
  <img src="https://user-images.githubusercontent.com/85575746/143175531-71ce4aac-9a8d-444f-9c71-af50a5dbbd71.png" width="300" >
</p>

## Solidity Error Codes
RE-0: "Attempt to withdraw more funding than available" <br/>
RE-1: "Sender is not the treasury manager" <br/>
RE-2: "Can't remove more funds than the treasury holds" <br/>
RE-3: "Event with this name already exists" <br/>
RE-4: "Sender is not the owner of this event" <br/>
RE-5: "Insufficient funds to pay ticket deposits - add more funds" <br/>
RE-6: "You do not own this ticket" <br/>
RE-7: "You do not own this ticket" <br/>
RE-8: "Ticket is not listed for sale" <br/>
RE-9: "Insufficient funds to purchase ticket" <br/>
RE-10: "Only the redemption manager can call this function" <br/>
RE-11: "Ticket has already been redeemed" <br/>
RE-12: "Not enough funds to pay out deposit" <br/>
RE-13: "Can't raise protocol fee higher than 15%" <br/>
RE-14: "Can't raise creator fee higher than 15%"
## Future Work
