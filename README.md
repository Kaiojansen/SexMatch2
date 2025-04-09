# Couples Game

A fun and interactive game for couples to discover new experiences together. Built with React, TypeScript, and Firebase.

## Features

- Google Authentication
- Partner matching system
- Interactive card swiping interface
- Real-time updates
- Modern and responsive UI

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd couples-game
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Firebase configuration:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`

## Firebase Setup

1. Create a new Firebase project
2. Enable Google Authentication
3. Set up Firestore Database
4. Set up Storage for images
5. Update the Firebase configuration in `src/firebase.ts`

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── contexts/       # React contexts
  ├── pages/          # Page components
  ├── firebase.ts     # Firebase configuration
  ├── App.tsx         # Main application component
  └── index.tsx       # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 