import json
from eth_account.messages import encode_defunct
from google.cloud import pubsub_v1
from google.cloud import datastore
from web3.auto import Web3


def write_db(wallet_address, contract_address, tokenId):
    unique_key = f'{wallet_address}-{contract_address}-{tokenId}'

    client = datastore.Client()

    task = datastore.Entity(client.key('Tickets-Redeemed', unique_key))
    task.update(
        {
            "wallet_address": wallet_address,
            "contract_address": contract_address,
            "tokenId": tokenId,
            "redeemed": True,
        }
    )

    client.put(task)


def peek_db(wallet_address, contract_address, tokenId, db_table):
    client = datastore.Client()

    unique_key = f'{wallet_address}-{contract_address}-{tokenId}'
    key = client.key(db_table, unique_key)

    if client.get(key) is not None:
        # Entry already exists
        return client.get(key)
    else:
        # Entry does not exist
        return False


def http_post(request):
    """HTTP Cloud Function.
    Args:
        request (flask.Request): The request object.
        <https://flask.palletsprojects.com/en/1.1.x/api/#incoming-request-data>
    Returns:
        The response text, or any set of values that can be turned into a
        Response object using `make_response`
        <https://flask.palletsprojects.com/en/1.1.x/api/#flask.make_response>.
    """
    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return '', 204, headers

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    # Init an empty json response
    response_data = {}

    request_json = request.get_json(silent=True)
    request_args = request.args

    if request_json and 'signed_msg_sig' and 'wallet_address' and 'contract_address' and 'tokenId' in request_json:
        # Grab input values
        signed_msg_sig = request_json['signed_msg']
        wallet_address = request_json['wallet_address']
        contract_address = request_json['contract_address']
        tokenId = request_json['tokenId']
    elif request_args and 'wallet_address' and 'contract_address' and 'tokenId' in request_args:
        # Grab input values
        signed_msg_sig = request_args['signed_msg']
        wallet_address = request_args['wallet_address']
        contract_address = request_args['contract_address']
        tokenId = request_args['tokenId']
    else:
        response_data['status'] = 'Invalid request parameters'
        return json.dumps(response_data), 400, headers

    # First check if the ticket has already been redeemed
    value = peek_db(wallet_address=wallet_address, contract_address=contract_address, tokenId=tokenId,
                    db_table='Tickets-Redeemed')

    # Return if the ticket has been redeemed already
    if value is not False:
        # Ticket already redeemed
        response_data['status'] = 'Ticket has already been redeemed'
        return json.dumps(response_data), 400, headers

    # Next attempt to retrieve the unsigned message from the datastore
    value = peek_db(wallet_address=wallet_address, contract_address=contract_address, tokenId=tokenId,
                    db_table='QR-Messages')

    # Check if entry exists
    if value is not False:
        # Value is in the datastore
        unsigned_msg = value['message']

        # Now decode the message and verify the identity of the signer
        message = encode_defunct(text=unsigned_msg)
        signer_address = w3.eth.account.recover_message(message, signature=signed_msg_sig)
        response_data['signer_address'] = signer_address
        response_data['status'] = 'Valid Ticket'

        # Validate the request - check that the signer owns the ticket to be redeemed
        eth_url = open("./ethereum_provider.txt", "r").read()
        w3 = Web3(Web3.HTTPProvider(eth_url))

        # Load Raindrops Contract
        raindrops_addr = w3.toChecksumAddress('0x189B5b93053DBB00640bD9fC5493584ae261505d')
        raindrops_abi = json.load(open('./Raindrops.abi.json', ))
        raindrops_contract = w3.eth.contract(address=raindrops_addr, abi=raindrops_abi)

        # Check Owner
        owner_address = raindrops_contract.functions.ownerOf(tokenId).call()

        # If request is valid write to the DB that the ticket has been redeemed
        if wallet_address == owner_address:
            write_db(wallet_address=wallet_address, contract_address=contract_address, tokenId=tokenId)
        else:
            response_data['status'] = 'Not owner of the ticket'
            return json.dumps(response_data), 400, headers
    else:
        # Value is not in the datastore
        response_data['status'] = 'No valid datastore entry for wallet-contract-token combination'
        return json.dumps(response_data), 400, headers

    # If everything is valid check how many tickets are pending redemption - if it's greater than 8 publish to the topic
    ticket_batch = 8
    client = datastore.Client()
    query = client.query(kind="Tickets-Redeemed")
    results = list(query.fetch())
    if len(results) >= ticket_batch:
        # Publish message to topic
        project_id = "hackathon-2021-331600"
        topic_id = "ticket-validated"

        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path(project_id, topic_id)

        data = f"{len(results)}"
        # Data must be a bytestring
        data = data.encode("utf-8")
        # Publish the message
        publisher.publish(topic_path, data)

    return json.dumps(response_data), 200, headers
