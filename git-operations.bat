@echo off
echo Checking git status...
git status
echo.
echo Adding all changes...
git add .
echo.
echo Committing changes...
git commit -m "fix: Enhanced table formatting with robust regex and error handling

🔧 Table Processing Improvements:
- Updated table regex pattern for better reliability
- Added comprehensive error handling with try-catch blocks
- Improved cell parsing and filtering logic
- Removed unused table rule from constructor
- Added debugging support for table processing

📊 Table Features:
- Support for basic and complex table structures
- Professional styling with responsive design
- Proper header and body separation
- Error recovery to prevent crashes

🧪 Testing:
- Created comprehensive table verification tests
- Added test files for manual verification
- Improved table detection and parsing

This ensures table formatting works correctly in the AI chat application."
echo.
echo Pushing to remote repository...
git push origin main
echo.
echo All operations completed successfully!
pause

