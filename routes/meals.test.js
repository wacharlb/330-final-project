const request = require("supertest");

const server = require("../server");
const testUtils = require("../test-utils");

const User = require("../models/user");
const Item = require("../models/food");
const Order = require("../models/meal");

describe("/meals", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  const food0 = {
    name: "Mixed Nuts",
    calories: 200,
    servingSize: 1,
    servingSizeUnits: "ounces",
    servings: 1,
    carbs: 4,
    fat: 21,
    sodium: 50
  };
  const food1 = {
    name: "Swiss Rolls",
    calories: 280,
    servingSize: 2,
    servingSizeUnits: "cakes",
    servings: 1,
    carbs: 40,
    fat: 12,
    sodium: 140
  };

  const foods = [food0, food1];

  describe("Before login", () => {
    describe("POST /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).post("/meals").send(food0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .post("/meals")
          .set("Authorization", "Bearer BAD")
          .send(food0);
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/meals").send(food0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/meals")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET /:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/meals/123").send(food0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/meals/456")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
  });
  describe("after login", () => {
    const user0 = {
      email: "user0@mail.com",
      password: "123password",
    };
    const user1 = {
      email: "user1@mail.com",
      password: "456password",
    };
    let token0;
    let adminToken;
    beforeEach(async () => {
      await request(server).post("/auth/signup").send(user0);
      const res0 = await request(server).post("/auth/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/auth/signup").send(user1);
      await User.updateOne(
        { email: user1.email },
        { $push: { roles: "admin" } },
      );
      const res1 = await request(server).post("/auth/login").send(user1);
      adminToken = res1.body.token;
    });
    describe("POST /", () => {
      it("should send 200 to normal user and create meal", async () => {
        const res = await request(server)
          .post("/meals")
          .set("Authorization", "Bearer " + token0)
          .send(foods.map((i) => i._id));
        expect(res.statusCode).toEqual(200);
        const storedMeal = await Meal.findOne().lean();
        expect(storedMeal).toMatchObject({
          items: foods.map((i) => i._id),
          userId: (await User.findOne({ email: user0.email }).lean())._id,
          total: 22,
        });
      });
      it("should send 200 to admin user and create meal with repeat foods", async () => {
        const res = await request(server)
          .post("/foods")
          .set("Authorization", "Bearer " + adminToken)
          .send([foods[1], foods[1], foods[0]].map((i) => i._id));
        expect(res.statusCode).toEqual(200);
        const storedMeal = await Meal.findOne().lean();
        expect(storedMeal).toMatchObject({
          foods: [foods[1]._id, foods[1]._id, foods[0]._id],
          userId: (await User.findOne({ email: user1.email }))._id,
          total: 34,
        });
      });
      it("should send 400 with a bad item _id", async () => {
        const res = await request(server)
          .post("/orders")
          .set("Authorization", "Bearer " + adminToken)
          .send([items[1], "5f1b8d9ca0ef055e6e5a1f6b"].map((i) => i._id));
        expect(res.statusCode).toEqual(400);
        const storedOrder = await Order.findOne().lean();
        expect(storedOrder).toBeNull();
      });
    });
  });
});