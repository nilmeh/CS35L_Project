# CS35L Project - UCLA Meal Plan Generator

A full-stack web application built for UCLA students to generate personalized, nutritionally balanced dining hall meal plans based on user preferences, dietary goals, and dining locations across campus.

This project was developed as part of the CS35L Software Construction course at UCLA.

## Team Members
- Niloy Meharchandani
- Kartik Bhatia
- Robert Spataru
- Alex Brown


## Key Features of the Project

- **User Preference Form**: Students can specify their dietary restrictions (e.g., vegetarian, lactose intolerant), macronutrient goals, disliked ingredients, and dining location.

- **Smart Meal Planning Algorithm**: A greedy algorithm selects optimal combinations of dining hall menu items to match user preferences and nutritional targets. It includes soft preferences and category exclusions.

- **Weekly Scheduling**: Allows users to generate meal plans not just for the current day but also for future days based on the weekly menu data.

- **Live Menu Integration**: Scrapes UCLA dining menus weekly and stores them in a backend database, enabling the app to stay up-to-date with current food offerings.

- **Save & Edit Meal Plans**: Users can save, view, and edit their meal plans, including drag-and-drop editing for smooth customization.

- **Dashboard with Nutritional Statistics**: Each plan is visualized with various statistics showing how closely it matches dietary goals (protein, fat, sugar, carbs, and calories).

- **Authentication**: Users can log in and store their plans securely, including using Google OAuth (Firebase Auth integration).

- **Responsive Frontend**: Built using React, optimized for both desktop and mobile viewing.

## Technologies Used

- **Frontend**: React.js, Custom CSS, Recharts, Vite
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: Firebase Authentication
- **Web Scraping**: Selenium WebDriver
- **Deployment**: Vercel (Frontend), Render (Backend)

## Local Deployment Instructions

Follow these steps to run the project locally on your machine:

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **MongoDB** (local or Atlas cluster)
- **Python 3** (for the scraper)
- **Chrome browser** (for Selenium web scraping)
- **ChromeDriver** (matching your Chrome version, and in your PATH)

### 2. Clone the Repository
```
git clone <your-repo-url>
cd CS35L_Project
```

### 3. Install Dependencies
#### Backend
```
cd server
npm install
```
#### Frontend
```
cd ../client
npm install
```
#### Scraper
```
cd ../scraper
npm install
```

### 4. Set Up Environment Variables
- For the backend, create a `.env` file in the root directory with the following (edit as needed):
```
MONGODB_URI=<your-mongodb-uri>
```
- For the frontend, you may need to set up Firebase config in `client/src/services/firebase.js`. This can be done with an env or directly, although our project uses an env in client with the following:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_id
```
This information can be found through the Firebase console.

### 5. Run the Scraper (Optional, to update menu data, takes a while)
```
cd scraper
node uclaScraper.js
```
This will generate or update `organized_results.json`.

### 6. Start the Backend Server
```
cd server
npm start
```

### 7. Start the Frontend
```
cd client
npm run dev
```

---

**Note:**
- Make sure MongoDB is running locally or your Atlas URI is correct.
- For Google OAuth, set up Firebase credentials as described in the codebase.
- If you want to automate menu scraping, set up a cron job to run the scraper script regularly (this can be done with with GitHub actions using our YAML workflow).