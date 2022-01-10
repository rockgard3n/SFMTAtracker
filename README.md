# SFMTAtracker
## API, Asynch function and data manipulation exercise
Users are prompted to select a SFMTA bus route. Once they have selected the route and whether they would like to see inbound or outbound busses they can load their map. The map then displays the live location of all busses on the route. The location of each bus is updated every 15 seconds. 
Note: SFMTA only allows 60 hits per hour, so technically 15 seconds is too short an update interval. However, I am assuming that users will not have the page up for an extended period of time and would prefer a faster update time. 

## How to run
Feel free to run the program on my github site: ***

You can also update/edit the code by cloning my repository. You will need the index.html, SFmapmarker.js, and styles.css for the code to run properly. Additionally, please replace my mapbox API key with your own. 

## Future improvements
I would like to add the route path as a highlighted overlay to the map. Additionally, adding user's location to the map and then using it to show the estimated arrival time of the nearest bus would be a cool feature. 

## Licensing 
Contents of this repo are licensed MIT. See license for additional info. 
