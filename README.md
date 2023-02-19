# Daily Habit Tracker

## To view live version
https://daily-habit-tracker.vercel.app/

## Purpose
To track your habits daily, through a calendar view

## Setup instructions
1. Clone this repository
2. Create a .env in the main directory
```
Example .env file: 

IRON_SESSION_PASSWORD="" //insert random text
NEXT_PUBLIC_ATLAS_URI="" //insert your mongodb uri
```
3. Install libraries by running `npm install` inside the main directory

4. Create a folder in the main directory .jest/
5. Inside that folder, create a file setEnvVars.js
```
Example .jest/setEnvVars.js file: 

process.env.NEXT_PUBLIC_ATLAS_URI="" //same as in .env file
```
6. Test everything works correctly by running `npm test`
7. If all is successful, run `npm run dev` and go to `localhost:3000` in the browser to see the site
