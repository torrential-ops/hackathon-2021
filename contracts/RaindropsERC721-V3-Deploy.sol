// SPDX-License-Identifier: MIT

// Decentralized Ticketing using NFTs - ERC721 Implementation for Proof of Concept Only
// Gas Efficiency and Decentralization/Data Storage Tradeoffs Not Optimized
// Torrential Labs - 2021

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Raindrops is ERC721URIStorage, Ownable {

    uint256 private constant precision = 10000; // Variable to use as a base when calculating percents - all percents have to match this variable size
    uint256 public creatorPercent; // Fee paid to the event fee address from ticket resale - defaults to event creator unless sold
    uint256 public protocolPercent; // Fee paid to the protocol from ticket resale and event resale 
    uint256 public depositAmount; // Flat fee that the event/ticket creator pays for each ticket - redeemed by the ticket owner when they attend the event
    uint256 public depositBalance; // Sum total of outstanding ticket deposits
    uint256 public protocolTreasury; // Sum total of protocol earnings (ticket resale + expired deposits)    
    
    address public redemptionManager; // Address for automated redemption daemon
    address public treasuryManager; // Address which can remove funds from the treasury

    // Array re-work
    uint256 public totalEvents;
    uint256 public totalTickets;
    
    // Mappings

    // Events
    mapping(string => bool) eventNameToExists; // Default value is false - could go away if event 0 doesn't exist   
    mapping(string => string) eventNameToEventDesc;     
    mapping(string => address) eventNameToOwner; // Only the owner can create tickets and list an event for sale
    mapping(string => uint256) eventNameToNumberTickets;
    mapping(string => uint256) eventNameToEventDate;
    mapping(uint256 => string) public eventNumberToEventName;
 
    // Tickets
    mapping(uint256 => string) ticketNumberToEventName;
    mapping(uint256 => address) ticketNumberToOwner;
    mapping(uint256 => string) ticketNumberToURI;
    mapping(uint256 => uint256) ticketNumberToDeposit;    
    mapping(uint256 => uint256) ticketNumberToPrice;
    mapping(uint256 => bool) ticketNumberToRedeemed;
    mapping(uint256 => bool) ticketNumberToSale;

    // Funding
    mapping(address => uint256) addressToAmountFunded;
    
    // Events
    event eventCreated(string eventName, string description, uint256 eventDate, uint256 numberTickets, uint256 ticketPrice);
    event ticketRedemption(string eventName, uint256 ticketNumber, address ticketOwner);
    event depositAmountUpdated(uint256 oldDepositAmount, uint256 newDepositAmount);
    event resalePercentUpdated(uint256 oldResalePercent, uint256 newResalePercent);
    event newTicketsForEvent(string eventName, uint256 numberTickets, uint256 ticketPrice);
    event ticketListed(uint256 ticketNumber, uint256 price);
    event ticketDelisted(uint256 ticketNumber);
    event ticketSold(uint256 ticketNumber, address seller, address buyer, uint256 amount, uint256 creatorFees, uint256 protocolFees);
    event treasuryFundsRemoved(address sender, uint256 amount);

    // Contract Constructor
    // Removed from constructor: uint256 _withdrawLimitThreshold, uint16 _withdrawLimit, uint16 _withdrawCooldown
    constructor(address _treasuryManager, address _redemptionManager, uint256 _depositAmount, 
                uint256 _creatorPercent, uint256 _protocolPercent) 
                ERC721("Raindrops", "DROP") {
        
        require(_creatorPercent <= precision && _protocolPercent <= precision);

        // Set Helper Contract Adresses
        redemptionManager = _redemptionManager;
        treasuryManager = _treasuryManager;

        // Initialize the protocol fees
        depositAmount = _depositAmount;
        creatorPercent = _creatorPercent;
        protocolPercent = _protocolPercent;
    }

    // Protocol Interaction Functions

    // Add funding to contract to pay for ticket deposits
    function addFunds() external payable returns(uint256 newBalance) {
        addressToAmountFunded[msg.sender] += msg.value;
        return addressToAmountFunded[msg.sender];
    }

    // Remove funding from the contract
    function removeFunds(uint256 amount) external returns(uint256 newBalance) {
        // Sender must have the funds
        require(addressToAmountFunded[msg.sender] >= amount, "RE-0");

        // Settle the funds
        payable(msg.sender).transfer(amount);
        addressToAmountFunded[msg.sender] -= amount;

        return addressToAmountFunded[msg.sender];
    }

    // Remove funds from the protocol treasury - call only be called by the treasury manager address
    function removeFundsTreasury(uint256 amount) external returns(uint256 newBalance) {
        // Require that the call be the treasury manager
        require(treasuryManager == msg.sender, "RE-1");
        // Prevent the removal of more funds than is allowed
        require(amount <= protocolTreasury, "RE-2");

        // Settle the funds
        payable(msg.sender).transfer(amount);
        protocolTreasury -= amount;

        // Emit Event
        emit treasuryFundsRemoved(msg.sender, amount);

        return protocolTreasury;
    }

    // Create tickets for a new event
    function createNewEvent(string memory eventName, string memory eventDescription, uint256 eventDate, uint256 numberTickets, uint256 ticketPrice) external {
        // Require that an event with the same name does not exist
        require(eventNameToExists[eventName] == false, "RE-3");
        
        // Create a New Event - 0 event does not exist
        totalEvents += 1;

        // Update Mappings
        eventNumberToEventName[totalEvents] = eventName;
        eventNameToExists[eventName] = true;        
        eventNameToOwner[eventName] = msg.sender;
        eventNameToEventDesc[eventName] = eventDescription;
        eventNameToEventDate[eventName] = eventDate;
          
        // Create the Tickets
        addTickets(eventName, numberTickets, ticketPrice);

        // Emit Event
        emit eventCreated(eventName, eventDescription, eventDate, numberTickets, ticketPrice);
    }

    // Create additional tickets for an event
    function addTickets(string memory eventName, uint256 numberTickets, uint256 ticketPrice) public {
        // Require that the sender owns this event and that they can pay for the ticket deposits
        require(eventNameToOwner[eventName] == msg.sender, "RE-4");
        require(addressToAmountFunded[msg.sender] >= numberTickets * depositAmount,
        "RE-5");
        
        // Track the new ticket deposits
        depositBalance += numberTickets * depositAmount;
        
        // Update the sender's balance
        addressToAmountFunded[msg.sender] -= numberTickets * depositAmount;   
  
        // Create Tickets in a Loop
        for (uint i; i < numberTickets; i++){
            // Update ticket number to next free slot - 0 ticket does not exist
            totalTickets += 1;

            // Mint the ERC token
            _safeMint(msg.sender, totalTickets);

            // Update Mappings
            ticketNumberToEventName[totalTickets] = eventName;
            ticketNumberToOwner[totalTickets] = msg.sender;
            ticketNumberToDeposit[totalTickets] = depositAmount;
            ticketNumberToPrice[totalTickets] = ticketPrice;
            ticketNumberToSale[totalTickets] = true;
            ticketNumberToRedeemed[totalTickets] = false;
        }

        // Update Mappings
        eventNameToNumberTickets[eventName] += numberTickets;

        // Emit Event
        emit newTicketsForEvent(eventName, numberTickets, ticketPrice);
    }

    // List a ticket as for sale - this allows it to be bought at any time
    // If the ticket is already listed for sale then this will update the sale price
    // Sale price is in ETH (gwei)
    function listTicket(uint256 ticketNumber, uint256 salePrice) external {
        // Require that the sender be the owner of this ticket / ticket exists
        require(ticketNumberToOwner[ticketNumber] == msg.sender, "RE-6");

        // Allow this ticket to be sold and update the price
        ticketNumberToSale[ticketNumber] = true;
        ticketNumberToPrice[ticketNumber] = salePrice;

        // Emit Event
        emit ticketListed(ticketNumber, salePrice);
    }

    // Delists a ticket from sale - prevents purchase of ticket
    function delistTicket(uint256 ticketNumber) external {
        // Require that the sender be the owner of this ticket / ticket exists
        require(ticketNumberToOwner[ticketNumber] == msg.sender, "RE-7");

        // Diable this ticket from being sold) - price doesn't need to be updated it will be overrided when relisted
        ticketNumberToSale[ticketNumber] = false;
        
        // Emit Event
        emit ticketDelisted(ticketNumber);
    }

    // Buy a ticket that is listed for sale - you will buy the ticket at the list price
    function buyTicket(uint256 ticketNumber) external {
        // Set working variables
        uint256 ticketPrice = ticketNumberToPrice[ticketNumber];
        address ticketOwner = ticketNumberToOwner[ticketNumber];

        // Require that the ticket is listed for sale - this will also check that the ticket exists since default bool is false
        require(ticketNumberToSale[ticketNumber] == true, "RE-8");        
        // Require that the sender has the funds to buy the ticket        
        require(addressToAmountFunded[msg.sender] > ticketPrice, "RE-9");

        // Calculate the protocol fee & creator fees
        uint256 protocolFee = (ticketPrice * protocolPercent) / precision;
        uint256 creatorFee = (ticketPrice * creatorPercent) / precision;

        // Calculate the remaining funds which will be sent from the buyer to the sellers account
        uint256 saleAmount = ticketPrice - protocolFee - creatorFee;

        // Transfer ownership of the ticket and the NFT
        _transfer(ticketOwner, msg.sender, ticketNumber);

        // Settle the funds - buyer and seller
        addressToAmountFunded[msg.sender] -= ticketPrice;
        addressToAmountFunded[ticketOwner] += saleAmount;

        // Settle the fees - creator and protocol
        address creatorAddress = eventNameToOwner[ticketNumberToEventName[ticketNumber]];
        addressToAmountFunded[creatorAddress] += creatorFee;
        protocolTreasury += protocolFee;

        // Emit Event
        emit ticketSold(ticketNumber, ticketOwner, msg.sender, saleAmount, creatorFee, protocolFee);

        // Update tracking variables - price doesn't need to be updated it will be overrided when relisted
        ticketNumberToOwner[ticketNumber] = msg.sender;
        ticketNumberToSale[ticketNumber] = false;     
    }

    // Only callable by the redemption address - which can be changed by the owner if needed
    // ** Move expired determination on-chain within the smart contract later **
    // For now expiration will be determined by the redemption daemon in the cloud prior to calling this function
    function redeemTickets(uint256 [] memory ticketNumbers, bool [] memory expired) external {
        // Limit redemption of tickets to the redemption address only
        require(msg.sender == redemptionManager, "RE-10");

        for (uint i; i < ticketNumbers.length; i++){
            redeemTicket(ticketNumbers[i], expired[i]);
        } 
    }

    // Internal Functions

    // ** Move expired determination on-chain within the smart contract later **
    // For now expiration will be determined by the redemption daemon in the cloud prior to calling this function
    function redeemTicket(uint256 ticketNumber, bool expired) internal {
        // Check that this ticket has not yet been redeemed - there are safety checks in the cloud already so this should not trigger
        require(ticketNumberToRedeemed[ticketNumber] == false, "RE-11");
        // Safety check to make sure more funds aren't given for deposits than availible - this should never trigger
        require(depositBalance - ticketNumberToDeposit[ticketNumber] >= 0, "RE-12");        
        
        if (!expired) {
            // Pay the ticket deposit to the ticker owner
            depositBalance -= ticketNumberToDeposit[ticketNumber];
            addressToAmountFunded[ticketNumberToOwner[ticketNumber]] += ticketNumberToDeposit[ticketNumber];    

            // Emit Event
            emit ticketRedemption(ticketNumberToEventName[ticketNumber], ticketNumber, ticketNumberToOwner[ticketNumber]);
        } else {
            // Deposit fee goes to the protocol - ticket was never scanned at event
            depositBalance -= ticketNumberToDeposit[ticketNumber];
            protocolTreasury += ticketNumberToDeposit[ticketNumber];

            // Emit Event
            emit ticketRedemption(ticketNumberToEventName[ticketNumber], ticketNumber, address(this));
        }
        // Set ticket status to redeemed
        ticketNumberToRedeemed[ticketNumber] = true;
    }

    // Setter Functions

    function setTokenURI(uint256 ticketNumber, string memory _tokenURI) external onlyOwner {
        _setTokenURI(ticketNumber, _tokenURI);
        ticketNumberToURI[ticketNumber] = _tokenURI;
    }

    function setDepositAmount(uint256 newDepositAmount) external onlyOwner {
        emit depositAmountUpdated(depositAmount, newDepositAmount);
        depositAmount = newDepositAmount;        
    }

    function setProtocolPercent(uint16 newProtocolPercent) external onlyOwner {
        // Limit upper bound of the protocol percentage to protect against errors
        require(newProtocolPercent <= 15000, "RE-13");
        emit depositAmountUpdated(protocolPercent, newProtocolPercent);
        protocolPercent = newProtocolPercent;        
    }

    function setCreatorPercent(uint16 newCreatorPercent) external onlyOwner {
        // Limit upper bound of the creator percentage to protect against errors
        require(newCreatorPercent <= 15000, "RE-14");
        emit depositAmountUpdated(creatorPercent, newCreatorPercent);
        creatorPercent = newCreatorPercent;        
    }

    // Getter Functions

    function getAccountBalance(address account) external view returns(uint256 balance) {
        return addressToAmountFunded[account];
    }

    function getTokenURI(uint256 ticketNumber) public view returns(string memory) {
    return tokenURI(ticketNumber);
    }

    // These view functions can be replaced by a subgraph using the event outputted info

    // Returns all info for an event - byte size ~ .7KB
    function getEventInfo(string memory eventName) external view returns(
        string memory name, string memory description, uint256 date, uint256 ticketCount,
        address owner, bool exists
    ) {
        return (eventName, eventNameToEventDesc[eventName], eventNameToEventDate[eventName],
                eventNameToNumberTickets[eventName], eventNameToOwner[eventName], eventNameToExists[eventName]);
    }

    // Returns all info for a ticket - byte size ~ .7KB
    function getTicketInfo(uint256 ticketNumber) external view returns(
        string memory eventName, uint256 deposit, uint256 price, string memory uri, address owner,
        bool forSale, bool redeemed
    ) {
        return (ticketNumberToEventName[ticketNumber], ticketNumberToDeposit[ticketNumber],
                ticketNumberToPrice[ticketNumber], ticketNumberToURI[ticketNumber],
                ticketNumberToOwner[ticketNumber], ticketNumberToSale[ticketNumber],
                ticketNumberToRedeemed[ticketNumber]);
    }
}