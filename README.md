Open RTB Bidder
==========

Open RTB Bidder 

### Dependencies
    node - 0.10.x
    npm - 1.3.x
    redis - 2.8.x

### Getting Started

Running locally:

    npm install       # install additional dependencies
    node server.js    # start server (runs on port 5000 & assumes redis is running at 127.0.0.1:6379)

Once running, the bidder listens for valid bid requests at `/bid-request/:exchange`

Example bid request:


    curl -X POST -H "Content-Type: application/json, x-openrtb-version: 2.1" -d '{"id":"1234567893","at":2,"tmax":120,"imp":[{"id":"1","banner":{"w":300,"h":50,"pos":1,"battr":[13]}}],"app":{"id":"123123","name":"App 123","domain":"app123.com","appcat":["IAB2-1","IAB2-2"],"privacypolicy":1,"publisher":{"id":"pub12345","name":"Publisher A"},"content":{"keyword":["keyword1","keyword2","keyword3"]}},"device":{"ip":"192.168.1.8","make":"Apple","model":"iPhone 3GS","os":"iOS","osv":"4.2.1","connectiontype":2,"geo":{"country":"USA","city":"US SFO"}},"user":{"id":"456789876567897654678987656789","buyeruid":"545678765467876567898765678987654","data":[{"id":"6","name":"Data Provider 1","segment":[{"id":"12341318394918","name":"auto intenders"},{"id":"1234131839491234","name":"auto enthusiasts"}]}]}}' http://localhost:5000/bid-request/openx
    
### Usage
\# TODO: update this section on how to configure bid agents and auction strategy from redis
