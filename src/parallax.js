/**
* Parallax.js
* @author Matthew Wagerfield - @wagerfield, René Roth - mail@reneroth.org, Grégoire Sage
* @description Creates a parallax effect between an array of layers,
*              driving the motion from the gyroscope output of a smartdevice.
*/

import { OrientationSensor } from 'orientation'
import { display } from 'display'

const helpers = {
  clamp(value, min, max) {
    return min < max
      ? (value < min ? min : value > max ? max : value)
      : (value < max ? max : value > min ? min : value)
  }
}

const MAGIC_NUMBER = 30,
      DEFAULTS = {
        calibrationThreshold: 100,
        calibrationDelay: 500,
        calibrateX: false,
        calibrateY: true,
        invertX: true,
        invertY: true,
        limitX: false,
        limitY: false,
        scalarX: 10.0,
        scalarY: 10.0,
        frictionX: 0.1,
        frictionY: 0.1
      }

export class Parallax {
  constructor(element, options) {

    this.element = element

    for (var key in DEFAULTS) {
      this[key] = DEFAULTS[key]
    }
    for (var key in options) {
      this[key] = options[key]
    }

    this.calibrationTimer = null
    this.calibrationFlag = true
    this.enabled = false
    this.wasenabled = false
    this.raf = null

    this.elementWidth = 0
    this.elementHeight = 0

    this.calibrationX = 0
    this.calibrationY = 0

    this.inputX = 0
    this.inputY = 0

    this.motionX = 0
    this.motionY = 0

    this.velocityX = 0
    this.velocityY = 0

    this.onAnimationFrame = this.onAnimationFrame.bind(this)
    this.onOrientationSensor = this.onOrientationSensor.bind(this)
    this.onCalibrationTimer = this.onCalibrationTimer.bind(this)
    this.onDisplayChanged = this.onDisplayChanged.bind(this)

    this.initialise()

    display.addEventListener('change', this.onDisplayChanged)
  }

  initialise() {
    // Setup
    this.updateLayers()
    this.enable()
    this.queueCalibration(this.calibrationDelay)
  }

  updateLayers() {
    if(!this.element.firstChild) {
      console.warn('ParallaxJS: Your scene does not have any layers.')
    }

    this.layers = []
    this.depths = []

    let layer = this.element.firstChild
    while(layer) {
      this.layers.push(layer)
      this.depths.push(layer.layer / 100 || 0)
      layer = layer.nextSibling
    }
  }

  updateBounds() {
    this.elementWidth = this.element.width
    this.elementHeight = this.element.height
  }

  queueCalibration(delay) {
    clearTimeout(this.calibrationTimer)
    this.calibrationTimer = setTimeout(this.onCalibrationTimer, delay)
  }

  enable() {
    if (this.enabled) {
      return
    }
    this.enabled = true

    this.sensor = new OrientationSensor({ frequency: 10 })
    this.sensor.onreading = this.onOrientationSensor
    this.detectionTimer = setTimeout(this.onOrientationTimer, this.supportDelay)

    this.raf = requestAnimationFrame(this.onAnimationFrame)
    this.sensor.start()
  }

  disable() {
    if (!this.enabled) {
      return
    }
    this.enabled = false

    this.sensor.stop()
    delete this.sensor
    cancelAnimationFrame(this.raf)
  }

  calibrate(x, y) {
    this.calibrateX = x === undefined ? this.calibrateX : x
    this.calibrateY = y === undefined ? this.calibrateY : y
  }

  invert(x, y) {
    this.invertX = x === undefined ? this.invertX : x
    this.invertY = y === undefined ? this.invertY : y
  }

  friction(x, y) {
    this.frictionX = x === undefined ? this.frictionX : x
    this.frictionY = y === undefined ? this.frictionY : y
  }

  scalar(x, y) {
    this.scalarX = x === undefined ? this.scalarX : x
    this.scalarY = y === undefined ? this.scalarY : y
  }

  limit(x, y) {
    this.limitX = x === undefined ? this.limitX : x
    this.limitY = y === undefined ? this.limitY : y
  }

  setPosition(element, x, y) {
    element.groupTransform.translate.x = x
    element.groupTransform.translate.y = y
  }

  onCalibrationTimer() {
    this.calibrationFlag = true
  }

  onAnimationFrame() {
    this.updateBounds()
    let calibratedInputX = this.inputX - this.calibrationX,
        calibratedInputY = this.inputY - this.calibrationY
    if ((Math.abs(calibratedInputX) > this.calibrationThreshold) || (Math.abs(calibratedInputY) > this.calibrationThreshold)) {
      this.queueCalibration(0)
    }
    {
      this.motionX = this.calibrateX ? calibratedInputX : this.inputX
      this.motionY = this.calibrateY ? calibratedInputY : this.inputY
    }
    this.motionX *= this.elementWidth * (this.scalarX / 100)
    this.motionY *= this.elementHeight * (this.scalarY / 100)
    if (!isNaN(parseFloat(this.limitX))) {
      this.motionX = helpers.clamp(this.motionX, -this.limitX, this.limitX)
    }
    if (!isNaN(parseFloat(this.limitY))) {
      this.motionY = helpers.clamp(this.motionY, -this.limitY, this.limitY)
    }
    this.velocityX += (this.motionX - this.velocityX) * this.frictionX
    this.velocityY += (this.motionY - this.velocityY) * this.frictionY
    this.layers.forEach((layer, index) => {
      let depth = this.depths[index],
          xOffset = this.velocityX * (depth * (this.invertX ? -1 : 1)),
          yOffset = this.velocityY * (depth * (this.invertY ? -1 : 1))
      this.setPosition(layer, xOffset, yOffset)
    })
    this.raf = requestAnimationFrame(this.onAnimationFrame)
  }

  rotate(beta, gamma){
    // Extract Rotation
    let x = (beta  || 0) / MAGIC_NUMBER, //  -90 :: 90
        y = (gamma || 0) / MAGIC_NUMBER  // -180 :: 180

    if (this.calibrationFlag) {
      this.calibrationFlag = false
      this.calibrationX = x
      this.calibrationY = y
    }

    this.inputX = x
    this.inputY = y
  }

  onOrientationSensor() {
    const qw = this.sensor.quaternion[0];
    const qx = this.sensor.quaternion[1];
    const qy = this.sensor.quaternion[2];
    const qz = this.sensor.quaternion[3];
    
    let y = 2.0 * (qw * qx + qy * qz);
    let x = 1.0 - 2.0 * (qx * qx + qy * qy);
    
    let roll = Math.atan2(y, x);
    roll = (roll * 180.0 / Math.PI + 360 ) % 360;
    
    let pitch = Math.asin(Math.max(-1.0, Math.min(1.0, 2.0 * (qw * qy - qz * qx))));
    pitch = pitch * 180.0 / Math.PI;

    this.rotate(pitch, roll)
  }

  onDisplayChanged() {
    if(display.on) {
      if(this.wasenabled) {
        this.enable()
      }
    } 
    else {
      this.wasenabled = this.enabled
      if(this.enabled) {
        this.disable()
      }
    }
  }

  destroy() {
    this.disable()

    clearTimeout(this.calibrationTimer)
    clearTimeout(this.detectionTimer)

    delete this.element
    delete this.layers
  }
}
