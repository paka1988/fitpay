# fitpay
## Systemarchitektur

Das Projekt **FitPay** automatisiert das Erfassen von Fitbit-Trainings und berechnet daraus den Verdienst des Nutzers.

| Schicht | Technologie | Beschreibung |
|----------|--------------|--------------|
| Frontend | React + Tailwind | Dashboard mit Statistiken |
| Backend | Node.js / Express | API, Logik, Auth |
| Datenbank | Firebase | Speicherung von Aktivitäten |
| Integration | Fitbit API | Trainingsdatenquelle |

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant FitbitAPI

    User->>Frontend: Login mit Fitbit
    Frontend->>Backend: sendet Auth-Code
    Backend->>FitbitAPI: holt Access Token
    FitbitAPI-->>Backend: sendet Trainingsdaten
    Backend-->>Frontend: gibt Verdienst zurück
