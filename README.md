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
    ASSIGNED_USERID=assigned_userID_for_content
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

## API Documentation

Interactive API documentation is available at `http://localhost:your_app_port/api-docs`.

## API Endpoints

### Authentication

- `POST /auth/register`: Register a new user
- `POST /auth/login`: Login an admin/user
- `DELETE /auth/delete/:userID`: Delete a user (admin only)

### Content

- `GET /content`: Get all contents (admin only) and get all contents managed or assigned to the user (for user)
- `GET /content/user/:userID`: Get all contents managed or assigned to the user
- `GET /content/all/:status`: Get all contents, sort by status (done, on-progress, assigned, unassigned) (admin only)
- `POST /content`: Add new content (admin only)
- `POST /content/assign`: Assign user to manage content (admin only)
- `PUT /content/reassign`: Re-assign user to manage content (admin only)
- `PUT /content/`: Update content status (asigned user only)
- `DELETE /content/:contentID`: Delete content (admin only)
- `GET /content/:contentID`: Get spesific content

### On Development

#### Content

- `GET /content/:userID/:status`: Get all contents managed or assigned to the user, sort by status (done, on-progress, assigned)
- `GET /content/due`: Get all contents that already due

## Running Tests

Before running the test ensure to follow this step first :
1. Register your email into firebase authentication and save the id into firestore collection(users) > docID(your_account_id) with field (roles: `admin`)
2. Register other email manually at `POST /auth/register`
3. Add content manually at `POST /content`
4. Assign content to other account manually at `POST /content/assign`

To run the tests, use:
```sh
npm test
# or
yarn test
```

## License

This project is licensed under the MIT License.
