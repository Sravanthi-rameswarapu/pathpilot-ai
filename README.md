# PathPilot AI

PathPilot AI is an intelligent platform designed to provide students with personalized career guidance and academic support. Leveraging AI, it helps students discover their ideal career paths, plan their academics accordingly, and get tailored recommendations to achieve their goals.

## Workflows & Architecture

Below is the high-level workflow of how a student interacts with the PathPilot platform:

```mermaid
graph TD
    A[Student Sign Up] --> B[Onboarding Assessment]
    B --> C{AI Engine Analysis}
    C -->|Identifies Skills| D[Current Skill Profile]
    C -->|Detects Interests| E[Career Pathways]
    
    D --> F[Skill Gap Analysis]
    E --> F
    
    F --> G[Personalized Learning Roadmap]
    F --> H[Project Recommendations]
    
    G --> I(Continuous Progress Tracking)
    H --> I(Continuous Progress Tracking)
```

### AI Agent Workflow

```mermaid
sequenceDiagram
    participant S as Student
    participant UI as Dashboard
    participant AI as Gemini AI Agent
    
    S->>UI: Enter Target Career (e.g. Data Scientist)
    UI->>AI: Send Profile & Target Role
    AI-->>UI: Return Skill Gaps & Readiness Score
    UI->>S: Display Personalized Dashboard
```

## Dashboard Overview

Our dashboard provides a premium, dark-mode experience with all necessary metrics at a glance.

![Dashboard Preview](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80)

## Features

- **Personalized Dashboard**: View your progress, recommendations, and upcoming tasks.
- **Career Pathways**: Explore different career options and see the skills and education required for each.
- **Academic Planning**: Create a customized academic plan based on your career goals.
- **AI-Powered Recommendations**: Get smart suggestions for courses, internships, and extracurricular activities.

## Setup and Running

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.
