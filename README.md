# NutriSnap

NutriSnap to mobilna aplikacja, która umożliwia użytkownikowi analizę składu posiłku na podstawie zdjęcia. Użytkownik może wykonać zdjęcie lub wybrać je z galerii, a aplikacja przy pomocy sztucznej inteligencji (Gemini Flash API) określi wartości odżywcze: kaloryczność, zawartość białka, tłuszczu, węglowodanów i innych składników.

## Funkcje

- Wykonywanie zdjęcia posiłku lub wybór z galerii
- Analiza zdjęcia przy użyciu AI
- Wyświetlanie informacji o:
  - Kaloriach
  - Białkach
  - Tłuszczach
  - Węglowodanach
  - Cukrach, błonniku, cholesterolu itp.
- Widok dzienny i tygodniowy z podsumowaniem
- Porównanie z normami RWS
- Możliwość usuwania wpisów
- Obsługa błędów (np. brak rozpoznania posiłku)
- Własna animacja ekranu powitalnego
- Ciemny motyw interfejsu

## Technologie

### Frontend (React Native – Expo)
- TypeScript
- expo-router
- react-native
- react-native-gesture-handler
- expo-image-picker
- axios
- date-fns

### Backend (FastAPI)
- Python 3.12
- FastAPI
- SQLAlchemy (baza SQLite)
- Google Gemini Vision API (analiza obrazu)
- HTTPX (komunikacja z API)

## Uruchomienie

### Frontend (Expo)
-cd app/mobile/app
-npm install
-npx expo start

### Backend
-cd api
-python -m venv .venv
-source .venv/bin/activate
-pip install -r requirements.txt
-uvicorn main:app --reload --host 0.0.0.0 --port 8000

### Grupa docelowa
-Osoby prowadzące zdrowy styl życia
-Użytkownicy liczący kalorie i makroskładniki
-Sportowcy, dietetycy
-Osoby chcące szybko dokumentować swoje posiłki

