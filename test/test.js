var should      = require('chai').should(),
    expect      = require('chai').expect(),
    supertest   = require('supertest'),
    api         = supertest('http://localhost:8085/api/v1/');

var randamString = Math.random().toString(36).substring(2,7);

var name = randamString,
    email = randamString + '@gmail.com',
    password = '1234567',
    productName = 'Test Product',
    price = 5,
    description = "test description",
    currency = 'CAD',
    page = 1,
    limit = 5,
    token,
    productId = "1234";




describe('Create Users', function () {
    it('Should return a 200 response', function (done) {
        //use this.timeout(6000); to set timeout in miliseconds, default value for the timeout is 2000 miliseconds
        api.post('user')
            .send({
                "name": name,
                "email": email,
                "password": password,
                "confirmPassword": password
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done);
    });
});

describe('Create Users validation error', function () {
    it('Should return a 400 response', function (done) {
        //use this.timeout(6000); to set timeout in miliseconds, default value for the timeout is 2000 miliseconds
        api.post('user')
            .send({
                "name": name,
                "email": "",
                "password": password,
                "confirmPassword": password
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, done);
    });
});

describe('Login user',function () {
    it('Should return a 200 response', function (done) {
        //use this.timeout(6000); to set timeout in miliseconds, default value for the timeout is 2000 miliseconds
        api.post('user/login')
            .send({
                "email":email,
                "password": password
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(function(res) {
                console.log('Token generated : ',res.body.response.token);
                if (!!res.body && !!res.body.response && !!res.body.response.token) {
                    token = res.body.response.token;
                }
            })
            .expect(200, done);
    });
});

describe('Create product', function () {
    it('Should return a 200 response', function (done) {
        api.post('product')
            .set('token', token)
            .send({
                "name": productName,
                "price": price,
                "description": description
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done);
    });
});

describe('get most view product list', function () {
    it('Should return a 200 response', function (done) {
        api.get('product/most-view')
            .set('token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(function(res) {
                console.log('productId = ',res.body.response[0]["productId"]);
                if (!!res.body && !!res.body.response && !!res.body.response[0]) {
                    productId = res.body.response[0]["productId"];
                }
            })
            .expect(200, done);
    });
});

describe('get Product', function () {
    it('Should return a 200 response', function (done) {
        api.get(`product/${productId}`)
            .set('token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(function(res) {
                //console.log('+++++',res.body);
            })
            .expect(200, done);
    });
});

describe('delete Product', function () {
    it('Should return a 200 response', function (done) {
        api.delete(`product/${productId}`)
            .set('token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(function(res) {
                //console.log('+++++',res.body);
            })
            .expect(200, done);
    });
});


