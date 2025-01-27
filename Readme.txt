Countries Explorer

Countries Explorer is a web application that allows users to explore detailed information about countries worldwide. Users can search, filter by region or language, view detailed country profiles, and save up to 5 favorite countries for quick access.



Features

1. Search and Filter:

   - Search for countries by name using a responsive search bar.
   - Filter results by region and language.

2. Pagination:

   - Display countries in a paginated grid view for better navigation.
   - Load more results with the "Show More" button.

3. Favorites Management:

   - Mark up to 5 countries as favorites for quick access.
   - Favorite countries are saved in local storage for persistence.

4. Country Details:

   - View comprehensive information about a country, including:
     - Top-level domain (TLD)
     - Capital
     - Region
     - Population
     - Area
     - Languages
   - See the country’s flag in a large display.

5. Responsive Design:

   - Fully responsive and compatible with major browsers (Chrome, Firefox, Safari, Edge).


 Setup Instructions
1. Choosing a Programming Language:

    - This project primarily uses HTML, CSS, and JavaScript for its functionality and design.
 
2. Installing an IDE (Integrated Development Environment):

    - Download and set up a code editor like Visual Studio Code or Sublime Text, which provides features like syntax highlighting and debugging tools.


 Design Decisions and Animations

1. Local Storage for Favorites:
   - Favorites are stored in localStorage to ensure data persists across sessions without requiring a backend.

2. Debounced Search:
   - Implemented debounce functionality to optimize search performance and reduce unnecessary API calls.

3. API Integration:
   - Used [REST Countries API](https://restcountries.com/) to fetch country data.

4. Accessibility:
   - All interactive elements (buttons, links) are accessible via keyboard navigation.

5. Responsive Layouts:
   - Designed with CSS Grid and Flexbox to adapt seamlessly across devices, from mobile to desktop screens.

6. Animations for User Engagement:
   - Smooth transitions for hover effects on buttons, links, and cards, providing a polished and interactive feel.
   - Implemented keyframe animations, such as:
     - **Gradient Background Animation: Background gradients on the search bar and buttons dynamically shift colors for a modern, lively appearance.
     - **Fade-In Effects: Elements like the country grid and details fade in smoothly to enhance the user experience.
     - **Pulse Animation: The "Show More" button uses a subtle pulsing effect to guide user attention.
   - Hover animations on country cards and buttons add depth and interactivity by scaling or shadowing elements slightly.


 Project Structure

project-directory/
index.html              # Home page with country search and grid view
details.html            # Details page for individual country information
styles.css              # Global CSS for index.html
details.css             # CSS for details.html
script.js               # JavaScript for index.html functionality
details.js              # JavaScript for details.html functionality




Testing and Running the App

Manual Testing:

 - Verify the app functionality by interacting with the search, filter, favorites, and pagination features.

 - Navigate to the country details page and validate the displayed information.

Browser Compatibility:

Tested on:

 - Chrome

 - Firefox

 - Safari

 - Edge

Responsiveness:

 - Verified across various screen sizes, including desktops, tablets, and mobile devices.

 Quality and Testing Expectations

1. Unit Testing:
   - Write unit tests to validate key functionalities of the application, focusing on critical components such as:
     - Search bar behavior.
     - API interactions (e.g., successful and failed requests).
     - Dynamic updates to the country grid and details view.

2. Testing Framework:
   - Use a reliable testing framework such as **Mocha**, **Jasmine**, or **Jest** to implement and run tests.

3. Test Coverage:
   - Ensure your tests cover the following scenarios:
     - Successful API responses with valid data.
     - Handling failed API responses, such as 404 or 500 errors.
     - Empty or invalid search queries.
     - Filtering by unsupported or non-existent regions/languages.
     - Adding and removing countries from favorites, including edge cases like exceeding the limit of 5 favorites.

4. Edge Cases:
   - Test for unusual scenarios, including:
     - Countries with incomplete data (e.g., missing capital, languages, or population).
     - Network latency causing delayed API responses.
     - Clearing local storage and reloading the application.

5. Running Tests:
 

6. Continuous Improvement:
   - Regularly update tests as new features are added or existing features are modified.


Known Issues

1. API Rate Limits:

   - The REST Countries API may impose rate limits. In case of issues, wait and retry.

2. Edge Cases:

   - Some countries may have incomplete data (e.g., missing capital or languages).



Future Improvements

1. Add backend support for user accounts and server-side storage of favorites.
2. Improve error handling with user-friendly messages.
3. Implement additional filters (e.g., by currency or subregion).
4. Enhance the UI with more animations and transitions, such as:
   - Interactive feedback for user actions, such as saving favorites or applying filters.



