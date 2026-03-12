# Hotel Booking Platform

A modern, full-stack Hotel Booking Platform built with ASP.NET Core 10 Web API and React + Vite. This application provides a comprehensive solution for browsing hotels, booking rooms, managing user reservations, and an admin dashboard for managing hotel properties.

## 🌟 Key Features

### For Guests (Users)
- **User Authentication:** Secure Registration and Login with JWT tokens.
- **Hotel Browsing:** View a list of available hotels with advanced filtering (Wi-Fi, Pool, Parking, etc.) and search by location or name.
- **Detailed Property Views:** View hotel details, amenities, available rooms, pricing, and image galleries.
- **Booking Flow:** Secure Checkout process to book a room.
- **User Dashboard:** View past and upcoming travel itineraries, booking status (Pending, Confirmed, Cancelled), and manage personal bookings.

### For Administrators
- **Admin Dashboard:** Access a protected control panel.
- **Property Management:** Add, edit, or delete hotel listings and manage room details.
- **Booking Overview:** Monitor all platform reservations dynamically.

## 🛠️ Technology Stack

**Backend (API & Services):**
- **Framework:** ASP.NET Core 10 Web API
- **Architecture:** Clean Architecture (Core, Infrastructure, Services, Server, Client)
- **Database:** Entity Framework Core (SQL Server) [Ready for integration]
- **Authentication:** JWT (JSON Web Tokens)
- **API Documentation:** Swagger UI

**Frontend (Client application):**
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router DOM (v6)
- **State Management:** Zustand
- **Styling:** Custom Vanilla CSS with modern responsive design
- **Icons:** Lucide React
- **HTTP Client:** Axios

---

## 🚀 Getting Started

Ensure you have the following installed on your machine:
- [.NET 10.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/10.0)
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (Express or Developer edition)

### 1. Clone & Open the Repository
```bash
# Clone the repository (if applicable)
# git clone <repository-url>
# cd HotelBookingPlatform

# Or simply open the root folder `HotelBookingPlatform` in your preferred IDE (Visual Studio / VS Code).
```

### 2. Running the Backend (.NET Web API)

The backend is structured into multiple class libraries (`Core`, `Infrastructure`, `Services`) and the main Web API project (`Server`).

```bash
# Navigate to the API Server project
cd HotelBookingPlatform.Server

# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the API
dotnet run
```
Once the server is running, the API typically listens on `https://localhost:7082` or `http://localhost:5207`.

**API Documentation (Swagger):**
You can access the interactive Swagger UI to test the API endpoints by navigating to:
`https://localhost:<port>/swagger` in your browser.

### 3. Running the Frontend (React Client)

The React client interacts with the ASP.NET Core Web API.

```bash
# Open a new terminal instance and navigate to the client application
cd hotelbookingplatform.client

# Install Node.js dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will be accessible at: `http://localhost:5173`. 
Open this URL in your browser to interact with the application.

---

## 📂 Project Structure

```
HotelBookingPlatform/
│
├── HotelBookingPlatform.Core/          # Enterprise business rules/Domain Entities
├── HotelBookingPlatform.Infrastructure/# Data Access Layer (EF Core, Repositories)
├── HotelBookingPlatform.Services/      # Application business rules
├── HotelBookingPlatform.Server/        # ASP.NET Core Web API (Controllers)
└── hotelbookingplatform.client/        # React Client Application
```

## 🔐 Future Considerations (Phase 8+)
- Implement real payment gateways (Stripe/PayPal) instead of mock checkouts.
- Implement robust email notifications for booking confirmations.
- Migrate mock data arrays in the frontend to fully rely on actual database endpoints.
- Add Unit Tests and Integration Tests across both Backend and Frontend.

---
*Created as part of the Phase 1 - Phase 7 Full-Stack implementation journey.*
