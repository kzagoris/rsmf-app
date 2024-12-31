## Remote Student Monitor Framework for Securing Exams

This is the public repository for the application in the [rsmf project](https://www.rsmf-project.eu/).

The idea of the project is to find ways and methods to ensure high
quality in the organization of remote exams in higher education. One of
the fundamental aim is to develop a complete and concrete evaluation
system for remote exams at the Universities, following the instructions
and regulations for quality assurance agencies in Europe.

This application platform aims to provide a path for students to take exams remotely by applying modern technologies to resolve the challenges of observing students.

### Highlights

- It implements a peer-to-peer video conferencing application using React and MUI alongside the WebRTC protocol with the PeerJS library.
- Realtime Face detection using the exam video conference
  Implement custom emails using an email SMTP server in the Functions of Firebase.

### Demo Video

Watch the demo video of the project:

[![Watch the video](https://img.youtube.com/vi/3AfzDNmYFv4/hqdefault.jpg)](https://youtu.be/3AfzDNmYFv4)

For additional documentation, please refer to the official guidebook available at [this link](https://www.rsmf-project.eu/results/)

It uses the following technologies:

- React as front-end
- MUI as UI library
- i18next as internationalization library (check the `i18n.ts` file)
- Supports 4 languages: English, Greek, Italian and Polish
- Firebase as backend (check the `firebase.ts` file)
- It uses the Auth, Storage, Firestore, and Functions services of Firebase
- Custom emails in Firebase functions
- For face detection, it uses the [face-api.js](https://justadudewhohacks.github.io/face-api.js/docs/index.html) library

### Running the Application

To run the application, follow these steps:

1. **Install Dependencies**:

    ```bash
    npm install
    cd function
    npm install
    ```

2. **Set Environment Variables**:

    Create a `.env` file in the root directory of your project and add the following variables:

    ```env
    VITE_SERVICE_NAME=rsmf
    VITE_FIREBASE_EMULATOR_HOST=localhost
    VITE_BASE_URL=http://localhost:5173

    VITE_APP_FIREBASE_API_KEY=your_firebase_api_key
    VITE_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    VITE_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
    VITE_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    VITE_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    VITE_APP_FIREBASE_APP_ID=your_firebase_app_id
    VITE_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
    VITE_APP_USE_FIREBASE_EMULATOR=false
    ```

    An `.env.example` is available.

    Create a `.env` file in the `functions` directory and add the following variables:

    ```env
    SMTP_USER = <your-smtp-user>
    SMTP_PASSWORD = <your-smtp-password>
    SMTP_SERVER = <smtp.your-server.com>
    SMTP_PORT = 587
    APP_DOMAIN = "debug.localhost"
    APP_NAME = "Debug"
    ```

    An `.env.example` is available.

3. **Run the Development Server**:
   Initially, it needs to run the function build before running the serve command.

    ```bash
    cd functions
    npm run build:watch
    ```

    Then, start the Firebase emulator

    ```bash
    npm run emulators:start
    ```

    And then run the serve command.

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173`.

## Copyright Notice

© Zagor Solutions Ltd 2025. All rights reserved.

This code is not licensed for use, modification, or distribution without explicit permission from the copyright holder.
