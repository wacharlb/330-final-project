const request = require("supertest");

const server = require("../server");
const testUtils = require("../test-utils");

const User = require("../models/user");
const Food = require("../models/food");

describe("/foods", () => {
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
    protein: 10,
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
    protein: 8,
    fat: 12,
    sodium: 140
  };

  const foods = [food0, food1];

  describe("Before login", () => {
    describe("POST /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).post("/foods").send(food0)
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .post("/foods")
          .set("Authorization", "Bearer BAD")
          .send(food0);
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/foods").send(food0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/foods")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    })
    describe("GET /:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/foods/123").send(food0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/foods/456")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
  });
  describe("after login", () => {
    const user0 = {
      email: "user0@mail.com",
      password: "password_abc",
    };
    const user1 = {
      email: "user1@mail.com",
      password: "password_xyz",
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
        { $push: { roles: "admin" } }
      );
      const res1 = await request(server).post("/auth/login").send(user1);
      adminToken = res1.body.token;
    });
    describe("POST /", () => {
      it("should send 400 if food item is incorrectly formatted", async () => {
        const malformedFood = {
          name: "Mixed Nuts",
          calories: 1200
        }; 
        const res = await request(server)
          .post("/foods")
          .set("Authorization", `Bearer ${adminToken}`)
          .send(malformedFood);
        expect(res.statusCode).toEqual(400);
        expect(res.text).toEqual("Food is null!");
      });
    });
    describe.each([food0, food1])("POST / item %#", (food) => {
      it("should send 200 to normal user store food items", async () => {
        const res = await request(server)
          .post("/foods")
          .set("Authorization", "Bearer " + token0)
          .send(food);
        expect(res.statusCode).toEqual(200);

        // Count the number of food items after this request
        const foodCount = await Food.countDocuments();
        console.log("Food.countDocuments(): ", foodCount);

        expect(foodCount).toEqual(1);
      });
      it("should send 200 to admin user and store food", async () => {
        const res = await request(server)
          .post("/foods")
          .set("Authorization", "Bearer " + adminToken)
          .send(food);
        expect(res.statusCode).toEqual(200);
        console.log("food:", food);
        console.log("res.body:", res.body);
        expect(res.body).toMatchObject(food);
        const savedFood = await Food.findOne({ _id: res.body._id }).lean();
        expect(savedFood).toMatchObject(food);
      });
      it("should send 400 to normal user if food item is incorrectly formated", async () => {
        const malformedFood = {
          name: "Mixed Nuts",
          calories: 1200
        }
        const res = await request(server)
          .post("/foods")
          .set("Authorization", "Bearer " + adminToken)
          .send(malformedFood);
          expect(res.statusCode).toEqual(400);
      });
    });
    describe.each(foods)("PUT / food %#", (food) => {
      let originalFood;
      beforeEach(async () => {
        const res = await request(server)
          .post("/foods")
          .set("Authorization", "Bearer " + adminToken)
          .send(food);
        originalFood = res.body;
      });
      it("should send 200 to normal user and not update food", async () => {
        const updatedFood = {
          name: "Swiss Rolls",
          calories: 380,
          servingSize: 2,
          servingSizeUnits: "cakes",
          servings: 1,
          carbs: 44,
          protein: 5,
          fat: 10,
          sodium: 110
        }
        const res = await request(server)
          .put("/foods/" + originalFood._id)
          .set("Authorization", "Bearer " + token0)
          .send(updatedFood);
          // .send({ ...food, price: food.price + 1 });
        expect(res.statusCode).toEqual(200);
        const newFood = await Food.findById(originalFood._id).lean();
        newFood._id = newFood._id.toString();
        console.log("newFood:", newFood);
        console.log("updatedFood:", updatedFood);

        expect(newFood).toMatchObject(updatedFood);
      });
      it("should send 200 to admin user and update food", async () => {
        const updatedFood = {
          name: "Swiss Rolls",
          calories: 380,
          servingSize: 2,
          servingSizeUnits: "cakes",
          servings: 1,
          carbs: 44,
          fat: 10,
          sodium: 110
        }
        const res = await request(server)
          .put("/foods/" + originalFood._id)
          .set("Authorization", "Bearer " + adminToken)
          .send(updatedFood);
        expect(res.statusCode).toEqual(200);
        const newFood = await Food.findById(originalFood._id).lean();
        newFood._id = newFood._id.toString();
        expect(newFood).toMatchObject(updatedFood);
      });
    });
    describe("GET /:id food does not exist", (food) => {
      it("should send 400 to normal user when item does not exist", async () => {
        const res = await request(server)
          .get("/foods/" + 123)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(400);
      });
    });
    describe.each(foods)("GET /:id item %#", (food) => {
      let originalFood;
      beforeEach(async () => {
        const res = await request(server)
          .post("/foods")
          .set("Authorization", "Bearer " + adminToken)
          .send(food);
        originalFood = res.body;
      });
      it("should send 200 to normal user and return food", async () => {
        const res = await request(server)
          .get("/foods/" + originalFood._id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(originalFood);
      });
      it("should send 200 to admin user and return food", async () => {
        const res = await request(server)
          .get("/foods/" + originalFood._id)
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(originalFood);
      });
    });
    describe("GET /", () => {
      let insertedFoods;
      beforeEach(async () => {
        insertedFoods = (await Food.insertMany([food0, food1])).map((i) => i.toJSON());
        insertedFoods.forEach((i) => (i._id = i._id.toString()));
      }); 
      it("should send 200 to normal user and return all foods", async () => {
        console.log("insertedFood:", insertedFoods);
        const res = await request(server)
          .get("/foods/")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(insertedFoods);
      });
      it("should send 200 to admin user and return all items", async () => {
        const res = await request(server)
          .get("/foods/")
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        console.log("res.body:", res.body);
        console.log("insertedFoods:", insertedFoods);
        expect(res.body).toMatchObject(insertedFoods);
      });
    });
    describe("DELETE /", () => {
      beforeEach(async () => {
        insertedFoods = (await Food.insertMany([food0, food1])).map((i) => i.toJSON());
        insertedFoods.forEach((i) => (i._id = i._id.toString()));
      });
      it("should reject a delete from normal unathorized user", async () => {
        console.log("foods.test, delete / test called");
        const res = await request(server)
          .delete("/foods/")
          .set("Authorization", "Bearer " + token0)
          .send({});
        expect(res.statusCode).toEqual(403);
      });
      it("should delete all foods from an admin authorized user", async () => {
        console.log("foods.test, delete / test called");
        const res = await request(server)
          .delete("/foods/")
          .set("Authorization", "Bearer " + adminToken)
          .send({});
        expect(res.statusCode).toEqual(200);
      });
    });
    describe("DELETE /:id", () => {
      beforeEach(async () => {
        insertedFoods = (await Food.insertMany([food0, food1])).map((i) => i.toJSON());
        insertedFoods.forEach((i) => (i._id = i._id.toString()));
      }); 
      it("should reject a bad id for a normal user", async () => {
        const res = await request(server)
          .delete("/foods/fake")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(400);
      });
      it("should delete the expected food for a normal user", async () => {
        const storedFoods = await Food.find({}).lean();
        console.log("food.test, delete /:id, foods", storedFoods);
        const storedFood1Id = storedFoods[0]._id;
        console.log("food.test, delete /:id, food1Id:", storedFood1Id);
        const res = await request(server)
          .delete("/foods/" + storedFood1Id)
          .set("Authorization", "Bearer " + adminToken)
          .send({});
        expect(res.statusCode).toEqual(200);
        const storedFood = await Food.findOne({ storedFood1Id });
        expect(storedFood).toBeNull();
      });
      it("should reject a bad id for a admin user", async () => {
        const res = await request(server)
          .delete("/foods/fake")
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(400);
      });
      it("should delete the expected food for a admin user", async () => {
        const storedFoods = await Food.find({}).lean();
        console.log("food.test, delete /:id, foods", storedFoods);
        const storedFood1Id = storedFoods[0]._id;
        console.log("food.test, delete /:id, food1Id:", storedFood1Id);
        const res = await request(server)
          .delete("/foods/" + storedFood1Id)
          .set("Authorization", "Bearer " + adminToken)
          .send({});
        expect(res.statusCode).toEqual(200);
        const storedFood = await Food.findOne({ storedFood1Id });
        expect(storedFood).toBeNull();
      });
    });
  });
})