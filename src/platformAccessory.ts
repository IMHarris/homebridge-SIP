import {Service, PlatformAccessory, CharacteristicValue, Characteristic} from 'homebridge';

import { SIPHomebridgePlatform } from './platform';
import {stringify} from 'querystring';

/*
**************************************
**************************************
Irrigation Accessory
**************************************
**************************************
*/


export class SIPIrrigationSystemAccessory {
  private service: Service;
  private states = {
    Active: 0,
    ProgramMode: 0,
    InUse: 0,
  };

  constructor(
    private readonly platform: SIPHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    //   .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
    //   .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the IrrigationSystem service if it exists, otherwise create a new IrrigationService service
    this.service = this.accessory.getService(this.platform.Service.IrrigationSystem) ||
      this.accessory.addService(this.platform.Service.IrrigationSystem);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.Name);
    this.service.setCharacteristic(this.platform.Characteristic.Active, accessory.context.device.Active);
    this.service.setCharacteristic(this.platform.Characteristic.InUse, accessory.context.device.InUse);
    this.service.setCharacteristic(this.platform.Characteristic.ProgramMode, accessory.context.device.ProgramMode);
    //this.platform.log.debug('Setting irrigation service name', this.platform.Characteristic.Name);

    // register handlers for the Active Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Active)
      .onSet(this.setActive.bind(this))                // SET - bind to the `setActive` method below
      .onGet(this.getActive.bind(this));               // GET - bind to the `getActive` method below

    // register handlers for the ProgramMode Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.ProgramMode)
      .onSet(this.setProgramMode.bind(this))                // SET - bind to the `setProgramMode` method below
      .onGet(this.getProgramMode.bind(this));               // GET - bind to the `getProgramMode` method below

    // register handlers for the ProgramMode Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.InUse)
      .onSet(this.setInUse.bind(this))                // SET - bind to the `setProgramMode` method below
      .onGet(this.getInUse.bind(this));               // GET - bind to the `getProgramMode` method below
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

    }, 10000);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory.
   */
  async setActive(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.states.Active = value as number;
    this.platform.log.debug('Set Characteristic Active ->', value);
  }

  async setProgramMode(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.states.ProgramMode = value as number;
    this.platform.log.debug('Set Characteristic ProgramMode ->', value);
  }

  async setInUse(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.states.InUse = value as number;
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
    const Active = this.states.Active;
    this.platform.log.debug('Get Characteristic Active ->', Active.toString());

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return Active;
  }

  async getProgramMode(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const ProgramMode = this.states.ProgramMode;
    this.platform.log.debug('Get Characteristic ProgramMode ->', ProgramMode.toString());

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return ProgramMode;
  }

  async getInUse(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const InUse = this.states.InUse;
    this.platform.log.debug('Get Characteristic InUse ->', InUse.toString());

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return InUse;
  }
}

/*
**************************************
**************************************
Valve Accessory
**************************************
**************************************
*/


export class SIPValveSystemAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private states = {
    Active: 1,
    ValveType: 1,
    InUse: 1,
    Name: 'Hello',
    RemainingDuration: 0,
  };

  constructor(
    private readonly platform: SIPHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    // this.accessory.getService(this.platform.Service.AccessoryInformation)!
    //   .setCharacteristic(this.platform.Characteristic.Active, accessory.context.device.Active)
    //   .setCharacteristic(this.platform.Characteristic.InUse, accessory.context.device.InUse)
    //   .setCharacteristic(this.platform.Characteristic.ProgramMode, accessory.context.device.ProgramMode);
    //   .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
    //   .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the Valve service if it exists, otherwise create a new Valve service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Valve) ||
      this.accessory.addService(this.platform.Service.Valve);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.Name);
    //this.platform.log.debug('Setting valve service name', this.platform.Characteristic.Name);
    this.service.setCharacteristic(this.platform.Characteristic.InUse, accessory.context.device.InUse);
    this.service.setCharacteristic(this.platform.Characteristic.Active, accessory.context.device.Active);
    this.service.setCharacteristic(this.platform.Characteristic.ValveType, accessory.context.device.ValveType);
    this.service.setCharacteristic(this.platform.Characteristic.RemainingDuration, accessory.context.device.RemainingDuration);

    // register handlers for the Active Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Active)
      .onSet(this.setActive.bind(this))                // SET - bind to the `setActive` method below
      .onGet(this.getActive.bind(this));               // GET - bind to the `getActive` method below

    // register handlers for the ValveType Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.ValveType)
      .onSet(this.setValveType.bind(this))                // SET - bind to the `setValveType` method below
      .onGet(this.getValveType.bind(this));               // GET - bind to the `getValveType` method below

    // register handlers for the InUse Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.InUse)
      .onSet(this.setInUse.bind(this))                // SET - bind to the `setInUse` method below
      .onGet(this.getInUse.bind(this));               // GET - bind to the `getInUse` method below

    // register handlers for the Name Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Name)
      .onSet(this.setName.bind(this))                // SET - bind to the `setName` method below
      .onGet(this.getName.bind(this));               // GET - bind to the `getName` method below

    // register handlers for the RemainingDuration Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.RemainingDuration)
      .onSet(this.setRemainingDuration.bind(this))                // SET - bind to the `setRemainingDuration` method below
      .onGet(this.getRemainingDuration.bind(this));               // GET - bind to the `getRemainingDuration` method below
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
    //let motionDetected = false;
    setInterval(() => {
      // EXAMPLE - inverse the trigger
      //motionDetected = !motionDetected;

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
   * These are sent when the user changes the state of an accessory, for example, turning on a valve.
   */
  async setActive(value: CharacteristicValue) {
    // Homekit has requested accessory be turned on or off.
    this.states.Active = value as number;
    this.platform.log.debug('Set Characteristic Active for', this.accessory.displayName, '->', value);
    const payload = {};
    payload['Name'] = this.accessory.displayName;
    payload['Value'] = value;
    this.platform.log.debug('setActive routine sending:', JSON.stringify(payload));
    this.platform.mqttMgr.publish('changed-valve', JSON.stringify(payload));
    // responseTopic: String which is used as the Topic Name for a response message string,
    // correlationData:
  }

  async setValveType(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.states.ValveType = value as number;
    this.platform.log.debug('Set Characteristic ValveType for', this.accessory.displayName, '->', value);
  }

  async setInUse(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.states.InUse = value as number;
    this.platform.log.debug('Set Characteristic InUse for', this.accessory.displayName, '->', value);
  }

  async setRemainingDuration(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.states.RemainingDuration = value as number;
    this.platform.log.debug('Set Characteristic RemainingDuration for', this.accessory.displayName, '->', value);
  }

  async setName(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.states.Name = value as string;
    this.platform.log.debug('Set Characteristic Name ->', value);
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
    const Active = this.states.Active;
    //this.platform.log.debug('Get Characteristic Active for', this.states.Name.toString(), '->', Active.toString());

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return Active;
  }

  async getValveType(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const ValveType = this.states.ValveType;
    //this.platform.log.debug('Get Characteristic ValveType for', this.states.Name.toString(), '->', ValveType.toString());

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return ValveType;
  }

  async getInUse(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const InUse = this.states.InUse;
    //this.platform.log.debug('Get Characteristic InUse for', this.states.Name.toString(), '->', InUse.toString());

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return InUse;
  }

  async getRemainingDuration(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const RemainingDuration = this.states.RemainingDuration;
    //this.platform.log.debug('Get Characteristic InUse for', this.states.Name.toString(), '->', InUse.toString());

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return RemainingDuration;
  }

  async getName(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const Name = this.states.Name;
    //this.platform.log.debug('Get Characteristic Name ->', Name.toString());
    //this.platform.log.debug('Get Characteristic Name ->', Promise.toString());
    //this.platform.log.debug('Get Characteristic Name ->', this.service.getCharacteristic('Name'));
    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return this.accessory.displayName;
  }
}