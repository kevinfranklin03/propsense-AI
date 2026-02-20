@echo off
:: Start Backend
start "Backend" cmd /c "cd /d "%~dp0backend" && pip install -r requirements.txt && python main.py"

:: Start Simulator
start "Simulator" cmd /c "cd /d "%~dp0backend" && python sim.py"

:: Start Expo (Mobile) - Clears cache to ensure new IP is used
start "Mobile App" cmd /c "cd /d "%~dp0mobile" && npx expo start --clear"

:: Start Web Dashboard (Landlord Portal)
start "Web Dashboard" cmd /c "cd /d "%~dp0web" && npm run dev"
