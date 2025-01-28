Countries Explorer - https://prem5599.github.io/REST-Countries/

Countries Explorer is a web application that allows users to explore detailed information about countries worldwide. Users can search, filter by region or language, view detailed country profiles, and save up to 5 favorite countries for quick access.

Setup Instructions
Clone the repository:

Visual studio code  

1. Open a new terminal by navigating to Terminal > New Terminal. 
 
2. In the terminal, run the following command to clone the repository:  
    
   git clone https://github.com/prem5599/REST-Countries.git 
 
3. Navigate to the project directory by running:  
     
   cd countries-explorer  
   
4. Finally, open the project in a new VS Code window by running:  

   code .  

Open the index.html file in your browser.


Design Decisions

Interactive Elements:
 -Gradient animations on buttons and backgrounds provide visual feedback. Smooth transitions (0.3s ease) for hover states and transforms avoid jarring changes.

Responsive Layout:
 -Cards use auto-fill minmax(280px, 1fr) for fluid grid that adapts to any screen. Mobile view triggers at 768px with optimized spacing and stacked elements.

Search Experience:
 -Debounced input with suggestions dropdown. Results fade in as user types. Filters for region/language update grid instantly.

Modern Styling:
 -Dark theme with gradients and shadows creates depth. Text uses background-clip for gradient effects. Backdrop filters add glass morphism without impacting performance.

Automated Testing:

Use a testing framework like Jest or Mocha to validate:
Search functionality.
API responses (e.g., successful fetch, error handling).
Favorites management, including edge cases like exceeding the 5-country limit.

Responsiveness Testing:

Check the application on various devices (mobile, tablet, desktop) and screen resolutions.
Cross-Browser Testing:

Verify compatibility with Chrome, Firefox, Safari, and Edge.
Known Issues
API Rate Limits:

The REST Countries API may occasionally enforce rate limits. If an issue arises, retry after a short wait.
Incomplete Data:

Some countries may have missing details, such as capital, languages, or population.
Ensuring Compatibility


The app has been tested on:

Browsers: Chrome, Firefox, Safari, and Edge.
Devices: Mobile phones, tablets, and desktops.
