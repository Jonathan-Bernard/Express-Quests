const request = require("supertest");
const crypto = require("node:crypto");
const app = require("../src/app");

describe("GET /api/users", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/users/:id", () => {
  it("should return one user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  it("should return no user", async () => {
    const response = await request(app).get("/api/users/0");
    expect(response.status).toEqual(404);
  });
});

describe("POST /api/users", () => {
  it("should return created user", async () => {
    const newUser = {
      firstname: "Denis",
      lastname: "Lamalice",
      email: `${crypto.randomUUID()}@test.com`,
      city: "Lens",
      language: "French",
    };

    const response = await request(app).post("/api/users").send(newUser);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const [result] = await database.query(
      "SELECT * FROM users WHERE id=?",
      response.body.id
    );

    const [userInDatabase] = result;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase.email).toStrictEqual(newUser.email);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Useroùilmanquedeschoses" };

    const response = await request(app)
      .post("/api/users")
      .send(userWithMissingProps);

    expect(response.status).toEqual(422);
  });
});

describe("PUT /api/users/:id", () => {
  it("should edit user", async () => {
    const newUser = {
      firstname: "Bob",
      lastname: "Lenon",
      email: `${crypto.randomUUID()}@skt.com`,
      city: "Cyrodil",
      language: "French",
    };

    const [result] = await database.query(
      "INSERT INTO users(firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)",
      [
        newUser.firstname,
        newUser.lastname,
        newUser.email,
        newUser.city,
        newUser.language,
      ]
    );

    const id = result.insertId;

    const updatedUser = {
      firstname: "Karen",
      lastname: "Aigri",
      email: `${crypto.randomUUID()}@jdg.com`,
      city: "Kensas-city",
      language: "English",
    };

    const response = await request(app)
      .put(`/api/users/${id}`)
      .send(updatedUser);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(204);

    const [results] = await database.query(
      "SELECT * FROM users WHERE id=?",
      id
    );

    const [userInDatabase] = results;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase.firstname).toStrictEqual(updatedUser.firstname);

    expect(userInDatabase).toHaveProperty("lastname");
    expect(userInDatabase.lastname).toStrictEqual(updatedUser.lastname);

    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase.email).toStrictEqual(updatedUser.email);

    expect(userInDatabase).toHaveProperty("city");
    expect(userInDatabase.city).toStrictEqual(updatedUser.city);

    expect(userInDatabase).toHaveProperty("language");
    expect(userInDatabase.language).toStrictEqual(updatedUser.language);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Capsnotenoughprops" };

    const response = await request(app)
      .put(`/api/users/1`)
      .send(userWithMissingProps);

    expect(response.status).toEqual(422);
  });

  it("should return no user", async () => {
    const newUser = {
      firstname: "Seb",
      lastname: "Lafrite",
      email: `${crypto.randomUUID()}@g2.com`,
      city: "Maubeuge",
      language: "French",
    };

    const response = await request(app).put("/api/users/0").send(newUser);

    expect(response.status).toEqual(404);
  });
});

const database = require("../database");

afterAll(() => database.end());
