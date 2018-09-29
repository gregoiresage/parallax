![Parallax.js](logo.png)

This library is just a port of the awesome [parallax.js](https://github.com/wagerfield/parallax) library for Fibit OS.  

# Table of Contents

- [1. Getting started](#1-getting-started)
	- [1.1 Installation](#11-installation)
	- [1.2 Preparations](#12-preparations)
	- [1.3 Run Parallax](#13-run-parallax)
- [2. Configuration](#2-configuration)
	- [2.1 Programmatic](#21-programmatic)
	- [2.2 Configuration Options](#22-configuration-options)
- [3. Methods](#3-methods)
- [6. Information](#6-information)
   - [6.1 License](#61-license)
   - [6.2 Contributors](#62-authors)

# 1. Getting started

## 1.1 Installation

`npm i -s fitbit-parallax`

You will then find the source code in `node_modules/fitbit-parallax/parallax.js`

## 1.2 Preparations

### Include the Script

`import Parallax from 'fitbit-parallax'`

### Create your SVG elements

Each Parallax.js instance needs a container element, the scene. You're free to identify it by any means you want, but for now, let's use an ID:

```svg
<svg id="scene" width="300" height="300">
</svg>
```

Per default, all direct child elements of the scene will become moving objects, the layers.

```svg
<svg id="scene" width="300" height="300">
  <g>My first Layer!</g>
  <g>My second Layer!</g>
</svg>
```

While all other options and parameters are optional, with sane defaults, and can be set programatically, each layer needs a `layer` attribute (between 0 and 100). The movement applied to each layer will be multiplied by its layer attribute.

```svg
<svg id="scene" width="300" height="300">
  <g layer="20">My first Layer!</g>
  <g layer="60">My second Layer!</g>
</svg>
```

## 1.3 Run Parallax

As soon as your app is loaded, you can create a new Parallax.js instance, providing your scene element as first parameter.

```javascript
var scene = document.getElementById('scene');
var parallaxInstance = new Parallax(scene);
parallaxInstance.enable()
```

That's it, you're running Parallax.js now!

# 2. Configuration

## 2.1 Programmatic

Most configuration settings can be declared as property of the configuration object.
Some options can also be set at run-time via instance methods.

Programmatic:

```javascript
var scene = document.getElementById('scene');
var parallaxInstance = new Parallax(scene, {
  calibrationDelay: 1000
});
parallaxInstance.enable()
```

Using Methods at Runtime:

```javascript
parallaxInstance.friction(0.2, 0.2);
```

## 2.2 Configuration Options

### calibrateX & calibrateY

Property: **calibrateX** & **calibrateY**  
Method: **calibrate(x, y)**

Value: *boolean*  
Default: *false* for X, *true* for Y

Caches the initial X/Y axis value on initialization and calculates motion relative to this.

### invertX & invertY

Property: **invertX** & **invertY**  
Method: **invert(x, y)**

Value: *boolean*  
Default: *true*

Inverts the movement of the layers relative to the input. Setting both of these values to *false* will cause the layers to move with the device motion.

### limitX & limitY

Property: **limitX** & **limitY**  
Method: **limit(x, y)**

Value: *false* or *integer*  
Default: *false*

Limits the movement of layers on the respective axis. Leaving this value at false gives complete freedom to the movement.

### scalarX & scalarY

Property: **scalarX** & **scalarY**  
Method: **scalar(x, y)**

Value: *float*  
Default: *10.0*

Multiplies the input motion by this value, increasing or decreasing the movement speed and range.

### frictionX & frictionY

Property: **frictionX** & **frictionY**   
Method: **friction(x, y)**

Value: *float* between *0* and *1*  
Default: *0.1*

Amount of friction applied to the layers. At *1* the layers will instantly go to their new positions, everything below 1 adds some easing.  
The default value of *0.1* adds some sensible easing. Try *0.15* or *0.075* for some difference.

# 3. Methods

In addition to the configuration methods outlined in the section above, there are a few more publicly accessible methods:

### enable()

Enables a disabled Parallax instance.

### disable()

Disables a running Parallax instance.

### destroy()

Completely destroys a Parallax instance, allowing it to be garbage collected.

# 5. Information

## 5.1 License

This project is licensed under the terms of the  [MIT](http://www.opensource.org/licenses/mit-license.php) License. Enjoy!

## 5.2 Authors

Matthew Wagerfield: [@wagerfield](http://twitter.com/wagerfield)  
René Roth: [Website](http://reneroth.org/)  
Grégoire Sage : Modification for Fitbit OS
