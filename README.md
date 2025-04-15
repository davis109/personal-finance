# Personal Finance Tracker

A modern web application for tracking personal finances with visualizations and budgeting features.

## Features

### Basic Transaction Tracking
- Add, edit, and delete transactions
- Filter transactions by category, type, and date
- Responsive transaction list with pagination

### Categories
- Predefined expense and income categories
- Category-wise pie chart visualization
- Customizable category system

### Budgeting
- Set monthly category budgets
- Budget vs actual spending comparison
- Spending insights with visualizations

### Visualizations
- Monthly expenses bar chart
- Income vs expenses trend line
- Category breakdown with pie charts
- Budget comparison charts

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **UI Components**: Custom components with TailwindCSS
- **Data Visualization**: Recharts
- **Animations**: GSAP, Three.js
- **Database**: MongoDB with Mongoose
- **API**: Next.js API routes

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/finance-tracker
# Or use your MongoDB Atlas connection string
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to use the application

### Database Initialization

The application will automatically create and populate predefined categories when you first run it.

## Project Structure

```
finance-tracker/
├── public/               # Static files
├── src/                  # Source code
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── transactions/ # Transactions page
│   │   ├── categories/   # Categories page
│   │   ├── budgets/      # Budget management page
│   │   ├── layout.js     # Root layout
│   │   └── page.js       # Landing page
│   ├── components/       # React components
│   └── lib/              # Utilities and models
│       ├── models/       # Mongoose models
│       └── mongodb.js    # MongoDB connection
├── .env.local            # Environment variables (create this file)
├── next.config.js        # Next.js configuration
└── package.json          # Project dependencies
```

## Deployment

This application can be deployed on Vercel, Netlify, or any other platform that supports Next.js.

### Deploy on Vercel

1. Push your code to a GitHub repository.
2. Import the project on Vercel.
3. Add the environment variable `MONGODB_URI` to your Vercel project settings.
4. Deploy the application.

## License

[MIT](LICENSE) 