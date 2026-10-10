## Weekly Overview
Week 6 introduces embedded Linux computing platforms with Python and Raspberry Pi, covering single-board computer architecture, GPIO programming, and camera/sensor interfacing.

* **Lectures Included:** Lecture 26 (Python Programming I), Lecture 27 (Python Programming II), Lecture 28 (Introduction to Raspberry Pi I), Lecture 29 (Introduction to Raspberry Pi II), Lecture 30 (IoT Implementation with Raspberry Pi I).
* **Core Theme:** Python scripting, Raspberry Pi hardware architecture, Linux OS on SBCs, and peripheral interfacing.

---

## High-Yield Concepts & Architecture

### 1. Arduino (Microcontroller) vs Raspberry Pi (Single-Board Computer)
* **Arduino:** Bare-metal MCU; executes single program loop directly on hardware; microsecond real-time responsiveness; low power; limited memory/CPU.
* **Raspberry Pi:** Fully fledged ARM-based Single-Board Computer (SBC); runs a multitasking OS (Raspberry Pi OS / Linux); multi-core CPU, gigabytes of RAM; video, USB, HDMI, ethernet connectivity.

### 2. Raspberry Pi Hardware & Architecture
* **SoC:** Broadcom ARM cortex multi-core SoC with VideoCore GPU.
* **Storage:** MicroSD card acts as boot drive and root filesystem.
* **40-Pin GPIO Header:**
  * Dedicated 3.3V, 5V, and GND pins.
  * Digital GPIO pins (operating strictly at 3.3V logic level; **not 5V tolerant**).
  * Hardware communication interfaces: I2C (SDA, SCL), SPI (MOSI, MISO, SCLK, CE), and UART (TX, RX).
  * Note: Raspberry Pi has **no built-in ADC** on board; reading analog sensors requires an external ADC chip (like MCP3008).

### 3. Embedded Python & Sensor Programming
* ** library:** Configures pin numbering modes:
  * : Physical header pin numbers (1 to 40).
  * : Broadcom SoC channel numbers (GPIO numbers).
* **Interfacing:** Interfacing PIR motion sensors, ultrasonic distance sensors, and camera modules using python scripts.

---

## Exam & Assignment Takeaways

| Comparison Factor | Arduino Uno | Raspberry Pi (e.g., Pi 3/4) |
| :--- | :--- | :--- |
| **Category** | Microcontroller Board (MCU) | Single-Board Computer (SBC) |
| **Operating System** | None (Bare metal) | Linux (Raspberry Pi OS) |
| **GPIO Logic Level** | 5V | 3.3V (**Applying 5V burns pins**) |
| **Analog Inputs** | 6 built-in 10-bit ADC channels | None on-board (requires external ADC) |
