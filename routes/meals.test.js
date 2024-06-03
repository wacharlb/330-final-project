const request = require("supertest");

const server = require("../server");
const testUtils = require("../test-utils");

const User = require("../models/user");
const Food = require("../models/food");
const Meal = require("../models/meal");

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
    protein: 20,
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
    protein: 10,
    fat: 12,
    sodium: 140
  };

  let foods;
  let meal;
  beforeEach(async () => {
    foods = (await Food.insertMany([food0, food1])).map((i) => i.toJSON());  
    meal = {
      foods: foods.map((i) => i._id.toString()),
      mealType: "Snack" 
    }
  });
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
          .send(meal);
        expect(res.statusCode).toEqual(200);
        const storedMeal = await Meal.findOne().lean();
        expect(storedMeal).toMatchObject({
          foods: foods.map((i) => i._id),
          mealType: "Snack",
          userId: (await User.findOne({ email: user0.email }).lean())._id,
          totalCalories: 480,
          totalCarb: 44,
          totalProtein: 30,
          totalFat: 33,
          totalSodium: 190
        });
      });
      it("should send 200 to admin user and create meal with repeat foods", async () => {
        let mealRepeatedFood = {foods: [foods[1], foods[1], foods[0]].map((i) => i._id), mealType: "Snack"};
        const res = await request(server)
          .post("/meals")
          .set("Authorization", "Bearer " + adminToken)
          .send({foods: [foods[1], foods[1], foods[0]].map((i) => i._id), mealType: "Snack"});
        expect(res.statusCode).toEqual(200);
        const storedMeal = await Meal.findOne().lean();
        expect(storedMeal).toMatchObject({
          foods: [foods[1]._id, foods[1]._id, foods[0]._id],
          mealType: "Snack",
          userId: (await User.findOne({ email: user1.email }))._id,
          totalCalories: 760,
          totalCarb: 84,
          totalProtein: 40,
          totalFat: 45,
          totalSodium: 330,
        });
      });
      it("should send 400 with a bad item _id", async () => {
        const res = await request(server)
          .post("/meals")
          .set("Authorization", "Bearer " + adminToken)
          .send({foods: [foods[1], "5f1b8d9ca0ef055e6e5a1f6b"].map((i) => i._id), mealType: "Snack"});
        expect(res.statusCode).toEqual(400);
        const storedMeal = await Meal.findOne().lean();
        expect(storedMeal).toBeNull();
      });
    });
    describe("GET /:id", () => {
      let order0Id, order1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/meals")
          .set("Authorization", "Bearer " + token0)
          .send({foods: [foods[0], foods[1], foods[1]].map((i) => i._id), mealType: "Snack"});
        meal0Id = res0.body._id;
        const res1 = await request(server)
          .post("/meals")
          .set("Authorization", "Bearer " + adminToken)
          .send({foods: [foods[1]].map((i) => i._id), mealType: "Snack"});
        meal1Id = res1.body._id;
      });
      it("should send 200 to normal user with their meal", async () => {
        const res = await request(server)
          .get("/meals/" + meal0Id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          foods: [food0, food1, food1],
          mealType: "Snack",
          userId: (await User.findOne({ email: user0.email }))._id.toString(),
          totalCalories: 760,
          totalCarb: 84,
          totalProtein: 40,
          totalFat: 45,
          totalSodium: 330
        });
      });
      it("should send 404 to normal user with someone else's meal", async () => {
        const res = await request(server)
          .get("/meals/" + meal1Id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(404);
      });
      it("should send 200 to admin user with their meal", async () => {
        const res = await request(server)
          .get("/meals/" + meal1Id)
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          foods: [food1],
          mealType: "Snack",
          userId: (await User.findOne({ email: user1.email }))._id.toString(),
          totalCalories: 280,
          totalFat: 12,
          totalCarb: 40,
          totalProtein: 10,
          totalSodium: 140
        });
      });
      it("should send 200 to admin user with someone else's meal", async () => {
        const res = await request(server)
          .get("/meals/" + meal0Id)
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          foods: [food0, food1, food1],
          mealType: "Snack",
          userId: (await User.findOne({ email: user0.email }))._id.toString(),
          totalCalories: 760,
          totalCarb: 84,
          totalFat: 45,
          totalProtein: 40,
          totalSodium: 330
        });
      });
    });
    describe("GET /", () => {
      let meal0Id, meal1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/meals")
          .set("Authorization", "Bearer " + token0)
          .send({foods: foods.map((i) => i._id), mealType: "Snack"});
        meal0Id = res0.body._id;
        const res1 = await request(server)
          .post("/meals")
          .set("Authorization", "Bearer " + adminToken)
          .send({foods: [foods[1]].map((i) => i._id), mealType: "Snack"});
        meal1Id = res1.body._id;
      });
      it("should send 200 to normal user with their one meal", async () => {
        const res = await request(server)
          .get("/meals")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        const food0 = await Food.findOne({_id: foods[0]._id}).lean();
        const food1 = await Food.findOne({_id: foods[1]._id}).lean();

        // Convert the food _id's to strings
        food0._id = food0._id.toString();
        food1._id = food1._id.toString();

        expect(res.body).toMatchObject([
          {
            // foods: [foods[0]._id.toString(), foods[1]._id.toString()],
            foods: [food0, food1],
            mealType: "Snack",
            userId: (await User.findOne({ email: user0.email }))._id.toString(),
            totalCalories: 480,
            totalCarb: 44,
            totalFat: 33,
            totalProtein: 30,
            totalSodium: 190
          },
        ]);
      });
      it("should send 200 to admin user all meals", async () => {
        const res = await request(server)
          .get("/meals")
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        const food0 = await Food.findOne({_id: foods[0]._id}).lean();
        const food1 = await Food.findOne({_id: foods[1]._id}).lean();

        // Convert the food _id's to strings
        food0._id = food0._id.toString();
        food1._id = food1._id.toString();

        const user_0 = await User.findOne({ email: user0.email });
        const user_1 = await User.findOne({ email: user1.email });

        // Construct expected objects
        const expectedMeals = [
          {
            foods: [food0, food1],
            mealType: "Snack",
            userId: user_0._id.toString(),
            totalCalories: 480,
            totalCarb: 44,
            totalProtein: 30,
            totalFat: 33,
            totalSodium: 190
          },
          {
            foods: [food1],
            mealType: "Snack",
            userId: user_1._id.toString(),
            totalCalories: 280,
            totalCarb: 40,
            totalProtein: 10,
            totalFat: 12,
            totalSodium: 140
          }
        ];
        // Compare received and expected objects
        expect(res.body).toMatchObject(expectedMeals);
      });
    });
    describe("GET /stats", () => {
      let meal0, meal1, meal2;
      let meal0Id, meal1Id, meal2Id;

      beforeEach(async () => {
        const res0 = await request(server)
          .post("/meals")
          .set("Authorization", "Bearer " + token0)
          .send({foods: foods.map((i) => i._id), mealType: "Breakfast"});
        meal0 = res0.body;
        meal0Id = res0.body._id;
        const res1 = await request(server)
        .post("/meals")
        .set("Authorization", "Bearer " + token0)
        .send({foods: [foods[1]].map((i) => i._id), mealType: "Lunch"});
        meal1 = res1.body;
        meal1Id = res1.body._id;
        const res2 = await request(server)
        .post("/meals")
        .set("Authorization", "Bearer " + token0)
        .send({foods: foods.map((i) => i._id), mealType: "Dinner"});
        meal2 = res2.body;
        meal2Id = res2.body._id;
      });
      it("should return something???", async () => {
        const res = await request(server)
          .get("/meals/stats")
          .set("Authorization", "Bearer " + token0)
          .send({ mealIds: [meal0Id, meal1Id, meal2Id] });
        const receivedResponse = res.body;
        const expectedResponse = {
          meals: [meal0Id, meal1Id, meal2Id],
          totalMealPlanCalories: 1240,
          totalMealPlanCarb: 128,
          totalMealPlanProtein: 70,
          totalMealPlanFat: 78,
          totalMealPlanSodium: 520
        }
        expect(receivedResponse).toMatchObject(expectedResponse);
      });
    });
    describe("DELETE /", () => {
      let meal0Id, meal1Id, meal2Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/meals")
          .set("Authorization", "Bearer " + token0)
          .send({foods: foods.map((i) => i._id), mealType: "Snack"});
        meal0Id = res0.body._id;
        const res1 = await request(server)
          .post("/meals")
          .set("Authorization", "Bearer " + token0)
          .send({foods: [foods[1]].map((i) => i._id), mealType: "Snack"});
        meal1Id = res1.body._id;
        const res2 = await request(server)
        .post("/meals")
        .set("Authorization", "Bearer " + adminToken)
        .send({foods: [foods[1]].map((i) => i._id), mealType: "Snack"});
        meal2Id = res1.body._id;
      });
      it("should send 200 to an admin user and delete all meals for all users", async () => {
        const res = await request(server)
          .delete("/meals")
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        const meals = await Meal.find({});
        expect(meals).toEqual([]);
      });
      it("should send 200 to a normal user and delete all of their meals", async () => {
        const res = await request(server)
          .delete("/meals")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        const user = await User.findOne({email: user0.email});
        const userId = user._id;
        const meals = await Meal.find({userId: userId});
        expect(meals).toEqual([]);
        const adminUser = await User.findOne({email: user1.email});
        const adminUserId = adminUser._id;
        const adminMeals = await Meal.find({userId: adminUserId});
        expect(adminMeals).not.toEqual([]);
      });
    });
    describe("DELETE /:id", () => {
      let meal0Id, meal1Id, meal2Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/meals")
          .set("Authorization", "Bearer " + token0)
          .send({foods: foods.map((i) => i._id), mealType: "Snack"});
        meal0Id = res0.body._id;
        const res1 = await request(server)
          .post("/meals")
          .set("Authorization", "Bearer " + token0)
          .send({foods: [foods[1]].map((i) => i._id), mealType: "Snack"});
        meal1Id = res1.body._id;
        const res2 = await request(server)
        .post("/meals")
        .set("Authorization", "Bearer " + adminToken)
        .send({foods: [foods[1]].map((i) => i._id), mealType: "Snack"});
        meal2Id = res1.body._id;
      });
      it("should send 200 to user and delete meal0 for current user", async () => {
        const res = await request(server)
          .delete("/meals/" + meal0Id)
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        const meal = await Meal.findOne({mealId: meal0Id});
        expect(meal).toEqual(null);
      });
    });
  });
});