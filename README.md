Proof of Concept Update:
Date: 05-26-2024

1.  Completed Project Tasks:

    Models:

        - Completed user model
        - Completed food model
        - Completed meal model

    DAO Functions:

        - Completed user DAO functions
        - Completed food DAO functions
        - Completed meal DAO functions

    Router Functions:

        - Completed auth router functions
        - Completed food router functions
        - Completed meal router functions
        - Complete authentication and authorization middleware functions

    Unit tests:

        - Complete auth unit tests, all tests passing
        - Complete food unit tests, all tests passing
        - Complete meal unit tests, all tests passing

2.  Remaining Tasks:

    - Implement Postman route tests for demonstration
    - Github CI/CD, actions
    - Setup railway hosting
    - Setup Atlas hosting
    - Presentation slide show and demo presentation preparation

- Title: Nutrify: Revolutionizing Meal Tracking and Planning with Express API

- Scenario:
  Nutrify app operates in a modern world where individuals lead busy lives and struggle to prioritize their health and nutrition amidst the hustle and bustle of daily activities. In this fast-paced environment, people often find it challenging to maintain a healthy lifestyle, leading to a growing need for convenient and efficient solutions. Nutrify steps in to address this challenge by offering a comprehensive meal tracking and planning experience through its Express API. The app recognizes that in today's digital age, people seek convenience and simplicity in managing their nutrition, without sacrificing accuracy or effectiveness. At its core, Nutrify leverages a MongoDB database to ensure robust and scalable storage for user data, emphasizing reliability and scalability. By tracking various nutritional metrics such as calories, macronutrients, and micronutrients, the app enables users to make informed decisions about their dietary choices and health goals. One of Nutrify's key strengths lies in its database of food items, including branded products and restaurant meals, which simplifies the process of meal planning and tracking. Whether users are at home, on the go, or dining out, Nutrify empowers them to access accurate nutritional information and make healthier choices effortlessly.
  The app's Express API is designed for seamless integration across multiple platforms, including web, mobile, and smart home devices, catering to users' diverse preferences and lifestyles. This flexibility ensures that users can access Nutrify anytime, anywhere, making it a versatile tool for maintaining optimal health and wellness. In a world where health and well-being are increasingly valued, Nutrify emerges as a trusted ally for individuals seeking to take control of their nutrition and lead healthier, happier lives. Whether users are fitness enthusiasts, busy professionals, or simply individuals striving for a better lifestyle, Nutrify offers the support and resources needed to achieve their wellness goals effectively.

- Aim of Nutrify:
  The Nutrify project seeks to address the challenge of maintaining a healthy lifestyle in today's fast-paced world. Despite growing awareness of the importance of nutrition, many individuals struggle to prioritize their health amidst the demands of work, family, and other responsibilities. As a result, they may find it difficult to make informed dietary choices, track their nutritional intake accurately, and stay on course with their health goals.
  Nutrify aims to solve this problem by providing a seamless and efficient solution for meal tracking and planning. By leveraging its Express API and robust MongoDB database, the app streamlines the process of accessing nutritional information, planning meals, and tracking dietary intake. This not only simplifies the user experience but also empowers individuals to make healthier choices and take control of their nutrition with ease.
  Additionally, Nutrify prioritizes user privacy and security, ensuring that personal health data remains confidential and always protected. By implementing the highest standards of encryption and data protection, the app fosters trust and confidence among its user base, encouraging ongoing engagement and usage.
  Overall, Nutrify seeks to simplify the way individuals approach nutrition and wellness by offering a comprehensive solution that is convenient, reliable, and user-friendly. Whether users are fitness enthusiasts, busy professionals, or anyone striving for a healthier lifestyle, Nutrify serves as a trusted partner in their journey towards optimal health and well-being.

Technical Description:
The following technical description give the definition of the API routes and data models that will be implemented in the project.

API Routes:

1. Login

- Signup POST /auth/signup
- Login POST /auth/login
- Change Password Put /auth/password

2. Foods

- Create: POST /foods – Create a new food item.
- Update a food item PUT /foods/id – Update a food item, open to all
- Get all items: GET /foods
- Get a specific food item: GET/:id – open to all users

3. Meals

- Create: POST /meals – Create a new meal item.
- Update a meal item PUT /meals/:id – User can update a meal for their account. Admin can update any meal for any user
- Get all meals: GET /meals – User roll gets meals for their specific account. Admin can get all meals for all users.
- Get a meal: GET/:id – User roll can get a meal by id for their account. Admin can get a meal by its id for any user account.

Data Models:
• Auth model: { Name, Email, Token, Roles }
• Food model: { Name, Description, Calories, Serving Size, Number of servings, Grams of carbohydrates per serving, Grams of sodium per serving, Grams of Fat per serving}
• Meal Model: {Meal Type (Breakfast, Lunch Dinner, Dessert, Snack), Foods array, Total calories, Total grams carbohydrate, Total grams of sodium,Total grams of Fat}

Requirements:

1. Authentication and Authorization: This will be implemented by middleware function, and the auth routes and DAO functions that shall handle Admin and Normal user creation, login, logout.
2. 2 sets of CRUD Routes: This project shall implement 3 sets of CRUD routes for auth, foods and meals.
3. Indexes for performance and uniqueness: Foods will be uniquely stored and index for fast accessibility.
4. Units tests shall be implemented with 80% coverage
5. Demonstration shall be done via save Postman requests

Dependencies:

1. Express
2. MongoDB
3. Mongoose
4. Atlas – MongoDB hosting
5. Railway – API hosting

Tasks Breakdown:

Week 8:

1. Define data models: Auth, Foods, Meals
2. Middleware function for authentication and authorization
3. Define routes (Auth, Foods, Meals)
4. DAO functions (Auth, Foods, Meals)
5. Prototype/proof of concept

Week 9:

1. DAO functions (Auth, Foods, Meals)
2. Implement Unit tests (Auth routes, Foods routes, Meals routes)

Week 10:

1. Github CI/CD, actions
2. Setup railway hosting
3. Setup Atlas hosting
4. Implement Postman route tests for demonstration
5. Presentation slide show and demo presentation preparation
