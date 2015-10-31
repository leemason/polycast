## Polycast
[![Packagist License](https://poser.pugx.org/leemason/polycast/license.png)](http://choosealicense.com/licenses/mit/)
[![Latest Stable Version](https://poser.pugx.org/leemason/polycast/version.png)](https://packagist.org/packages/leemason/polycast)
[![Total Downloads](https://poser.pugx.org/leemason/polycast/d/total.png)](https://packagist.org/packages/leemason/polycast)

Laravel Websocket broadcasting polyfill using ajax and mysql. Laravel 5.1 or Later

## Installation

Require this package with composer:

```
composer require leemason/polycast
```

After updating composer, add the ServiceProvider to the providers array in config/app.php

### Laravel 5.1:

```php
LeeMason\Polycast\PolycastServiceProvider::class,
```

Add the following in your broadcasting connections array located in config/broadcasting.php

```php
'polycast' => [
    'driver' => 'polycast',
    'delete_old' => 2, //this deletes old events after 2 minutes, this can be changed to leave them in the db longer if required.
]
```

Copy the package assets to your public folder with the publish command:

```php
php artisan vendor:publish --tag=public --force
```

Migrate the packages database migrations (creates the polycast_events table):

```php
php artisan migrate --path=vendor/leemason/polycast/migrations
```

## Usage

To Optionally set Polycast as your default broadcast events driver set ```polycast``` as the default in your config/broadcasting.php or ```BROADCAST_DRIVER=polycast``` in your .env file.

Once installed you create broadcastable events exactly the same as you do now (using the ShouldBroadcast trait), except you have a way to consume those events via browsers without the need for nodejs/redis or an external library to be installed/purchased.

This package doesn't aim to compete with libraries or solutions such as PRedis/SocketIO/Pusher.
But what it does do is provide a working solution for situations where you can't install nodejs and run a websocket server, or where the cost of services like Pusher aren't feasible.

The package utilizes vanilla javascript timeouts and ajax requests to "simulate" a realtime experience.
It does so by saving the broadcastable events in the database, via a setTimeout javascript ajax request, polls the packages receiver url and distrubutes the payloads via javascript callbacks.

To add to the simulation of realtime events each event found is parsed from the time its requested, and when the event was fired.
The difference in seconds is then used to delay the callbacks firing on that specific event.

What this does is prevent every event callback dumping into the dom when the ajax request has completed, but instead fires then in sequence as if it was loading live.

To the user the only real difference to websockets is that they will be a few seconds behind (depending on the polling option provided "default 5 seconds").

I have tried to keep the javascript api similar to current socket solutions to reduce the learning curve.

Here's an example:

```javascript
<script src="<?php echo url('vendor/polycast/polycast.min.js');?>"></script>
<script>
    (function() {

        //create the connection
        var poly = new Polycast('http://localhost/polycast', {
            token: '<?php echo csrf_token();?>'
        });

        //register callbacks for connection events
        poly.on('connect', function(obj){
            console.log('connect event fired!');
            console.log(obj);
        });

        poly.on('disconnect', function(obj){
            console.log('disconnect event fired!');
            console.log(obj);
        });

        //subscribe to channel(s)
        var channel1 = poly.subscribe('channel1');
        var channel2 = poly.subscribe('channel2');

        //fire when event on channel 1 is received
        channel1.on('Event1WasFired', function(data){
            console.log(data);
        });

        //fire when event on channel 2 is received, optionally accessing the event object
        channel2.on('Event2WasFired', function(data, event){
            /*
                event.id = mysql id
                event.channels = array of channels
                event.event = event name
                event.payload = object containing event data (same as the first data argument)
                event.created_at = timestamp from mysql
                event.requested_at = when the ajax request was performed
                event.delay = the delay in seconds from when the request was made and when the event happened (used internally to delay callbacks)
            */

            var body = document.getElementById('body');
            body.innerHTML = body.innerHTML + JSON.stringify(data);
        });


        //at any point you can disconnect
        poly.disconnect();

        //and when you disconnect, you can again at any point reconnect
        poly.reconnect();

    }());
</script>
```

Breaking down the example you can see we include the library:

```javascript
<script src="<?php echo url('vendor/polycast/polycast.min.js');?>"></script>
```

Create a Polycast object inside a self executing function (this can be done a few ways, and has a few options):

```javascript
<script>
    (function() {

        //default options
        defaults = {
            url: null,
            token: null,
            polling: 5 //this is how often in seconds the ajax request is made, make sure its less than the (delete_old * 60) connection config value or events may get deleted before consumed.
        };

        //create the connection
        var poly = new Polycast('http://localhost/polycast', {
            token: '<?php echo csrf_token();?>'
        });

        //or like this
        var poly = new Polycast({
            url: 'http://localhost/polycast',
            token: '<?php echo csrf_token();?>'
        });

        //or like this (but this way we arent using csrf, and i can't see a good reason not to)
        var poly = new Polycast('http://localhost/polycast');

        ....

    }());
</script>
```

We register any callbacks on the connection events:

```javascript
//register callbacks for connection events
poly.on('connect', function(obj){
    console.log('connect event fired!');
    console.log(obj);
});

poly.on('disconnect', function(obj){
    console.log('disconnect event fired!');
    console.log(obj);
});
```

We create channel objects by subscribing to the channel:

```javascript
//subscribe to channel(s)
var channel1 = poly.subscribe('channel1');
var channel2 = poly.subscribe('channel2');
```

And we register callbacks for specific events fired on those channels:

```javascript
//fire when event on channel 1 is received
channel1.on('Event1WasFired', function(data){
    console.log(data);//data is a json decoded object of the events properties
});
```

Should something go wrong, or you need to disconnect you can at any point in time:

```javascript
//at any point you can disconnect
poly.disconnect();

//and when you disconnect, you can again at any point reconnect
poly.reconnect();
```

And that's it! (for now)

## Bower Usage

The polycast package is registered on Bower using the name ```leemason-polycast``` and can be installed by running:

```
bower install leemason-polycast
```

The package script can then be accessed from the ```bower_components/leemason-polycast/dist/js/polycast(.min).js``` path.

## NPM Usage

The polycast package is registered on npm using the name ```leemason-polycast``` and can be installed by running:

```
npm install leemason-polycast
```

The package script can then be accessed from the ```node_modules/leemason-polycast/dist/js/polycast(.min).js``` path.

## Webpack Usage

The polycast package script files are generated using gulp/webpack, this offers advantages when developing your javascript via script loaders.

Usage is as follows:

```javascript
var Polycast = require('leemason-polycast');//this is npm usage, if using bower you will need to provide the full path
var poly = new Polycast({...});
```

The package is still in early development (but is stable) so expect new methods and features soon.

## FAQ

**Does this require jQuery?**

Nope, all vanilla js here including the ajax requests.

**What if there is a problem during the request? Will my javascript enter a loop?**

Nope, the next setTimeout call wont happen until the previous one has been compeleted.

**How does it work out what events get sent to who?**

This is done by the channel and event names, but the package also monitors times.
When the js service creates a connection the server sends back its current time.
This is stored in the js object and is sent/updated on subsequent requests creating a "events named ? on channel ? since ?" type database query.

## Notes

The is my first real javascript heavy package, which is great as it gives me more opportunity to learn the language.
That being said if there are any improvements you could make please let me know or send a pull request.

## The Future

- Add authorization options to channels
- Add helpers here and there for removing channel/event subscriptions
- Add wildcard event name listening
- Add ability to subscribe to events without supplying channel.


