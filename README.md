# QMS Audit Management System

> A comprehensive Quality Management System (QMS) application designed for the life sciences industry, featuring intelligent audit management and AI-powered insights.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [AI Assistant Capabilities](#ai-assistant-capabilities)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🔍 Overview

The QMS Audit Management System is a full-stack web application that streamlines audit processes in life sciences organizations. Built with modern web technologies and enhanced by AI capabilities, it provides a comprehensive solution for managing audit lifecycles from creation to closure.

### Problem Statement

Life sciences organizations face challenges in:
- Managing complex audit workflows
- Maintaining regulatory compliance
- Tracking audit progress and outcomes
- Generating actionable insights from audit data

### Solution

This system addresses these challenges by providing:
- Intuitive audit creation and management workflows
- Real-time tracking and reporting capabilities
- AI-powered analysis and recommendations
- Centralized data management with robust validation

## ✨ Features

### Core Functionality

- **🧙‍♂️ Wizard-Style Audit Creation**: Multi-step guided process for comprehensive audit record creation
- **📊 Dynamic Audit Dashboard**: Real-time, searchable, and filterable audit list with advanced sorting
- **🤖 AI-Powered Assistant**: Integrated intelligent assistant for automated QMS task management
- **📱 Responsive Design**: Consistent user experience across desktop, tablet, and mobile devices
- **🔐 Data Validation**: Robust input validation ensuring data integrity and compliance

### AI Assistant Capabilities

- **Risk Analysis**: Automated identification of high-risk audit events
- **Executive Summaries**: Intelligent summarization of open events and audit status
- **Predictive Insights**: Data-driven recommendations for next steps and process improvements
- **Trend Analysis**: Pattern recognition for audit frequency, location, and resource allocation
- **Communication Support**: Automated generation of notifications and compliance reports

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/REST API    ┌──────────────────┐
│   React Frontend │ ◄──────────────── │ FastAPI Backend  │
│                 │                     │                  │
│ • Redux Store   │                     │ • Business Logic │
│ • UI Components │                     │ • Data Validation│
│ • State Mgmt    │                     │ • AI Integration │
└─────────────────┘                     └──────────────────┘
                                                   │
                                                   ▼
                                        ┌──────────────────┐
                                        │ SQLite Database  │
                                        │                  │
                                        │ • Audit Records  │
                                        │ • User Data      │
                                        │ • System Config  │
                                        └──────────────────┘
```

## 💻 Technology Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.x |
| **Redux Toolkit** | State Management | Latest |
| **Axios** | HTTP Client | Latest |
| **Tailwind CSS** | Styling Framework | 3.x |
| **Lucide React** | Icon Library | Latest |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **FastAPI** | Web Framework | Latest |
| **SQLAlchemy** | ORM | Latest |
| **Pydantic** | Data Validation | Latest |
| **SQLite** | Database | 3.x |
| **Google Gemini API** | AI Integration | gemini-1.5-flash |

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- **Python 3.8+** ([Download](https://python.org/downloads/))
- **Node.js 14+** ([Download](https://nodejs.org/))
- **Google AI Studio API Key** ([Get API Key](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd qms-audit-system
   ```

2. **Backend Setup**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Set environment variable (choose your OS)
   # Windows
   set GOOGLE_API_KEY="your_api_key_here"
   
   # macOS/Linux
   export GOOGLE_API_KEY="your_api_key_here"
   ```

3. **Frontend Setup**
   ```bash
   # Navigate to frontend directory
   cd frontend
   
   # Install Node.js dependencies
   npm install
   ```

### Running the Application

**Start the Backend Server** (Terminal 1)
```bash
# From project root
uvicorn backend.main:app --reload
```
- Server runs on: `http://localhost:8000`
- API documentation: `http://localhost:8000/docs`

**Start the Frontend Application** (Terminal 2)
```bash
# From frontend directory
npm start
```
- Application runs on: `http://localhost:3000`
- Opens automatically in your default browser

### Initial Data

The application automatically seeds the database with sample audit data on first run, allowing immediate exploration of features.

## 📚 API Documentation

Once the backend is running, comprehensive API documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/audits` | GET | Retrieve all audits |
| `/api/audits` | POST | Create new audit |
| `/api/audits/{id}` | GET | Get specific audit |
| `/api/ai/analyze` | POST | AI analysis endpoint |

## 🤖 AI Assistant Capabilities

The integrated AI assistant leverages Google's Gemini-1.5-flash model to provide intelligent QMS support:

### Available Actions

| Feature | Description | Use Case |
|---------|-------------|----------|
| **High-Risk Analysis** | Identifies and filters high-risk audit events | Risk management prioritization |
| **Executive Summaries** | Generates comprehensive summaries of open events | Management reporting |
| **Next Step Recommendations** | Provides context-aware action suggestions | Process optimization |
| **Trend Analysis** | Analyzes patterns in audit data | Strategic planning |
| **Notification Generation** | Creates draft communications and reports | Compliance documentation |

### Response Format

AI responses are structured as JSON objects, enabling rich UI presentations including:
- Formatted tables and charts
- Actionable bullet points
- Highlighted risk indicators
- Progress tracking elements

## 📁 Project Structure

```
qms-audit-system/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── database/        # Database configuration
│   ├── ai/             # AI integration
│   ├── main.py         # FastAPI application
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── store/      # Redux store
│   │   ├── services/   # API services
│   │   ├── utils/      # Utility functions
│   │   └── App.js      # Main component
│   ├── public/
│   └── package.json
└── README.md
```

## 🔧 Design Decisions

### Architectural Choices

- **Separation of Concerns**: Clear frontend/backend separation promotes modularity and scalability
- **Redux State Management**: Centralized state container ensures predictable data flow across complex UI interactions
- **Pydantic Validation**: Automatic data validation maintains data integrity crucial for QMS compliance
- **RESTful API Design**: Standard HTTP methods and status codes ensure API predictability
- **Component-Based UI**: Reusable React components promote maintainability and consistency

### Technology Rationale

- **FastAPI**: Chosen for automatic API documentation, built-in validation, and high performance
- **SQLite**: Lightweight database suitable for development and small-scale deployments
- **Tailwind CSS**: Utility-first approach enables rapid UI development with consistent styling
- **Google Gemini**: Cost-effective AI solution with strong analytical capabilities for QMS tasks

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the Life Sciences Industry**

For questions or support, please open an issue or contact the development team.
