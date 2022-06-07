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
| timestamp |  string  | date and time of transaction; YYYY-MM-DDTHH:MM:SSZ |

### /balance
To get all payer balances, send a GET request to the `/balance` endpoint

### /spend
To spend points, send a POST request to the `/spend` endpoint with the following parameters:

| Parameter | Data Type| Description                                              |
|-----------|----------|----------------------------------------------------------|
|  points   |  integer | number of points to spend; must be greater than 0        |

## Example
Add a series of transactions:
- { "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" }
- { "payer": "UNILEVER", "points": 200, "timestamp": "2020-10-31T11:00:00Z" }
- { "payer": "DANNON", "points": -200, "timestamp": "2020-10-31T15:00:00Z" }
- { "payer": "MILLER COORS", "points": 10000, "timestamp": "2020-11-01T14:00:00Z" }
- { "payer": "DANNON", "points": 300, "timestamp": "2020-10-31T10:00:00Z" }

Followed a request to spend points:
Request: { "points": 5000 }

Followed by a request for the resulting payer balances:
Response:
{
"DANNON": 1000,
"UNILEVER": 0,
"MILLER COORS": 5300
}