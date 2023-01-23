const request = require('supertest');

const app = require('./app');

describe('Test the root path', () => {
  test('It should response the GET method', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .then((response) => {});
  });
});

describe('Test getting list of posts', () => {
  test('It should return an array of objects', () => {
    return request(app)
      .get('/api/post/get/all/0')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              title: expect.any(String),
              content: expect.any(String),
              user: expect.any(String),
              creationDate: expect.any(Number),
              lastEdit: expect.any(Number),
              likes: expect.any(Number),
              liked: expect.any(Boolean),
              comments: expect.any(Number)
            })
          ])
        );
      });
  });
});

describe('Test getting list of comments for a post', () => {
  test('It should return an object with the status (if the post exists, 200, else, 400) and an array of the comments', () => {
    return request(app)
      .get('/api/post/comment/get/0')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            status: expect.any(Number),
            comments: expect.arrayContaining([
              expect.objectContaining({
                comment: expect.any(String),
                user: expect.any(String),
                creationDate: expect.any(Number)
              })
            ])
          })
        );
      });
  });
});
