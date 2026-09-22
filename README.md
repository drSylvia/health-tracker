# Health Tracker

A lightweight personal health tracking application that uses a chat-based interface to make daily health logging simple and low-effort.

## Purpose

The goal of this project is to reduce the effort required to track everyday health information.

Instead of manually entering data into forms or multiple health apps, the user can record information through a simple mobile-friendly chat interface using natural language, photos, and eventually voice input.

Examples:

* `Weight 57.85 kg`
* `Went to bed at 10:45 pm and woke up at 6:40 am`
* `Ran for 25 minutes`
* Upload a photo of breakfast for estimated calorie intake

The application will use AI to interpret these inputs and convert them into structured data for long-term tracking and analysis.

## Planned Workflow

```text
iPhone / Computer
        │
        ▼
Streamlit Chat Interface
        │
        │ Text / Image / Voice
        ▼
OpenAI API
        │
        │ Interpret and structure input
        ▼
Structured Health Data
        │
        ▼
OneDrive
CSV / structured data files
        │
        ▼
Power BI
        │
        ▼
Health Dashboard & Trend Analysis
```

### 1. Data Input

The primary interface will be a mobile-friendly chat window.

The user should be able to record information naturally without completing predefined forms.

Planned input types include:

* Weight
* Sleep and wake times
* Meals and estimated calories
* Exercise type and duration
* Photos of meals
* Other health metrics added later if useful

### 2. AI Processing

OpenAI will be used to interpret natural-language and image inputs.

For example:

```text
User:
今日体重57.85kg

AI interpretation:
date: 2026-09-22
category: weight
value: 57.85
unit: kg
```

For information that requires estimation, such as calories estimated from a meal photo, the system should distinguish estimated values from directly reported measurements.

### 3. Data Storage

Structured data will ultimately be stored in OneDrive.

The preferred format is lightweight and portable, initially using CSV files.

The health data itself should not be stored in the GitHub repository.

### 4. Data Analysis

Power BI will be used as the main reporting and analytics layer.

Potential analysis includes:

* Current weight and progress toward target
* Daily and weekly calorie intake
* Exercise frequency and duration
* Sleep duration
* 7-day and 30-day weight trends
* Relationships between food, exercise, sleep and weight
* Longer-term health trends

## Technology

| Component             | Tool                      |
| --------------------- | ------------------------- |
| Source control        | Git / GitHub              |
| Development           | Python 3.13               |
| Dependency management | Poetry                    |
| Chat interface        | Streamlit                 |
| AI processing         | OpenAI API                |
| Data processing       | pandas                    |
| Data storage          | OneDrive / CSV            |
| Reporting             | Power BI                  |
| Hosting               | Streamlit Community Cloud |

## Development Approach

The project will be developed incrementally.

### Phase 1 — Chat Interface

* Create Streamlit application
* Support basic text chat
* Deploy through Streamlit Community Cloud
* Test usability on iPhone

### Phase 2 — AI Processing

* Connect OpenAI API
* Interpret natural-language health entries
* Support structured output
* Add image input and meal analysis
* Allow confirmation or correction before saving estimated data

### Phase 3 — Data Storage

* Define health data structure
* Save structured records
* Connect persistent storage to OneDrive
* Keep health data separate from application source code

### Phase 4 — Power BI

* Connect Power BI to stored data
* Build daily, weekly and long-term dashboards
* Analyse trends across weight, food, exercise and sleep

### Phase 5 — Improvements

Possible future additions include:

* Voice input
* Editing or deleting previous records through chat
* Daily summaries
* Automated trend summaries
* Additional health metrics

## Current Status

Initial development environment established.

Current functionality:

* Python / Poetry environment configured
* Streamlit installed and running
* Basic chat interface working locally
* GitHub repository established

Next milestone:

**Deploy the basic Streamlit application and test the chat interface on iPhone.**
