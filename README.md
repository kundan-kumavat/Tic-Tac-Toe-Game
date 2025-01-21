# Tic-Tac-Toe Backend Application

### **Overview **
This project implements a backend for a Tic-Tac-Toe game, providing features such as user authentication, gameplay management, and game history tracking.

### **Features **
- User registration and login with secure authentication.
- Real-time turn-based gameplay.
- Game history with detailed timelines of each move.
- Flexible database schema for scalability.

### **Design Approach **
1. **Authentication**: Secured with JWT to ensure safe user authentication.
2. **Game Logic**: Rules enforced on the server to maintain integrity and fairness.
3. **Database Design**:
- Users: Stores player data.
- Games: Tracks active and completed games, including moves timeline.

### **Assumptions **
1. Each game involves exactly two players.
2. The starting player automatically get their symbol as 'X'.
3. Games detect a winner or a draw based on moves.
4. The starting player will play first.

### **Tech Stack **
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT
- Techologies/Libraries: bcrypt, mongoose, dotenv, multer, cloudinary

### **Steps to run locally **
Refer to SETUP.md file for detailed instructions on installation and setup.


### BASE URL : http://localhost:3000/api/v1/

## **Sample Header Section**
- Passes the access token in the header section whenever required to authenticate user before accessing any features.

| key | value | description |
| --- | ----- | ----------- |
| Authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzdiNWY4_mQh5N3VE_Ctih2JOT6dQunhc | accessToken |

## **API Documentation**

## **User Management**
### **1. User Registration**
- **Endpoint**: `POST users/register`
- **Description**: Registers a new user into the system.
- **Required Fields**:
  - `email` (string): User's email address.
  - `password` (string): Secure password(It should be more than 6 characters).
- **Sample Request body**:
```json
{
    "username": "john04",
    "password": "john123"
}
```

### **2. User Login**
- **Endpoint**: `POST users/login`
- **Description**: Authenticates users with their credentials.
- **Required Fields**:
  - `username` (string): Registered email.
  - `password` (string): Password.
- **Sample Request body**:
```json
{
    "username": "john04",
    "password": "john123"
}
```
- **Response**: JWT Token(access token).

---

## **User Profile Management**
### **1. Add User Details**
- **Endpoint**: `POST users/profile`
- **Description**: Adds user personal or profile details in the system.
- **Fields**:
  - `fullName` (string): Full Name of the user.
  - `gender` (string): Gender of the user
  - `age` (number): Age of the user.
  - `country` (string): Country of the user.
  - `avatar` (File): user profile photo or avatar.
- **Header section**: Header section is requried.


### **2. Get User Profile**
- **Endpoint**: `GET users/profile` 
- **Description**: Get the user details stored on db.
- **Header section**: Header section is requried.

### **3. Update User Details**
- **Endpoint**: `PUT users/profile`
- **Description**: Updates doctor details to the system.
- **Fields to update**:
  - `fullName` (string): Full Name of the user.
  - `gender` (string): Gender of the user
  - `age` (number): Age of the user.
  - `country` (string): Country of the user.
- **Header section**: Header section is requried.

### **4. Update User Avatar image**
- **Endpoint**: `PATCH users/update-avatar`
- **Description**: Updates the avatar image of the user.
- **Field required**:
  - `avatar` (File): New avatar of the user.
- **Header section**: Header section is requried.

### **5. Delete User Details**
- **Endpoint**: `DELETE users/profile`
- **Description**: Delete user details from the system.
- **Header section**: Header section is requried.


## **Game Management**
### **1. Start an match**
- **Endpoint**: `POST game/start`
- **Description**: Starts an new game with the user.
- **Required Fields**:
  - `opponentId` (string): Id of the opponent player.
- **Sample Body Request Data**:
```json
{
    "opponentId": "678f4sgsdgf980464208e226"
}
```
- **Header section**: Header section is requried.

### **2. Plays a move**
- **Endpoint**: `POST game/:id/move`
- **Description**: Player moves data.
- **Query Parameter**: Game Id.
- **Sample Body Request**:
```json
{
    "row": 0,
    "col": 1
}
```
- **Response**: Get response of the moves and also who wins the game.
- **Header section**: Header section is requried.

### **3. Game History**
- **Endpoint**: `GET game/history`
- **Description**: Get all games played by user.
- **Response data**:
  - `opponentUsername` (string): username of the opponent player.
  - `status` (string): Status of the game(ongoing or completed).
  - `result` (string): Result of the game(Win or Loss or Draw).
  - `movesTimeline` (string): Timeline of the moves played by players during the game.
- **Header section**: Header section is requried.

### **4. Update the status of game**
- **Endpoint**: `POST game/:id/status`
- **Description**: Update status of the game only when game is ongoing.
- **Header section**: Header section is requried.
- **Sample Body request**:
  ```json
  {
    "status": "completed"
  }
  ```

---

## **Error Handling**
The API provides descriptive error messages for invalid requests. For example:
- **Sample Error Response** (Invalid data):
  ```json
  {
    "message": "Required fields are missing"
  }
  ```