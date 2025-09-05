QMS Audit Management System
This is a full-stack Quality Management System (QMS) application designed for the life science industry, with a focus on audit management. It features a multi-step wizard for creating new audits, a comprehensive list view for tracking them, and an integrated AI assistant to streamline QMS tasks.

🚀 Key Features
Wizard-style Audit Creation: A user-friendly, multi-step form for creating detailed QMS audit records.

Dynamic Audit List: A searchable and filterable list of all audits, fetched and displayed from the backend.

AI-Powered Assistant: An integrated AI chat interface on the audit list page that provides intelligent insights and automates common QMS tasks.

Responsive UI: The application is designed to be responsive and provide a consistent user experience across different devices.

Robust Backend: A FastAPI backend that handles all business logic, data validation, and communication with the database.

Centralized State Management: Redux Toolkit manages the entire application state, ensuring predictable data flow.

<br>
<br>

⚙️ Tech Stack
Frontend
React: A declarative and component-based JavaScript library for building the user interface.

Redux Toolkit: A modern, opinionated Redux approach for efficient state management.

Axios: A promise-based HTTP client for making API calls to the backend.

Lucide React: A lightweight icon library to maintain a clean and consistent UI.

Tailwind CSS: A utility-first CSS framework for rapid and consistent styling. The application utilizes a global stylesheet with custom properties and utility classes from the provided HTML templates.

Backend
FastAPI: A modern, fast (high-performance) Python web framework for building APIs.

SQLite: A lightweight, file-based database for local data persistence.

SQLAlchemy: An Object-Relational Mapper (ORM) that simplifies database interactions.

Pydantic: A data validation and settings management library, integrated with FastAPI to ensure data integrity.

Google Gemini API: Used with the google-generativeai package to power the AI assistant. The model used is 

gemini-1.5-flash for its efficiency and capability.


📦 Setup & Installation
Follow these instructions to get the application up and running on your local machine.

Prerequisites
Python 3.8+

Node.js 14+

A valid Google AI Studio API key.

Backend Setup
Navigate to the backend directory.

Bash

cd backend
Install Python dependencies from requirements.txt.

Bash

pip install -r requirements.txt
Set your Google AI Studio API key as an environment variable. The backend code is configured to read from GOOGLE_API_KEY.

Windows: set GOOGLE_API_KEY="your_api_key_here"

macOS/Linux: export GOOGLE_API_KEY="your_api_key_here"

Frontend Setup
Navigate to the frontend directory.

Bash

cd frontend
Install Node.js dependencies.

Bash

npm install
▶️ How to Run the Application
You must run the backend and frontend in separate terminals.

Start the Backend API

From the root project directory, run:

Bash

uvicorn backend.main:app --reload
This will start the FastAPI server on http://localhost:8000. It will also automatically seed the database with sample audit data if it's empty.

Start the Frontend App

From the frontend directory, run:

Bash

npm start
This will start the React development server on http://localhost:3000. The browser should open automatically.

🧠 Design Choices and AI Features
Design Choices
Separation of Concerns: The project is split into a backend and frontend folder, a standard practice for full-stack applications. This promotes modularity and scalability.

Redux for State: Redux Toolkit was chosen for state management in the frontend to handle the complex data flow between the list view, wizard, and AI assistant. It provides a structured and predictable state container that is easy to debug.

Pydantic Validation: All data models for the API are defined using Pydantic, which provides automatic data validation and serialization, ensuring data integrity. This is crucial for a QMS application where data accuracy is paramount.

Consistent UI: The application's UI, including styles, icons, and layout, is adapted from the provided HTML/CSS templates to ensure a consistent and polished user experience.

AI Assistant Features
The AI assistant is a core component of the QMS module. It's integrated into the list view and is designed to provide actionable insights. The implemented features are orchestrated via the FastAPI backend and use the Gemini API.


The AI assistant can perform the following actions, accessible through pre-defined buttons or a chat input:

Show High-Risk Events: This tool analyzes the current audit data and filters the list to show only events identified as high-risk.

Summarize Open Events: This provides an executive summary of all active or planned audits in the system.

Suggest Next Steps: When viewing a specific audit's details, the AI can provide context-aware recommendations for the next actions to take.

Identify Audit Trends: The AI analyzes audit data to find patterns related to frequency, location, and auditor workload, helping management make strategic decisions.

Generate Notifications: This feature allows the user to quickly create a draft notification for audit communications, such as closure announcements or follow-up reminders.

The AI assistant's responses are structured as a JSON object, which allows the frontend to parse and display the information in a user-friendly format, such as tables or bullet points, rather than plain text.
