## Technical Overview (Quick)

- Stack: Next.js 15 (App Router), React 19, TailwindCSS, Vercel
- Auth: Firebase Auth (client) + Firebase Admin SDK (server token verification)
- Data: Firestore (`users/{uid}`, `rate_limits/{subject_YYYYMMDD}`, `feedback`, `users/{uid}/saved_recipes`)
- Server APIs (Node runtime):
  - `/api/recipes/search` — membership gating + rate limit + Spoonacular proxy
  - `/api/usage` — remaining daily searches, current plan
  - `/api/saved-recipes` — list/save/remove user’s saved recipes
- External APIs: Spoonacular (findByIngredients + informationBulk), Google Vision, Google Maps/Places
- Membership: Free users (and guests) = 2 searches/day; Members = unlimited
- Key features: My Page (gated), Saved recipes, Seasonal popup/banner, Meal Planner, Calorie Finder, Recipe Discovery
- Env strategy: `NEXT_PUBLIC_*` for client; server-only: `FIREBASE_*`, `SPOONACULAR_API_KEY`, `GOOGLE_MAPS_API_KEY`

### ON-GOING PERSONAL PROJECT ###


# 🥗 Nuti - AI-Powered Cultural Food Recognition

**Nuti** is a single-page web app (SPA) that helps multicultural Australians identify foods through AI image recognition and discover nearby restaurants or groceries that match their cultural preferences.

## Deployment
https://nuti-nu.vercel.app/

## 🚀 Features

- 📷 **Camera & Image Upload**: Take a live photo or upload an image of food for analysis.
- 🧠 **AI Recognition**: Uses Google Vision API to detect food labels.
- 🔍 **Nutritional Info**: Fetches calorie and vegetarian info from Spoonacular API.
- 🕌 **Cultural Relevance**: Flags Halal and Vegetarian suitability.
- 📍 **Smart Nearby Places**: Finds related restaurants or stores via Google Maps based on:
    - **User Geolocation:** Automatically detects user's current location.
    - **Custom Location Search:** Allows users to search for places in a specific area with autocomplete suggestions.
    - Results are sorted by distance and link directly to Google Maps.
- 🔄 **Recent Searches History**: Stores and allows re-visiting of past food analysis results, including the image.
- 🥗 **Meal Planner Tool**: Generate a daily meal plan based on cultural preference, with the ability to swap dishes, regenerate, and select your favorites. Each meal (breakfast, lunch, dinner, snack) is visually presented with dish images.
- 📉 **Calorie Finder Tool**: Quickly look up calorie and nutrition info for any food.
- 🍳 **Recipe Discovery Tool**: Find recipes based on ingredients you have at home. Filter by cuisine type, diet preferences, and cooking time to discover new dishes you can make with your available ingredients.
- 🖼️ **Download Meal Plan as Image**: Export your selected meal plan as a beautifully formatted, on-brand image (with dish photos) for easy sharing on any platform.
- 📤 **Share UI**: Prominent 'Download as Image' button and social media icons (WhatsApp, X, Facebook, Threads) for easy sharing. Note: Direct image sharing to social media is limited by browser/platform; users can always download and upload the image manually.

### App Screenshots


![Nuti Homepage Screenshot](public/images/Landpage_screenshot1.png)
![Nuti Homepage Screenshot](public/images/Landpage_screenshot2.png)
![Nuti Homepage Screenshot](public/images/Landpage_screenshot3.png)
![Nuti Homepage Screenshot](public/images/Landpage_screenshot4.png)

![Nuti Meal Planner Screenshot 1](public/images/MealPlanner_screenshot_1.png)
![Nuti Meal Planner Screenshot 2](public/images/MealPlanner_screenshot_2.png)
![Nuti Meal Planner Screenshot 3](public/images/MealPlanner_screenshot_3.png)
![Nuti Meal Planner Screenshot 4](public/images/MealPlanner_screenshot_4.png)

![Nuti Calorie Finder Screenshot 1](public/images/CalorieFinder_screenshot_1.png)
![Nuti Calorie Finder Screenshot 2](public/images/CalorieFinder_screenshot_2.png)
![Nuti Calorie Finder Screenshot 3](public/images/CalorieFinder_screenshot_3.png)

![Nuti Recipe Discovery Screenshot 1](public/images/RecipeDiscovery_Screenshot_1.png)
![Nuti Recipe Discovery Screenshot 2](public/images/RecipeDiscovery_Screenshot_2.png)
![Nuti Recipe Discovery Screenshot 3](public/images/RecipeDiscovery_Screenshot_3.png)
![Nuti Recipe Discovery Screenshot 4](public/images/RecipeDiscovery_Screenshot_4.png)
![Nuti Recipe Discovery Screenshot 5](public/images/RecipeDiscovery_Screenshot_5.png)
![Nuti Recipe Discovery Screenshot 6](public/images/RecipeDiscovery_Screenshot_6.png)

---

## 🛠️ Tech Stack

- **Frontend**: React + TailwindCSS (Next.js SPA)
- **Image Analysis**: Google Vision API
- **Nutrition Data**: Spoonacular API
- **Maps Integration**: Google Places API (Text Search, Nearby Search, Autocomplete, Details)
- **Firebase**: Firestore for storing cultural food data

---

## 📦 Installation & Setup

To get Nuti up and running on your local machine, follow these steps:

1.  **Clone the repository:**
```bash
git clone https://github.com/JihyeAnnaOh/nuti.git
cd nuti
    ```

2.  **Install dependencies:**
    ```bash
npm install
    ```

3.  **Set up Environment Variables:**
    Nuti requires several API keys to function. Create a file named `.env.local` in the root of the project and add the following:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
    NEXT_PUBLIC_SPOONACULAR_API_KEY=your_spoonacular_api_key
    NEXT_PUBLIC_GCP_VISION_API_KEY=your_gcp_vision_api_key
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
    ```
    *Make sure to replace `your_..._api_key` with your actual keys.*
    
    **Important:** For Google Maps, you need to enable the **Places API** and **Maps JavaScript API** in your Google Cloud Console to obtain `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

    #### Server-only environment variables (Membership & Rate Limiting)
    For secure, server-side enforcement of the free/member search limits and for protected proxying to Spoonacular, also add these:

    ```
    # Firebase Admin SDK (used in API routes for token verification + Firestore)
    FIREBASE_PROJECT_ID=your_project_id
    FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project.iam.gserviceaccount.com
    # Use escaped newlines (\\n). The code converts them to real newlines.
    FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_WITH_ESCAPED_NEWLINES\\n-----END PRIVATE KEY-----\\n

    # Spoonacular (server-only; used by /api/recipes/search)
    SPOONACULAR_API_KEY=your_server_spoonacular_key

    # Google Maps (server preferred; API routes fall back to NEXT_PUBLIC_ if absent)
    GOOGLE_MAPS_API_KEY=your_server_maps_key
    ```

    After updating `.env.local`, restart the dev server.

4.  **Run the development server:**
    ```bash
npm run dev
    ```

5.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000` (or the port indicated in your terminal).

---

## 🥗 Meal Planner & Sharing

- Access the **Meal Planner** from the sidebar.
- Select your cultural preference and choose dishes for each meal.
- Click **Download as Image** to export your meal plan as a shareable image (includes your selected dishes and their photos, styled to match the NUTI brand).
- Share the image on WhatsApp, Facebook, X, Threads, or any platform by uploading the downloaded image.
- Social share buttons provide quick access to share text, but for image sharing, use the download feature.

**Technical Highlights:**
- **Dynamic Meal Generation:** Uses user-selected cultural preferences to generate a daily meal plan, leveraging Firestore for dish data and custom logic for meal diversity.
- **Interactive UI:** Users can swap dishes, regenerate plans, and select favorites, with real-time UI updates using React state management.
- **Image Export:** Exports the meal plan as a styled image using the `html-to-image` library, enabling easy sharing on social platforms.
- **Social Integration:** Quick-share buttons for WhatsApp, Facebook, X, and Threads, with custom share text and downloadable images.
- **Tech Stack:** React, Next.js, TailwindCSS, Firebase Firestore, html-to-image, custom hooks.

---

## 📉 Calorie Finder

- Access the **Calorie Finder** from the sidebar or homepage.
- Ever wondered how many calories are in your meal? Instantly estimate calories and nutrition by uploading a photo of your meal.
- Upload a food photo and get instant calorie, vegetarian, and halal info.
- See your recent searches and quickly revisit past results.

**Technical Highlights:**
- **AI-Powered Food Recognition:** Integrates Google Vision API for image label detection, providing robust food identification from user-uploaded photos.
- **Nutrition Data Fetching:** Fetches calorie, vegetarian, and halal information from the Spoonacular API, with error handling and fallback logic.
- **Recent Search History:** Implements localStorage-based history for instant access to previous analyses, with UI for deletion and re-analysis.
- **Nearby Search:** Uses Google Maps API to find restaurants or stores related to the identified food, based on user geolocation or custom search.
- **Tech Stack:** Next.js, React, Google Vision API, Spoonacular API, Google Maps API, localStorage.

---

## 🍳 Recipe Discovery

- Access the **Recipe Discovery** tool from the sidebar.
- Staring at your fridge, unsure what to cook? Find recipes you can make with the ingredients you have at home.
- Enter your available ingredients and discover recipes you can make right now.
- Filter by cuisine, diet, and cooking time to find the perfect dish.
- Missing an ingredient? Find nearby stores to complete your recipe.

**Technical Highlights:**
- **Ingredient-Based Search:** Users input available ingredients, and the app fetches matching recipes from the Spoonacular API.
- **Advanced Filtering:** Supports filtering by cuisine, diet, and cooking time, with dynamic UI updates.
- **Missing Ingredient Detection:** Highlights missing ingredients and provides Google Maps links to find them nearby.
- **PDF Export:** Allows users to download recipe details as a formatted PDF using `jsPDF`.
- **Responsive UI:** Built with React and TailwindCSS for a seamless experience across devices.
- **Tech Stack:** React, Next.js, Spoonacular API, Google Maps API, jsPDF.
