# Ad Variant Generator

## Overview
The Ad Variant Generator is a web application that generates multiple advertisement variants based on user-defined parameters such as product, target audience, platform, and vibe. Utilizing the ChatGPT API, this application aims to assist marketers and businesses in creating compelling ad content efficiently.

## Features
- Generate 3-6 advertisement variants based on user input.
- User-friendly interface for inputting product details and preferences.
- Display generated ad variants with options for interaction.
- Responsive design for optimal viewing on various devices.

## Project Structure
```
ad-variant-generator
├── src
│   ├── main.tsx          # Entry point of the application
│   ├── App.tsx           # Main application component managing routing
│   ├── pages
│   │   ├── Home.tsx      # Home page for ad generation form
│   │   └── Results.tsx   # Page displaying generated ad variants
│   ├── components
│   │   ├── AdForm.tsx    # Component for ad generation form
│   │   └── AdCard.tsx    # Component for displaying ad variants
│   ├── services
│   │   └── chatgpt.ts    # Functions to interact with ChatGPT API
│   ├── hooks
│   │   └── useGenerateAds.ts # Custom hook for ad generation logic
│   ├── types
│   │   └── index.ts      # TypeScript types and interfaces
│   ├── utils
│   │   └── promptBuilders.ts # Utility functions for prompt building
│   └── styles
│       └── globals.css    # Global CSS styles
├── public
│   └── index.html         # Main HTML file for the application
├── package.json            # npm configuration file
├── tsconfig.json          # TypeScript configuration file
├── vite.config.ts         # Vite configuration file
├── .env.example           # Example environment variables
└── README.md              # Project documentation
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd ad-variant-generator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and add your ChatGPT API key.

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage
- Navigate to the Home page to fill out the ad generation form.
- Input the required details about the product, target audience, platform, and vibe.
- Submit the form to generate advertisement variants.
- View and interact with the generated ads on the Results page.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.