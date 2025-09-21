@echo off
echo ====================================================
echo RBT Risk Management - Environment Switcher
echo ====================================================

if "%1"=="dev" goto development
if "%1"=="prod" goto production
if "%1"=="development" goto development
if "%1"=="production" goto production

echo Usage: switch-env.bat [dev|prod]
echo.
echo Examples:
echo   switch-env.bat dev        - Switch to development
echo   switch-env.bat prod       - Switch to production
echo.
pause
exit /b 1

:development
echo Switching to DEVELOPMENT environment...
if exist .env (
    echo Backing up current .env to .env.backup
    copy .env .env.backup >nul
)
copy .env.development .env >nul
echo Development environment activated!
echo.
echo Don't forget to:
echo 1. Create development database: rbt_db_development
echo 2. Run: php artisan migrate
echo 3. Run: php artisan db:seed
echo 4. Clear cache: php artisan config:clear
echo.
goto end

:production
echo Switching to PRODUCTION environment...
if exist .env (
    echo Backing up current .env to .env.backup
    copy .env .env.backup >nul
)
if exist .env.production (
    copy .env.production .env >nul
    echo Production environment activated from .env.production!
) else (
    echo Warning: .env.production not found!
    echo Please create .env.production or manually configure .env
)
echo.
echo Don't forget to:
echo 1. Run: php artisan config:cache
echo 2. Run: php artisan route:cache
echo 3. Run: php artisan view:cache
echo.
goto end

:end
echo Current environment settings:
php artisan env
pause