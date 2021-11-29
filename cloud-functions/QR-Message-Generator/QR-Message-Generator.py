import json
import string
import random
import hashlib
from google.cloud import datastore


def generate_response(wallet_address, contract_address, tokenId):
    """Unique message generator.
    Args:
        wallet_address (string): The address of the requesters wallet.
        contract_address (string): The address of the raindrops smart contract.
        tokenId (string): The tokenId of the raindrops ticket.
    Returns:
        JSON string which contains the message response
    """
    # Init a blank json response
    response_data = {}

    # Parameter that controls length of random str
    str_length = 32

    # Generate random sequence
    request_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=str_length))

    # Hash the data together with a random sequence appended
    encode_str = str(wallet_address + contract_address + tokenId + request_id)
    hash_object = hashlib.sha256(encode_str.encode('UTF-8'))
    hex_dig = hash_object.hexdigest()

    # Form JSON response
    response_data['wallet_address'] = wallet_address
    response_data['contract_address'] = contract_address
    response_data['tokenId'] = tokenId
    response_data['random_str'] = request_id
    response_data['message'] = hex_dig
    return response_data


def regenerate_response(db_entry):
    """Unique message generator.
    Args:
        db_entry (dict?): Stored response from the database that has already been created.
    Returns:
        JSON string which contains the message response
    """
    # Init a blank json response
    response_data = {'wallet_address': db_entry['wallet_address'], 'contract_address': db_entry['contract_address'],
                     'tokenId': db_entry['tokenId'], 'random_str': db_entry['random_str'],
                     'message': db_entry['message']}

    # Form JSON response
    return response_data


def write_db(wallet_address, contract_address, tokenId, random_str, message):
    unique_key = f'{wallet_address}-{contract_address}-{tokenId}'

    client = datastore.Client()

    task = datastore.Entity(client.key('QR-Messages', unique_key))
    task.update(
        {
            "wallet_address": wallet_address,
            "contract_address": contract_address,
            "tokenId": tokenId,
            "random_str": random_str,
            "message": message,
        }
    )

    client.put(task)


def peek_db(wallet_address, contract_address, tokenId):
    client = datastore.Client()

    unique_key = f'{wallet_address}-{contract_address}-{tokenId}'
    key = client.key('QR-Messages', unique_key)

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

    if request_json and 'wallet_address' and 'contract_address' and 'tokenId' in request_json:
        # Grab input values
        wallet_address = request_json['wallet_address']
        contract_address = request_json['contract_address']
        tokenId = request_json['tokenId']
    elif request_args and 'wallet_address' and 'contract_address' and 'tokenId' in request_args:
        # Grab input values
        wallet_address = request_args['wallet_address']
        contract_address = request_args['contract_address']
        tokenId = request_args['tokenId']
    else:
        response_data['status'] = 'Invalid request parameters'
        return json.dumps(response_data), 200, headers

    # Check if there is already a datastore entry for this ticket
    value = peek_db(wallet_address=wallet_address, contract_address=contract_address, tokenId=tokenId)
    if value is False:
        # Form a new response if there is no Datastore entry
        response_data = generate_response(wallet_address=wallet_address, contract_address=contract_address,
                                          tokenId=tokenId)
        # Write info to the datastore
        write_db(wallet_address=wallet_address, contract_address=contract_address, tokenId=tokenId,
                 random_str=response_data['random_str'], message=response_data['message'])
    else:
        # Return existing entry back to the requester
        response_data = regenerate_response(db_entry=value)

    response_data['status'] = 'Message Created'
    return json.dumps(response_data), 200, headers
