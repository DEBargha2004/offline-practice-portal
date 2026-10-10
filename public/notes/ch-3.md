# Chapter 3: Sensing and Sensors

## Core Concept
Sensors form the input layer of the Internet of Things. They detect physical, chemical, or ambient conditions in the environment and convert them into measurable electronic signals.

* **Transducer:** Any device that converts one form of energy into another.
  * **Sensor (Input Transducer):** Converts a physical property (such as heat, light, sound, or pressure) into an electrical signal.
  * **Actuator (Output Transducer):** Converts an electrical signal into physical action (such as motion, fluid flow, or mechanical force).

---

## Sensor Classifications

### 1. By Signal Output
* **Analog Sensors:** Produce a continuous voltage or current signal directly proportional to the physical parameter being measured (such as an analog temperature sensor or light-dependent resistor).
* **Digital Sensors:** Produce discrete binary or digital data outputs (such as digital temperature sensors or optical encoders) that microcontrollers can read directly over buses like I2C or SPI.

### 2. By Dimensionality
* **Scalar Sensors:** Measure only the magnitude of a physical variable without any spatial direction. Examples: temperature, barometric pressure, and ambient humidity.
* **Vector Sensors:** Measure both magnitude and directional orientation. Examples: accelerometers, gyroscopes, magnetic compasses, and imaging cameras.

### 3. By Power Source
* **Passive Sensors:** Do not require external power to produce a signal; they generate energy directly from the physical stimulus (such as a thermocouple or piezoelectric crystal).
* **Active Sensors:** Require an external power supply or emit their own energy signal to probe the environment (such as ultrasonic distance sensors or radar).

---

## Practical Sensor Types
* **Passive Infrared (PIR) Sensor:** Detects movement by measuring changes in thermal infrared radiation emitted by humans or warm objects in its field of view.
* **Ultrasonic Distance Sensor:** Emits high-frequency sound pulses and measures the time it takes for the echo to bounce back from an object. The distance is calculated from the time elapsed and the speed of sound.
* **Camera / Image Sensor:** Captures spatial light patterns across a grid of photodetectors for visual surveillance and computer vision.
* **Gas and Smoke Sensors:** Measures changes in electrical resistance when target gas molecules interact with a heated sensing surface.

---

## Sensor Error and Performance Characteristics
All real-world sensors have operational limitations and error patterns:

* **Resolution:** The smallest incremental change in the input parameter that the sensor can reliably detect and display in its output.
* **Offset Error (Bias):** A constant shift between the measured value and the true value across the entire range. If a sensor reads 2 degrees higher at all temperatures, it has a 2-degree offset error that can be calibrated out by subtracting that value in software.
* **Sensitivity Error:** A discrepancy in the slope of the sensor's response curve. The sensor responds too strongly or too weakly as the input value increases.
* **Drift:** A slow, continuous change in baseline output readings over long periods, caused by component aging, wear, or environmental temperature changes, unrelated to actual changes in the measured parameter.
* **Hysteresis Error:** A condition where the sensor produces different output readings for the exact same input value, depending on whether the input was increasing or decreasing before the measurement. Common in magnetic and moisture sensors.

---

## Key Exam Takeaways
* **Transducer Scope:** Transducers include both sensors (physical to electrical) and actuators (electrical to physical).
* **Scalar vs. Vector:** Scalar has magnitude only (temperature, humidity); Vector includes direction (acceleration, velocity, image).
* **Ultrasonic Method:** Operates by measuring acoustic echo time-of-flight.
* **Offset Error vs. Drift:** Offset is a constant fixed bias; Drift is a slow gradual departure over operational time.
* **Hysteresis:** Output differs depending on whether input values are ascending or descending.
