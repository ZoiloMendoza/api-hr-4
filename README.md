# express_mysql

## Description

This project is a Node.js backend application built with the Express framework. It utilizes MySQL as its database via the Sequelize ORM and includes features for user authentication, real-time communication, and a modular structure.

## Installation

1.  **Clone the repository:**
    
```bash
    git clone <your-repository-url>
    cd express_mysql
    ```


2.  **Install dependencies:**
    
```bash
    npm install
    ```


3.  **Set up environment variables:**
    *   Create a `.env` file in the root directory.
    *   Copy the contents of `env_example` into your new `.env` file.
    *   Update the variables in `.env` with your specific configuration (Database credentials, JWT secret, Port, etc.).

    *Example `.env` structure (based on `env_example`):*
    
```env
    DB_DIALECT=mysql
    DB_HOST=localhost
    DB_NAME=mydb
    DB_USER=root
    DB_PASSWORD=mypassword
    DB_PORT=3306
    DB_SSL=true
    LOG_LEVEL=info
    PORT=3000
    JWT_SEED="supersecret_seed"
    JWT_LIFESPAN=1d
    # Add other variables as needed (e.g., AWS S3, nodemailer if configured)
    ```


4.  **Database Setup:**
    *   Ensure your MySQL server is running and accessible with the credentials provided in `.env`.
    *   Create the database specified in `DB_NAME`.
    *   Run database migrations (if applicable). Based on the presence of `sequelize-cli` and `server/migrations/`, the command is likely:
        
```bash
        npx sequelize-cli db:migrate
        ```

        *(Note: Adjust the command if your project uses a different migration setup)*

## Usage

To start the server, run the following command:


```bash
npm start
```


The application will start, typically listening on the port defined in your `.env` file (default is 3000). The main server entry point is `server/server.js`.

## Key Features

*   **Framework:** Express.js for routing and middleware.
*   **Database:** MySQL with Sequelize ORM for data modeling and interaction.
*   **Authentication:** JWT (jsonwebtoken) for user sessions and bcryptjs for password hashing.
*   **Real-time:** Socket.IO for WebSocket communication.
*   **Configuration:** Environment variables managed via `dotenv`.
*   **Modular Design:** Code organized into distinct modules (see `modules/` directory) and a standard backend structure (`server/` directory containing routes, models, services, etc.).
*   **Validation:** Uses `joi` for request data validation (implied by dependency and `server/validators/` folder).
*   **Logging:** Uses `pino` for logging.
*   **Database Migrations:** `sequelize-cli` and `umzug` suggest support for managing database schema changes.
*   **Other Dependencies:** Includes `cors` for handling Cross-Origin Resource Sharing, `axios` for making HTTP requests, `@aws-sdk/client-s3` for potential S3 integration, `nodemailer` for email sending, etc.