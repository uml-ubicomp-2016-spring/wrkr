# wrkr
Sergei Fomichev and Mike Stowell

We will update our progress for each week below.  The most recent week appears at top, and older progress appears at the bottom.

## Progress: March 29 - April 4 2016
#### [[CURRENT WEEK - PROGRESS FOR THIS WEEK IS THUS NOT FINALIZED]]

### Mobile + Smartwatch App

- Implemented and tested the API for the Java/mobile side
- Using a partial wakelock + accelerometer re-register combination to keep the watches accelerometer on
  - only one or the other does not work, but so far using both seems fine. Needs more testing.




## Progress: March 22 - March 28 2016

### Mobile + Smartwatch App

- Added ability to manage and sync your Google profile to the app
- Finished much of the mobile app’s UI
- unregister/register wear accelerometer every 5 minutes so it doesn’t shut off when recording data
  - Though I think I may need to resort to Wakelock or another mechanism, because this isn’t always reliable - sometimes the accelerometer reports data at a much, much slower rate (watch is “sleeping?”), even though I specify maximum rate
- Accelerometer data is now stored in a JSONObject and sent back to the mobile phone
  - Currently sending: accel X, Y, Z, magnitude, and a weighted moving average
  - Future plan: possibly using gravity to determine orientation
  - These will be fed as features to a machine learning algorithm
- Did a battery test: confirmed that large battery drain was due to debug over bluetooth, not due to the accelerometer being on and magnitude/WMA being calculated frequently



### Web + Leap Motion

 - Added the exercise progress bar, so you can see how many exercises you have left in a nice way. 
 - Implemented the second hand which goes after the first one.
 - Made the first API command implemented. 
