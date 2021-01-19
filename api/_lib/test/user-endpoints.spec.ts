export {}
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const gql = require('graphql-tag')

let app: any

const { expect } = chai
chai.use(chaiHttp)

before(async () => {
  app = await server.default
})

describe('User Endpoints', () => {
  it('can create a new account', async () => {
    const res = await chai.request(app).post('/api').send({
      query:
        'mutation { register ( email: "fake@example.com", username: "Myusername", password: "password" ) { email } }',
    })
    expect(res.body.data.register.email).to.exist
  })
  it("can't create a new account with a duplicate email", async () => {
    const res = await chai.request(app).post('/api').send({
      query:
        'mutation { register (email: "fake@example.com", username: "Myusername", password: "password" ) { email } }',
    })
    expect(res.body.errors[0].message).to.be.a(
      'string',
      'Error: \nInvalid `prisma.user.create()` invocation:\n\n\n  Unique constraint failed on the fields: (`email`)',
    )
  })
  it('can login with email and password', async () => {
    const res = await chai.request(app).post('/api').send({
      query:
        'mutation { login (email: "test@example.com", password: "testing" ) { email } }',
    })
    expect(res.body.data.login.email).to.exist
  })
  it("can't login with wrong password", async () => {
    const res = await chai.request(app).post('/api').send({
      query:
        'mutation { login (email: "test@example.com", password: "wrongpassword" ) { email } }',
    })
    expect(res.body.errors[0].message).to.be.a('string', 'Login failed.')
  })
  it("can't login with wrong email", async () => {
    const res = await chai.request(app).post('/api').send({
      query:
        'mutation { login (email: "wrongemail@example.com", password: "wrongpassword" ) { email } }',
    })
    expect(res.body.errors[0].message).to.be.a('string', 'Login failed.')
  })
  it("can't view user details without being logged in", async () => {
    const res = await chai.request(app).post('/api').send({
      query: '{ me { email } }',
    })
    expect(res.body.errors[0].message).to.be.a('string', 'Not Authorised!')
  })
  it('logged in users can view user details', async () => {
    const res = await chai
      .request(app)
      .post('/api')
      .set('Cookie', 'accessToken=' + process.env.ACCESS_TOKEN)
      .send({
        query: '{ me { email } }',
      })
    expect(res.body.data.me.email).to.exist
  })
})
