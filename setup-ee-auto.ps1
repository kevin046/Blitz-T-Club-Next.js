# EE Auto Tracking System - Quick Setup Script
# This script helps you set up the vendor tracking system

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EE Auto Tracking System - Setup Wizard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (!(Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please ensure you have your Supabase credentials configured." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green
Write-Host ""

# Display migration file path
$migrationFile = "supabase\migrations\create_vendors_tables.sql"
if (Test-Path $migrationFile) {
    Write-Host "✅ Migration file found: $migrationFile" -ForegroundColor Green
} else {
    Write-Host "❌ Migration file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Instructions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Run Database Migration" -ForegroundColor Yellow
Write-Host "-------------------------------"
Write-Host "1. Go to https://supabase.com/dashboard"
Write-Host "2. Select your project"
Write-Host "3. Navigate to SQL Editor"
Write-Host "4. Click 'New Query'"
Write-Host "5. Copy the contents of: $migrationFile"
Write-Host "6. Paste into SQL Editor"
Write-Host "7. Click 'Run'"
Write-Host ""

Write-Host "Step 2: Update Vendor Password" -ForegroundColor Yellow
Write-Host "-------------------------------"
Write-Host "⚠️  IMPORTANT: Change the default password!" -ForegroundColor Red
Write-Host ""
Write-Host "Run this SQL in Supabase SQL Editor:"
Write-Host "UPDATE vendors SET password_hash = 'your_secure_password' WHERE id = 'ee-auto-uuid';" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 3: Test the System" -ForegroundColor Yellow
Write-Host "-------------------------------"
Write-Host "1. Get a test member UUID from your profiles table"
Write-Host "2. Visit: http://localhost:3000/verify-member?member_id=<uuid>"
Write-Host "3. Click 'Vendor: Log Deal'"
Write-Host "4. Enter password: eeauto2024 (or your custom password)"
Write-Host "5. Should redirect to /vendor/ee-auto"
Write-Host "6. Log a test deal"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "File Locations" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📄 Verify Member Page: app\verify-member\page.tsx" -ForegroundColor White
Write-Host "📄 EE Auto Dashboard: app\vendor\ee-auto\page.tsx" -ForegroundColor White
Write-Host "📄 EE Auto Styles: app\vendor\ee-auto\ee-auto.css" -ForegroundColor White
Write-Host "📄 Database Migration: supabase\migrations\create_vendors_tables.sql" -ForegroundColor White
Write-Host "📄 Setup Guide: EE_AUTO_TRACKING_SETUP.md" -ForegroundColor White
Write-Host "📄 Implementation Summary: EE_AUTO_IMPLEMENTATION_SUMMARY.md" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Need Help?" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Read the setup guide: EE_AUTO_TRACKING_SETUP.md"
Write-Host "📖 Read the implementation summary: EE_AUTO_IMPLEMENTATION_SUMMARY.md"
Write-Host ""

$response = Read-Host "Would you like to open the migration file now? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    if (Get-Command code -ErrorAction SilentlyContinue) {
        code $migrationFile
        Write-Host "✅ Migration file opened in VS Code" -ForegroundColor Green
    } else {
        notepad $migrationFile
        Write-Host "✅ Migration file opened in Notepad" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup wizard complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run the database migration in Supabase"
Write-Host "2. Change the default password"
Write-Host "3. Test the system with a member QR code"
Write-Host ""
