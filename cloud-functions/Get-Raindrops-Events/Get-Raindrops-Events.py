import json
from web3.auto import Web3


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

    if request_json and 'chain_id' in request_json:
        # Grab input values
        chain_id = request_json['chain_id']
    elif request_args and 'chain_id' in request_args:
        # Grab input values
        chain_id = request_args['chain_id']
    else:
        response_data['status'] = 'Invalid request parameters'
        return json.dumps(response_data)

    # Connect to web3 provider - rinkeby
    if chain_id == 'rinkeby':
        eth_url = open("./ethereum_provider.txt", "r").read()
        w3 = Web3(Web3.HTTPProvider(eth_url))

        # Load Raindrops Contract
        raindrops_addr = w3.toChecksumAddress('0x189B5b93053DBB00640bD9fC5493584ae261505d')
        raindrops_abi = json.load(open('./Raindrops.abi.json', ))
        raindrops_contract = w3.eth.contract(address=raindrops_addr, abi=raindrops_abi)

        # Get the total number of events
        num_events = raindrops_contract.functions.totalEvents().call()

        # Grab info from all of the events
        for i in range(num_events):
            event_name = raindrops_contract.functions.eventNumberToEventName(i + 1).call()
            event_info = raindrops_contract.functions.getEventInfo(event_name).call()

            event_desc = event_info[1]
            event_date = event_info[2]
            event_tickets = event_info[3]
            event_owner = event_info[4]

            response_data[event_name] = {"name": event_name, "description": event_desc, "event_date": event_date,
                                         "tickets": event_tickets, "owner": event_owner}

        return json.dumps(response_data), 200, headers
    else:
        return 'Chain not supported', 400, headers
