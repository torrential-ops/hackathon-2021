import json
import pyqrcode
from google.cloud import datastore

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
    # Init an empty json response
    response_data = {}

    request_json = request.get_json(silent=True)
    request_args = request.args

    if request_json and 'signed_message' in request_json:
        # Grab input values
        signed_message = request_json['signed_message']
    elif request_args and 'signed_message' in request_args:
        # Grab input values
        signed_message = request_args['signed_message']
    else:
        response_data['status'] = 'Invalid request parameters'
        return json.dumps(response_data)

    # Load the QR Code Back up and Return
    response_data['qr_code'] = pyqrcode.create(signed_message).png_as_base64_str(scale=2)

    response_data['status'] = 'Message Created'
    return json.dumps(response_data)
