'''
========================
SrvExchange_Server module
========================
Created on August.11, 2020
@author: Xu Ronghua
@Email:  rxu22@binghamton.edu
@TaskDescription: This module provide encapsulation of Time Banking-SrvExchangeToken Microservices API that handle and response client's request.
'''

import time
import json
from flask import Flask, jsonify
from flask import abort, make_response, request
from flask_cors import CORS

from utilities import FileUtil, TypesUtil
from SrvExchangeToken import SrvExchangeToken

app = Flask(__name__)

CORS(app, supports_credentials=True, resources={
    r"/TB/api/v1.0/*": {"origins": "http://localhost:3000"}})

# global variable
http_provider = 'http://localhost:7545'
contract_addr_list = json.load(open('./data/contract_addr_list.json'))
contract_config = '/Users/zhezhai/VscodeProjects/BlockChain/Time_Banking/client/src/contracts/{}.json'

mySrvExchange = dict()

# new SrvExchangeToken object
for key, value in contract_addr_list.items():
    mySrvExchange[value] = SrvExchangeToken(
        http_provider, value, contract_config.format(key))
    # mySrvExchange = SrvExchangeToken(http_provider, contract_addr, contract_config)

    # ========================================== Error handler ===============================================
    # Error handler for abort(404)


@app.errorhandler(404)
def not_found(error):
    # return make_response(jsonify({'error': 'Not found'}), 404)
    response = jsonify(
        {'result': 'Failed', 'message':  error.description['message']})
    response.status_code = 404
    return response

# Error handler for abort(400)


@app.errorhandler(400)
def type_error(error):
    # return make_response(jsonify({'error': 'type error'}), 400)
    response = jsonify(
        {'result': 'Failed', 'message':  error.description['message']})
    response.status_code = 400
    return response

# Error handler for abort(401)


@app.errorhandler(401)
def access_deny(error):
    response = jsonify(
        {'result': 'Failed', 'message':  error.description['message']})
    response.status_code = 401
    return response


# ========================================== Request handler ===============================================
# GET query indexToken for specific index_id
@app.route('/TB/api/v1.0/getService', methods=['GET'])
def getService():

    start_time = time.time()
    contract_addr = request.args.get('contract_addr')
    service_data = mySrvExchange[contract_addr].getService()
    exec_time = time.time()-start_time
    FileUtil.save_testlog(
        'test_results', 'exec_getService.log', format(exec_time*1000, '.3f'))

    json_data = {}

    json_data['dealer'] = {}
    json_data['dealer']['uid'] = service_data[0]
    json_data['dealer']['balance'] = service_data[1]

    json_data['provider'] = {}
    json_data['provider']['vid'] = service_data[2]
    json_data['provider']['serviceinfo'] = service_data[3]
    json_data['provider']['status'] = service_data[4]

    json_data['recipient'] = {}
    json_data['recipient']['vid'] = service_data[5]
    json_data['recipient']['serviceinfo'] = service_data[6]
    json_data['recipient']['status'] = service_data[7]

    return jsonify({'result': 'Succeed', 'data': json_data}), 201


@app.route('/TB/api/v1.0/initAccount', methods=['POST'])
def initAccount():
    req_data = TypesUtil.bytes_to_string(request.data)
    json_data = TypesUtil.string_to_json(req_data)

    contract_addr = json_data['contract_addr']
    client_addr = json_data['client_addr']

    mySrvExchange[contract_addr].initAccount(client_addr)
    return jsonify({'initAccount': 'Succeed'}), 201


@app.route('/TB/api/v1.0/setAccount', methods=['POST'])
def setAccount():
    req_data = TypesUtil.bytes_to_string(request.data)
    json_data = TypesUtil.string_to_json(req_data)

    contract_addr = json_data['contract_addr']
    client_addr = json_data['client_addr']
    status = json_data['status']
    balance = json_data['balance']

    mySrvExchange[contract_addr].setAccount(client_addr, status, balance)

    return jsonify({'setAccount': 'Succeed'}), 201


@app.route('/TB/api/v1.0/getAccount', methods=['GET'])
def getAccount():
    # parse data from request.data
    # req_data = TypesUtil.bytes_to_string(request.data)
    # json_data = TypesUtil.string_to_json(req_data)

    contract_addr = request.args.get('contract_addr')
    client_addr = request.args.get('addr')

    start_time = time.time()
    service_data = mySrvExchange[contract_addr].getAccount(client_addr)
    exec_time = time.time()-start_time
    FileUtil.save_testlog(
        'test_results', 'exec_getAccount.log', format(exec_time*1000, '.3f'))

    json_data = {}

    json_data['account'] = client_addr
    json_data['uid'] = service_data[0]
    json_data['balance'] = service_data[1]
    json_data['status'] = service_data[2]

    return jsonify({'result': 'Succeed', 'data': json_data}), 201


@app.route('/TB/api/v1.0/initService', methods=['GET'])
def initService():
    contract_addr = request.args.get('contract_addr')

    mySrvExchange[contract_addr].initService()

    return jsonify({'initService': 'Succeed'}), 201


@app.route('/TB/api/v1.0/registerService', methods=['POST'])
def registerService():
    # parse data from request.data
    req_data = TypesUtil.bytes_to_string(request.data)
    json_data = TypesUtil.string_to_json(req_data)

    contract_addr = json_data['contract_addr']
    client_addr = json_data['client_addr']
    op_state = json_data['op_state']
    service_info = json_data['service_info']

    if(op_state == 1):
        mySrvExchange[contract_addr].updateRecipient(client_addr, service_info)
    else:
        mySrvExchange[contract_addr].updateProvider(client_addr, service_info)

    return jsonify({'registerService': 'Succeed'}), 201


@app.route('/TB/api/v1.0/negotiateService', methods=['POST'])
def negotiateService():
    # parse data from request.data
    req_data = TypesUtil.bytes_to_string(request.data)
    json_data = TypesUtil.string_to_json(req_data)

    contract_addr = json_data['contract_addr']
    client_addr = json_data['client_addr']
    op_state = json_data['op_state']
    time_currency = json_data['time_currency']

    if(op_state == 2):
        mySrvExchange[contract_addr].recipient_withdraw(client_addr)
    elif(op_state == 1):
        mySrvExchange[contract_addr].recipient_deposit(
            client_addr, time_currency)
    else:
        mySrvExchange[contract_addr].provider_confirm(client_addr)

    return jsonify({'negotiateService': 'Succeed'}), 201


@app.route('/TB/api/v1.0/commitService', methods=['POST'])
def commitService():
    # parse data from request.data
    req_data = TypesUtil.bytes_to_string(request.data)
    json_data = TypesUtil.string_to_json(req_data)

    contract_addr = json_data['contract_addr']
    client_addr = json_data['client_addr']

    mySrvExchange[contract_addr].service_commit(client_addr)

    return jsonify({'commitService': 'Succeed'}), 201


@app.route('/TB/api/v1.0/paymentService', methods=['POST'])
def paymentService():
    # parse data from request.data
    req_data = TypesUtil.bytes_to_string(request.data)
    json_data = TypesUtil.string_to_json(req_data)

    contract_addr = json_data['contract_addr']
    client_addr = json_data['client_addr']

    mySrvExchange[contract_addr].service_payment(client_addr)

    return jsonify({'paymentService': 'Succeed'}), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True, threaded=True)
