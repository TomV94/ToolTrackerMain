# Tool Tracker Application

A comprehensive tool tracking system for construction sites, designed to manage tool checkouts, reservations, and maintenance.

## Features

- Barcode-based tool check-in/check-out system
- Tool reservation system
- Interactive site map
- Real-time notifications
- Offline support
- Role-based access control
- Audit logging
- Lost time tracking

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express
- Database: PostgreSQL
- Authentication: JWT
- Barcode Scanner: QuaggaJS

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone [your-repo-url]
cd tool-tracker-app
```

2. Set up the database:
   - Install PostgreSQL if not already installed
   - Create a new database named 'tool_tracker'
   - Run the schema.sql file in the server/db directory
   - Run the seed.sql file to populate initial data

3. Configure environment variables:
   - Copy .env.example to .env in the server directory
   - Update the database credentials and other settings

4. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

5. Start the application:
```bash
# Start the server (from server directory)
npm start

# Start the client (from client directory)
npm start
```

## Default Users

The system comes with three default users:

1. Admin User
   - Barcode: ADMIN001
   - Role: admin

2. Store Person
   - Barcode: STORE001
   - Role: storeperson

3. Worker
   - Barcode: WORKER001
   - Role: worker

## Database Structure

The application uses the following main tables:
- users
- tools
- tool_types
- locations
- tool_transactions
- reservations
- lost_time_logs
- audit_logs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 