# Social Media ToDo API


## Project Overview

A simple CRUD API for managing to-do list posts on social media. The API allows you to create, read, update, and delete tasks related to social media posts, including fields like Post Title, Brand, Platform, Due Date, Payment, and Status.

## Prerequisites

- Node.js
- npm or yarn
- Firebase project with Firestore and Authentication enabled

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/taufanAli65/social-media-todo-api.git
    cd social-media-todo-api
    ```

2. Install dependencies:
    ```sh
    npm install
    # or
    yarn install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:
    ```env
    FIREBASE_API_KEY=your_firebase_api_key
    ADMIN_EMAIL=your_admin_email
    ADMIN_PASSWORD=your_admin_password
    APP_PORT=your_app_port
    ```

4. Generate a `firebase-config.json` from firebase console and move file in the root directory

## Running the Project

To start the server, run:
```sh
npm start
# or
yarn start
```

The API will be running at `http://localhost:your_app_port`.

## API Endpoints

### Authentication

- `POST /auth/register`: Register a new user
- `POST /auth/login`: Login an admin user
- `DELETE /auth/delete/:userID`: Delete a user (admin only)

### Content

- `GET /content`: Get all contents (admin only)
- `POST /content`: Add new content (admin only)
- `POST /assign/:contentID/:userID`: Assign user to manage content (admin only)

## Running Tests

To run the tests, use:
```sh
npm test
# or
yarn test
```

## License

This project is licensed under the MIT License.
