# CS35L Final Report: UCLA Meal Plan Generator
**Name:** Niloy Meharchandani  
**Course:** CS35L - Software Construction  
**Project:** UCLA Meal Plan Generator  

## Project Overview and Purpose

The UCLA Meal Plan Generator is a comprehensive full-stack web application designed to solve a real problem faced by UCLA students: creating nutritionally balanced and personalized meal plans from dining hall options. The application addresses the challenge of navigating UCLA's diverse dining options while meeting specific dietary requirements, nutritional goals, and personal preferences.

The core purpose of our application is to generate intelligent, data-driven meal recommendations that help students make informed dining decisions. Rather than randomly selecting meals, our system uses a sophisticated algorithm to create meal plans that balance nutritional targets with user preferences, dietary restrictions, and food availability across different UCLA dining halls. This addresses a genuine need for students who want to maintain healthy eating habits while dealing with the complexity of campus dining options.

## Architecture and Technologies

Our application follows a modern three-tier architecture consisting of a React frontend, Node.js/Express backend, and MongoDB database, with an additional web scraping component for data collection.

**Frontend Technologies:**
- React.js with Vite for fast development and building
- Custom CSS for responsive design optimized for both desktop and mobile
- Recharts library for nutrition visualization and dashboard statistics
- Firebase Authentication for secure user management

**Backend Technologies:**
- Node.js v22.16.0 with Express.js framework
- MongoDB for persistent data storage
- Firebase Admin SDK for authentication verification
- RESTful API design for clean client-server communication

**Data Collection:**
- Selenium WebDriver for automated web scraping of UCLA dining menus
- Automated data processing and organization
- GitHub Actions for continuous data updates

**Deployment:**
- Frontend deployed on Vercel for global CDN distribution
- Backend deployed on Render for reliable server hosting
- MongoDB Atlas for cloud database management

The architecture emphasizes modularity and separation of concerns, with clear boundaries between the presentation layer (React), business logic (Express controllers), data access layer (MongoDB models), and external data collection (web scraper).

## Features and Functionality

Our application delivers several key features that work together to provide a comprehensive meal planning experience:

**Intelligent Meal Planning Algorithm:** The centerpiece of our application is a sophisticated greedy algorithm that generates optimal meal combinations. The algorithm considers user preferences, dietary restrictions, nutritional targets (protein, carbohydrates, fats, calories), and ingredient exclusions. It employs both hard constraints (dietary restrictions) and soft preferences (liked/disliked foods) to create balanced meal plans.

**User Preference Management:** Students can specify detailed preferences including vegetarian/vegan diets, allergen restrictions, macronutrient goals, disliked ingredients, and preferred dining locations. The system remembers these preferences for future meal plan generation.

**Live Menu Integration:** Our web scraper continuously updates the database with current UCLA dining hall menus, ensuring meal plans are generated from actually available food items. This includes nutritional information, categories, and dietary tags for each menu item.

**Interactive Dashboard:** Users can view comprehensive nutritional statistics for their meal plans, including visual charts showing how closely generated plans match their dietary goals. The dashboard provides insights into protein intake, calorie distribution, and macronutrient balance.

**Save and Edit Functionality:** Generated meal plans can be saved, viewed later, and edited through an intuitive drag-and-drop interface. Users can customize automatically generated plans to better suit their preferences while maintaining nutritional tracking.

**Weekly Planning:** The system supports generating meal plans not just for the current day but for future dates based on weekly menu cycles, enabling students to plan their dining in advance.

**Authentication and Persistence:** Secure user accounts through Firebase Authentication, including Google OAuth, ensure that meal plans and preferences are saved across sessions and devices.

## Individual Contributions

Based on the git commit history and project development, my contributions to the team centered around several critical areas of the application:

**Algorithm Development and Implementation:** I was primarily responsible for developing the core meal planning algorithm that forms the heart of our application. Starting with an initial basic greedy implementation, I iteratively improved the algorithm to incorporate soft preferences, category exclusions, nutritional scoring, and more sophisticated selection logic. The algorithm uses a two-phase approach: first selecting core nutritional items, then filling remaining requirements with complementary foods. This involved extensive testing with real menu data and fine-tuning scoring weights to optimize meal quality.

**Frontend-Backend Integration:** I spearheaded the integration between our React frontend and Express backend, implementing the API communication layer, authentication middleware, and data flow patterns. This included handling user authentication states, implementing protected routes, and ensuring consistent data structures between the client and server components.

**User Interface Development:** I contributed significantly to the frontend development, creating the Dashboard page, Edit Meal Plan interface, and Preferences page. I implemented responsive design principles and ensured the interface was intuitive and user-friendly. The drag-and-drop editing functionality and nutrition visualization components were particularly challenging implementations.

**Bug Fixes and System Optimization:** Throughout the development process, I identified and resolved numerous critical issues including duplicate meal plan generation bugs, nutritional calculation errors, algorithm regeneration problems, and display inconsistencies. I also handled Node.js version compatibility issues when upgrading to v22.16.0 LTS.

**Documentation and Project Setup:** I maintained comprehensive project documentation, including the detailed README with setup instructions, and contributed to establishing development environment standards for team consistency.

My commits demonstrate consistent engagement with both frontend user experience and backend algorithmic challenges, showing a full-stack contribution to the project's success.

## Challenges and Difficulties

Several significant challenges emerged during development that required creative problem-solving and team collaboration:

**Data Inconsistency and Structure Challenges:** One of the most persistent issues was handling inconsistent data structures between the scraped menu data and our application's meal plan format. UCLA's dining websites present nutritional information in varying formats, and our algorithm needed to handle missing data, different units of measurement, and inconsistent categorization. I addressed this by implementing robust data validation and normalization functions that could adapt to different input formats while maintaining data integrity.

**Algorithm Optimization Complexity:** Developing an algorithm that balances multiple competing objectives (nutritional goals, preferences, dietary restrictions) while maintaining reasonable performance proved extremely challenging. The initial greedy approach often produced suboptimal results, leading me to implement a more sophisticated scoring system with weighted preferences and multi-phase selection. Tuning these weights required extensive testing with real user scenarios and menu data.

**Node.js Version Compatibility:** A significant technical challenge arose when upgrading to Node.js v22.16.0 LTS for better performance and security. The new version introduced breaking changes in import assertion syntax, requiring updates across the entire codebase. I managed this migration by systematically updating package configurations, dependency versions, and establishing NVM-based version management for team consistency.

**Real-time Data Synchronization:** Ensuring that meal plans were generated from current, accurate menu data while maintaining application performance required careful consideration of data freshness versus computational efficiency. We solved this by implementing a scheduled scraping system and caching strategies that balance data currency with response times.

**User Experience Complexity:** Creating an interface that could handle the complexity of meal planning preferences while remaining intuitive for users required multiple design iterations. The challenge was presenting sophisticated algorithmic options in a simple, understandable format that didn't overwhelm users with choices.

## Future Improvements and Enhancements

Given additional development time, several enhancements would significantly improve the application's functionality and user experience:

**Machine Learning Integration:** Implementing a recommendation system that learns from user behavior and meal plan feedback would create increasingly personalized suggestions. This could include analyzing which generated meal plans users actually follow, which items they frequently modify, and seasonal preference patterns.

**Social Features and Community Integration:** Adding social elements such as meal plan sharing, group meal planning for friends, and community ratings for dining hall items would enhance user engagement and provide valuable feedback data for improving recommendations.

**Advanced Nutritional Analysis:** Expanding beyond basic macronutrients to include micronutrient tracking, meal timing optimization based on class schedules, and integration with fitness tracking apps would provide more comprehensive health management.

**Mobile Application Development:** While our web application is responsive, a dedicated mobile app with offline functionality, push notifications for meal reminders, and GPS-based dining hall suggestions would improve accessibility and user convenience.

**Predictive Analytics and Planning:** Implementing features that could predict dining hall crowding, suggest optimal meal times, and recommend meal plans based on upcoming schedule demands (exam periods, workout days) would add significant practical value.

**Enhanced Allergen and Dietary Management:** More sophisticated handling of dietary restrictions, including cross-contamination warnings, detailed ingredient sourcing information, and integration with medical dietary requirements would make the application more inclusive and safe for users with complex dietary needs.

**Architecture Improvements:** If rebuilding the project, I would implement a microservices architecture to better separate concerns, use GraphQL for more efficient data fetching, implement comprehensive testing coverage from the beginning, and establish CI/CD pipelines for automated deployment and testing.

**Real-time Features:** Adding real-time updates for menu changes, live dining hall capacity information, and collaborative meal planning features would enhance the application's immediate utility for daily use.

The UCLA Meal Plan Generator successfully demonstrates the application of software construction principles to solve a real-world problem, combining algorithmic thinking, full-stack development skills, and user-centered design to create a meaningful tool for the UCLA community. 