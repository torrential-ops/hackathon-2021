from web3.auto import Web3
import base64
import json
import time


def hello_pubsub(event, context):
    """Triggered from a message on a Cloud Pub/Sub topic.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """
    pubsub_message = base64.b64decode(event['data']).decode('utf-8')
    print(pubsub_message)

    # Handle Redemption
    eth_url = open("./ethereum_provider.txt", "r").read()
    w3 = Web3(Web3.HTTPProvider(eth_url))

    # Load Raindrops Contract
    raindrops_addr = w3.toChecksumAddress('0x189B5b93053DBB00640bD9fC5493584ae261505d')
    raindrops_abi = json.load(open('./Raindrops.abi.json', ))
    raindrops_contract = w3.eth.contract(address=raindrops_addr, abi=raindrops_abi)

    # Load Consumer Contract
    consumer_addr = w3.toChecksumAddress('0x861a9484a2814d06F55D05B4f30Eee4ED209ee59')
    consumer_abi = json.load(open('./RedeemTicketConsumer.abi.json', ))
    consumer_contract = w3.eth.contract(address=consumer_addr, abi=consumer_abi)

    # First write to Consumer Contract - This will pull validated tickets into the blockchain
    oracle_addr = w3.toChecksumAddress('0x07a0FB65ec3Da4B11DF87eCb470F2D04CE292135')
    job_id = '8c61150ed68d4cfb93b7dd50aef77b10'

    gas_price = 2
    redemption_manager_address = w3.toChecksumAddress('0xE9c83e8A533B8b48c0b677BbDDBfF6985538DB04')
    nonce = w3.eth.get_transaction_count(redemption_manager_address)

    txn_params = {'chainId': 1,
                  'gas': 1000000,
                  'maxPriorityFeePerGas': w3.toWei(2, 'gwei'),
                  'maxFeePerGas': int(gas_price * 1.2),
                  'from': redemption_manager_address,
                  'nonce': nonce}

    # Create the Transaction
    transaction = consumer_contract.requestRedeemableTickets(oracle_addr, job_id).buildTransaction(txn_params)

    # Load private key
    private_key = open("./private_key.txt", "r").read()

    signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
    tx_id = w3.toHex(w3.eth.sendRawTransaction(signed_txn.rawTransaction))
    print(f'Consumer TX sent: {tx_id}')

    # Wait for a little bit (2 minutes) for the transactions to process and update the blockchain state
    time.sleep(120)

    # TODO: Integrate redemption completely into the blockchain
    # Now read back the consumer variable - decode into array of ticket IDs
    encoded_tickets = consumer_contract.redeemableTickets().call()
    tickets = hex(encoded_tickets)
    decoded = bytearray.fromhex(tickets[2:]).decode()
    ticket_IDs = []
    print(decoded)
    for i in range(int(len(decoded) / 4)):
        ticket_IDs.append(int(decoded[i * 4:(i + 1) * 4], 16))

    # TODO: Check date for expiration - for now assume not expired
    expired_list = []
    for i in range(len(ticket_IDs)):
        expired_list.append(False)

    # Call the raindrops contract to actually redeem the tickets
    # Get nonce for the transaction
    # TODO: Non hardcoded gas price & gas limit
    gas_price = 2
    redemption_manager_address = w3.toChecksumAddress('0xE9c83e8A533B8b48c0b677BbDDBfF6985538DB04')
    nonce = w3.eth.get_transaction_count(redemption_manager_address)

    txn_params = {'chainId': 1,
                  'gas': 1000000,
                  'maxPriorityFeePerGas': w3.toWei(2, 'gwei'),
                  'maxFeePerGas': int(gas_price * 1.2),
                  'from': redemption_manager_address,
                  'nonce': nonce}

    # Create the Transaction
    transaction = raindrops_contract.functions.redeemTickets(ticket_IDs, expired_list).buildTransaction(txn_params)

    # Load private key
    private_key = open("./private_key.txt", "r").read()

    signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
    tx_id = w3.toHex(w3.eth.sendRawTransaction(signed_txn.rawTransaction))
    print(f'Redeem Tickets TX sent: {tx_id}')
