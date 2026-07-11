# Sustainable Waste Management Assistant Using Generative AI

## Description

A web application that helps users classify waste items using AI and provides disposal instructions, recycling guidance, hazard warnings, and eco-friendly suggestions.

## Technologies Used

- React.js
- Flask
- Groq API (Llama 3.3)
- Python
- Axios

## Project Structure

```
backend/
frontend/
README.md
```

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs at:

```
http://127.0.0.1:5000
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

## Features

- AI Waste Classification
- Disposal Guidance
- Hazard Warnings
- Recycling Suggestions
- Dynamic React Frontend

## Architecture

The application architecture, component responsibilities, request flow, API design, and scalability considerations are documented in [docs/Architecture.md](docs/Architecture.md).

## Deployment Validation

Local environment validation, backend and frontend startup checks, and end-to-end workflow notes are documented in [docs/DeploymentValidation.md](docs/DeploymentValidation.md).

## Documentation

- [docs/Architecture.md](docs/Architecture.md)
- [docs/DeploymentValidation.md](docs/DeploymentValidation.md)
- [docs/Conclusion.md](docs/Conclusion.md)

## Author

Chevuru abhishek
Ayan Changdar
Ayush Kumar Saha
