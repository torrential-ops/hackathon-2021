import requests
import json

def etherscan_call(account):
  raindrops_contract = '0x189B5b93053DBB00640bD9fC5493584ae261505d'

  # Load private key
  api_tkn = open("./api_key.txt", "r").read()

  etherscan_link = f'https://api-rinkeby.etherscan.io/api?module=account&action=tokennfttx&contractaddress={raindrops_contract}' \
                  f'&address={account}&page=1&offset=100&sort=asc&apikey={api_tkn}'

  # Request message from the cloud server
  headers = {'Content-type': 'application/json',
            'User-Agent': 'Mozilla/5.0'}
  session = requests.Session()
  r = session.get(etherscan_link, headers=headers)
  data = r.json()

  token_IDs = []
  for token in data['result']:
      token_IDs.append(token["tokenID"])

  return token_IDs

def http_post(request):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
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

    request_json = request.get_json()
    if request.args and 'address' in request.args:
      tokens = etherscan_call(request.args['address'])
      return json.dumps({"tokens": tokens}), 200, headers
    elif request_json and 'address' in request_json:
      tokens = etherscan_call(request_json['address'])
      return json.dumps({"tokens": tokens}), 200, headers
    else:
        return f'ERROR'
