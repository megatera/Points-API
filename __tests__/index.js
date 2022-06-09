const request = require('supertest');
const server = 'http://localhost:3000';

describe('POST \'/transaction\'', () => {
  it('should add a transaction for a specific payer and date', async () => {
    const response = await request(server)
      .post('/transaction')
      .send({ payer: "DANNON", points: 1000, timestamp: "2020-11-02T14:00:00Z" })
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ DANNON: 1000 });
  });

  it('should fail to add a transaction if payer parameter is missing', async () => {
    const response = await request(server)
      .post('/transaction')
      .send({ points: 1000, timestamp: "2020-11-02T14:00:00Z" })
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ err: "Invalid request: Missing parameter(s)" });
  });

  it('should fail to add a transaction if points parameter is missing', async () => {
    const response = await request(server)
      .post('/transaction')
      .send({ payer: "DANNON", timestamp: "2020-11-02T14:00:00Z" })
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ err: "Invalid request: Missing parameter(s)" });
  });

  it('should fail to add a transaction if payer is not a string', async () => {
    const response = await request(server)
      .post('/transaction')
      .send({ payer: null, points: 1000, timestamp: "2020-11-02T14:00:00Z"});
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ err: "Invalid parameter(s)"});
  });

  it('should fail to add a transaction if points is not a number', async () => {
    const response = await request(server)
      .post('/transaction')
      .send({ payer: "DANNON", points: "hello", timestamp: "2020-11-02T14:00:00Z"});
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ err: "Invalid parameter(s)"});
  });

  it('should fail to add a transaction if it will result in a negative balance for the payer', async () => {
    const response = await request(server)
      .post('/transaction')
      .send({ payer: "UNILEVER", points: -200, timestamp: "2020-11-02T14:00:00Z"});
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ err: "Invalid request" });
  })
});

describe('GET \'/balance\'', () => {
  it('should return all payer point balances', async () => {
    const response = await request(server)
      .get('/balance')
      .set('Accept', 'application/json')
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ DANNON: 1000 });
  });
});

describe('POST \'/spend\'', () => {
  it('should spend oldest points first and return a summary of points spent', async () => {
    await request(server)
      .post('/transaction')
      .send({ payer: "UNILEVER", points: 200, timestamp: "2020-10-31T11:00:00Z" })
    await request(server)
      .post('/transaction')
      .send({ payer: "DANNON", points: -200, timestamp: "2020-10-31T15:00:00Z" })
    await request(server)
      .post('/transaction')
      .send({ payer: "MILLER COORS", points: 10000, timestamp: "2020-11-01T14:00:00Z" })
    await request(server)
      .post('/transaction')
      .send({ payer: "DANNON", points: 300, timestamp: "2020-10-31T10:00:00Z" })

    const response = await request(server)
      .post('/spend')
      .send({ points: 5000 })
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { payer: "DANNON", points: -100 }, 
      { payer: "UNILEVER", points: -200 }, 
      { payer: "MILLER COORS", points: -4700 }
    ]);
  });

  it('should fail to spend points if there are not enough points to spend', async() => {
    const response = await request(server)
      .post('/spend')
      .send({ points: 12000 })
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ err: "Not enough points to spend." });
  });

  it('should fail to spend points if request is not a number', async() => {
    const response = await request(server)
      .post('/spend')
      .send({ points: "hello" })
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ err: "Invalid points parameter." });
  });

  it('should fail to spend a negative number of points', async() => {
    const response = await request(server)
      .post('/spend')
      .send({ points: -300 })
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ err: "Invalid points parameter." });
  });
});

