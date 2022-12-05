import {Service, PlatformAccessory, CharacteristicValue, Characteristic} from 'homebridge';

import { ExampleHomebridgePlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ExamplePlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    On: false,
    Brightness: 100,
  };

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    // register handlers for the Brightness Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this));       // SET - bind to the 'setBrightness` method below

    /**
     * Creating multiple services of the same type.
     *
     * To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
     * when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
     * this.accessory.getService('NAME') || this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE_ID');
     *
     * The USER_DEFINED_SUBTYPE must be unique to the platform accessory (if you platform exposes multiple accessories, each accessory
     * can use the same sub type id.)
     */

    // Example: add two "motion sensor" services to the accessory
    const motionSensorOneService = this.accessory.getService('Motion Sensor One Name') ||
      this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor One Name', 'YourUniqueIdentifier-1');

    const motionSensorTwoService = this.accessory.getService('Motion Sensor Two Name') ||
      this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor Two Name', 'YourUniqueIdentifier-2');

    /**
     * Updating characteristics values asynchronously.
     *
     * Example showing how to update the state of a Characteristic asynchronously instead
     * of using the `on('get')` handlers.
     * Here we change update the motion sensor trigger states on and off every 10 seconds
     * the `updateCharacteristic` method.
     *
     */
    let motionDetected = false;
    setInterval(() => {
      // EXAMPLE - inverse the trigger
      motionDetected = !motionDetected;

      // push the new value to HomeKit
      motionSensorOneService.updateCharacteristic(this.platform.Characteristic.MotionDetected, motionDetected);
      motionSensorTwoService.updateCharacteristic(this.platform.Characteristic.MotionDetected, !motionDetected);

      this.platform.log.debug('Triggering motionSensorOneService:', motionDetected);
      this.platform.log.debug('Triggering motionSensorTwoService:', !motionDetected);
    }, 10000);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.exampleStates.On = value as boolean;

    this.platform.log.debug('Set Characteristic On ->', value);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const isOn = this.exampleStates.On;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return isOn;
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  async setBrightness(value: CharacteristicValue) {
    // implement your own code to set the brightness
    this.exampleStates.Brightness = value as number;

    this.platform.log.debug('Set Characteristic Brightness -> ', value);
  }

}

/*
**************************************
**************************************
Under construction Valve Accessory
**************************************
**************************************
 */


export class SIPIrrigationSystemAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    Active: 0,
    ProgramMode: 0,
    InUse: 0
  };

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // // set accessory information
    // this.accessory.getService(this.platform.Service.AccessoryInformation)!
    //   .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
    //   .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
    //   .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.IrrigationSystem) || this.accessory.addService(this.platform.Service.IrrigationSystem);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.platform.log.debug('Hello PlatformCharacteristicName', this.platform.Characteristic.Name);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the Active Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Active)
      .onSet(this.setActive.bind(this))                // SET - bind to the `setActive` method below
      .onGet(this.getActive.bind(this));               // GET - bind to the `getActive` method below

    // register handlers for the ProgramMode Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Active)
      .onSet(this.setProgramMode.bind(this))                // SET - bind to the `setProgramMode` method below
      .onGet(this.getProgramMode.bind(this));               // GET - bind to the `getProgramMode` method below


    // // register handlers for the Brightness Characteristic
    // this.service.getCharacteristic(this.platform.Characteristic.Brightness)
    //   .onSet(this.setBrightness.bind(this));       // SET - bind to the 'setBrightness` method below

    /**
     * Creating multiple services of the same type.
     *
     * To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
     * when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
     * this.accessory.getService('NAME') || this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE_ID');
     *
     * The USER_DEFINED_SUBTYPE must be unique to the platform accessory (if you platform exposes multiple accessories, each accessory
     * can use the same sub type id.)
     */

    //   // Example: add two "motion sensor" services to the accessory
    // const motionSensorOneService = this.accessory.getService('Motion Sensor One Name') ||
    //     this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor One Name', 'YourUniqueIdentifier-1');
    //
    // const motionSensorTwoService = this.accessory.getService('Motion Sensor Two Name') ||
    //   this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor Two Name', 'YourUniqueIdentifier-2');

    /**
     * Updating characteristics values asynchronously.
     *
     * Example showing how to update the state of a Characteristic asynchronously instead
     * of using the `on('get')` handlers.
     * Here we change update the motion sensor trigger states on and off every 10 seconds
     * the `updateCharacteristic` method.
     *
     */
    let motionDetected = false;
    setInterval(() => {
      // EXAMPLE - inverse the trigger
      motionDetected = !motionDetected;

      // // push the new value to HomeKit
      // motionSensorOneService.updateCharacteristic(this.platform.Characteristic.MotionDetected, motionDetected);
      // motionSensorTwoService.updateCharacteristic(this.platform.Characteristic.MotionDetected, !motionDetected);
      //
      // this.platform.log.debug('Triggering motionSensorOneService:', motionDetected);
      // this.platform.log.debug('Triggering motionSensorTwoService:', !motionDetected);
    }, 10000);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setActive(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.exampleStates.Active = value as number;
    this.platform.log.debug('Set Characteristic Active ->', value);
  }

  async setProgramMode(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.exampleStates.ProgramMode = value as number;
    this.platform.log.debug('Set Characteristic ProgramMode ->', value);
  }

  async setInUse(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.exampleStates.InUse = value as number;
    this.platform.log.debug('Set Characteristic InUse ->', value);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getActive(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const Active = this.exampleStates.Active;
    this.platform.log.debug('Get Characteristic Active ->', Active.toString());

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return Active;
  }

  async getProgramMode(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const ProgramMode = this.exampleStates.ProgramMode;
    this.platform.log.debug('Get Characteristic ProgramMode ->', ProgramMode.toString());

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return ProgramMode;
  }

  async getInUse(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const InUse = this.exampleStates.InUse;
    this.platform.log.debug('Get Characteristic InUse ->', InUse.toString());

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return InUse;
  }
}



/*
**************************************
**************************************
Internet Sample Irrigation Accessory
**************************************
**************************************
 */

// export class ExampleIrrigationSystemAccessory {
//
//   constructor(log, config, api) {
//     //this.log = log;
//     //this.config = config;
//     //this.api = api;
//
//     this.Service = this.api.hap.Service;
//     this.Characteristic = this.api.hap.Characteristic;
//
//     // extract name from config
//     this.name = config.name;
//
//     // create a new Irrigation System service
//     this.service = new this.Service(this.Service.IrrigationSystem);
//
//     // create handlers for required characteristics
//     this.service.getCharacteristic(this.Characteristic.Active)
//       .onGet(this.handleActiveGet.bind(this))
//       .onSet(this.handleActiveSet.bind(this));
//
//     this.service.getCharacteristic(this.Characteristic.ProgramMode)
//       .onGet(this.handleProgramModeGet.bind(this));
//
//     this.service.getCharacteristic(this.Characteristic.InUse)
//       .onGet(this.handleInUseGet.bind(this));
//
//   }
//
//   /**
//    * Handle requests to get the current value of the "Active" characteristic
//    */
//   handleActiveGet() {
//     this.log.debug('Triggered GET Active');
//
//     // set this to a valid value for Active
//     const currentValue = this.Characteristic.Active.INACTIVE;
//
//     return currentValue;
//   }
//
//   /**
//    * Handle requests to set the "Active" characteristic
//    */
//   handleActiveSet(value) {
//     this.log.debug('Triggered SET Active:' value);
//   }
//
//   /**
//    * Handle requests to get the current value of the "Program Mode" characteristic
//    */
//   handleProgramModeGet() {
//     this.log.debug('Triggered GET ProgramMode');
//
//     // set this to a valid value for ProgramMode
//     const currentValue = this.Characteristic.ProgramMode.NO_PROGRAM_SCHEDULED;
//
//     return currentValue;
//   }
//
//
//   /**
//    * Handle requests to get the current value of the "In Use" characteristic
//    */
//   handleInUseGet() {
//     this.log.debug('Triggered GET InUse');
//
//     // set this to a valid value for InUse
//     const currentValue = this.Characteristic.InUse.NOT_IN_USE;
//
//     return currentValue;
//   }
//
//
// }