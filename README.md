# Points API

## Installation
- Install [node.js](http://nodejs.org/)
- Clone repo and run `npm install` to install dependencies
- Run `npm start` to start server

## Endpoints

### /transaction
To add a transaction, send a POST request to the `/transaction` endpoint with the following parameters:
| Parameter | Data Type| Description                                              |
|-----------|----------|----------------------------------------------------------|
|   payer   |  string  | name of payer                                            |
|   points  |  integer | number of points; positive to credit; negative to debit  |
| timestamp |  string  | date and time of transaction; YYYY-MM-DDTHH:MM:SSZ       |

Response:
```{ payer: new balance }```

### /balance
To get all payer balances, send a GET request to the `/balance` endpoint<br>

Response:
```{ payer1: balance, payer2: balance, payer3: balance }```

### /spend
To spend points, send a POST request to the `/spend` endpoint with the following parameters:

| Parameter | Data Type| Description                                        |
|-----------|----------|----------------------------------------------------|
|  points   |  integer | number of points to spend; must be greater than 0  |

Response:
```[{ payer: payer1, points: -x }, { payer: payer2, points: -y }, { payer: payer3, points: -z }]```

## Example
Add a series of transactions:
| Request                                                                                | Response:                      |
|----------------------------------------------------------------------------------------|--------------------------------|
|```{ "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" }```        | ```{ "DANNON": 1000 }```       |
|```{ "payer": "UNILEVER", "points": 200, "timestamp": "2020-10-31T11:00:00Z" }```       | ```{ "UNILEVER": 200 }```      |
|```{ "payer": "DANNON", "points": -200, "timestamp": "2020-10-31T15:00:00Z" }```        | ```{ "DANNON": 800 }```        |
|```{ "payer": "MILLER COORS", "points": 10000, "timestamp": "2020-11-01T14:00:00Z" }``` | ```{ "MILLER COORS": 10000 }```|
|```{ "payer": "DANNON", "points": 300, "timestamp": "2020-10-31T10:00:00Z" }```         | ```{ "DANNON": 1100 }```       |

Followed by a request to spend points:
| Request                | Response:                                                                                              |
|------------------------|--------------------------------------------------------------------------------------------------------|
|```{ "points": 5000 }```|```[{ "payer": "DANNON", "points": -100 }, { "payer": "UNILEVER", "points": -200, "payer": "MILLER COORS",  points: -4,700 }]```|

Followed by a request for the resulting payer balances:<br>
| Request      | Response:                                                |
|--------------|----------------------------------------------------------|
| GET /balance | `{ "DANNON": 1000, "UNILEVER": 0, "MILLER COORS": 5300 }`|


## To Do
- more efficient way to sort transactions? different data structure?
- decouple tests further + add test cases for utils
- could further modularize pointsController if transactions/balances not stored in memory