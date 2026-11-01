
.PHONY: dev web api mobile install build clean devices

# Detect Android emulator automatically
DEVICE := $(shell flutter devices --machine | powershell -NoProfile -Command "$$input | ConvertFrom-Json | Where-Object { $$_.targetPlatform -match 'android' -and $$_.emulator -eq $$true } | Select-Object -First 1 -ExpandProperty id")

# Start all applications
dev: 
	powershell -NoProfile -Command "Start-Process powershell -ArgumentList '-NoExit','-Command','Set-Location D:\ShopFlow\web; npm run dev'"
	powershell -NoProfile -Command "Start-Process powershell -ArgumentList '-NoExit','-Command','Set-Location D:\ShopFlow\backend; npm run start:dev'"
	powershell -NoProfile -Command "Start-Process powershell -ArgumentList '-NoExit','-Command','Set-Location D:\ShopFlow\mobile; flutter run'"

# Individual services
web:
	cd web && npm run dev

api:
	cd backend && npm run start:dev

mobile:
	cd mobile && flutter run -d $(DEVICE)


# Install dependencies
install:
	cd web && npm install
	cd backend && npm install
	cd mobile && flutter pub get

# Build applications
build:
	cd web && npm run build
	cd backend && npm run build
	cd mobile && flutter build apk --release

# Clean Flutter
clean:
	cd mobile && flutter clean
