import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
  CharacteristicValue,
} from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { SIPIrrigationSystemAccessory, SIPValveSystemAccessory } from './platformAccessory';
import {MqttManager} from './mqttObjs';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class SIPHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];
  public readonly SIPIrrAccessories: SIPIrrigationSystemAccessory[] = [];
  public readonly SIPValveAccessories: SIPValveSystemAccessory[] = [];
  // holds the uuids of all the discovered devices
  private discoveredUuid : string[] = [];
  private _mqttMsg = '';

  // manages connection to the SIP mqtt broker
  mqttMgr : MqttManager;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);
    this.mqttMgr = new MqttManager(this);

    // Use publishWhenConnected instead of publish to ensure the message is sent after connection is established
    this.mqttMgr.publishWhenConnected('common', 'Hello from Homebridge');

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      log.debug('Hello world!1000');
      // run the method to discover / register your devices as accessories
      //this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to set up event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  addAccessory(device: object, type: string) {
    // This function adds discovered devices to homebridge
    const uuid = this.api.hap.uuid.generate(device['UniqueID']);
    // save uuid for all discovered devices
    this.discoveredUuid.push(uuid);
    // see if an accessory with the same uuid has already been registered in this.accessories object
    // if it has been registered, then update the characteristics
    // if not, register it.
    const currentAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
    if (currentAccessory) {
      // the accessory already exists in Homebridge.  Just need to update the characteristics
      this.log.info('Restoring existing accessory from cache:', currentAccessory.displayName);
      //Pass the JSON for the device to the accessory.  This will serve to initialize the properties
      currentAccessory.context.device = device;
      if (type === 'IrrigationSystem') {
        // create the accessory handler for the restored accessory
        const systemAccessory = new SIPIrrigationSystemAccessory(this, currentAccessory);
        this.SIPIrrAccessories.push(systemAccessory);
      } else if (type === 'Valve') {
        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        const systemAccessory = new SIPValveSystemAccessory(this, currentAccessory);
        this.SIPValveAccessories.push(systemAccessory);
      } else {
        this.log.debug(type, 'is not a recognized type and will not be added to the platform.');
      }
    } else {
      // the accessory does not exist and needs to be created
      const accessoryName = device['Name'];
      const accessory = new this.api.platformAccessory(accessoryName, uuid);
      // store a copy of the device object in the `accessory.context`
      accessory.context.device = device;
      if (type === 'IrrigationSystem'){
        this.log.debug('Irrigation system name: ', device['Name']);
        const systemAccessory = new SIPIrrigationSystemAccessory(this, accessory);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        this.SIPIrrAccessories.push(systemAccessory);
      } else if (type === 'Valve') {
        const systemAccessory = new SIPValveSystemAccessory(this, accessory);
        // link the accessory to the homebridge platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        this.SIPValveAccessories.push(systemAccessory);
      }
      this.log.info('Added new accessory:', accessoryName);
    }
  }

  discoverDevices(SIPInfo : string) {
    // Find the irrigation systems.  This would be in a loop
    // This is data that has been packaged up from the SIP addin telling homebridge
    // About the accessories it's managing
    const IrrigationSystem = JSON.parse(SIPInfo);
    IrrigationSystem['UniqueID'] = IrrigationSystem['Name'].concat('IrrSys');
    this.addAccessory(IrrigationSystem, 'IrrigationSystem' );
    this.log.debug('Name: ', IrrigationSystem['Name']);
    const valves = IrrigationSystem['valves'];
    if (valves) {
      // loop over the discovered devices and register each one if it has not already been registered
      for (const valve in valves) {
        valves[valve]['UniqueID'] = valves[valve]['Name'].concat(IrrigationSystem['Name'], 'Valve');
        this.addAccessory(valves[valve], 'Valve');
      }
    }

    // Loop through loaded accessories and check them against what has been discovered
    // If not discovered, they need to be removed.
    const deleteUuid : string[] = [];
    this.log.debug('Iterating through loaded accessories.')
    this.log.debug('Number of loaded accessories before deletion:', this.accessories.length, PLATFORM_NAME);
    for (const accessory of this.accessories) {
      this.log.debug('Found loaded in homebridge, will delete:', accessory.displayName, accessory._associatedPlatform);
      // If there are accessories loaded, but not discovered, we will remove them from Homebridge
      this.log.debug('stored accessory UUID', accessory.UUID);
      if (this.discoveredUuid.find(accuuid => accuuid === accessory.UUID) === undefined) {
        this.log.debug('Loaded accessory not discovered to be removed:', accessory.displayName);
        deleteUuid.push(accessory.UUID);
      }
    }
    deleteUuid.forEach((uuid) => {
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
      if (existingAccessory) {
        this.log.debug('unregistering:', existingAccessory.displayName);
        const index = this.accessories.indexOf(existingAccessory);
        this.accessories.splice(index, 1);

        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
      }
    });

    /*
    // loop over the discovered devices.  Look for valves and send them to be registered
    for (const device of IrrigationSystems) {
      this.addAccessory(device, 'IrrigationSystem' );
      const valves = device['Valves'];
      if (valves) {
        for (const valve of valves) {
          this.addAccessory(valve, 'Valve');
        }
      }
    }*/
    this.log.debug('Number of loaded accessories after deletion:', this.accessories.length, PLATFORM_NAME);
    this.log.debug('Iterating through loaded accessories. Done.');

    // This looks like duplicate code
    /*// Loop through loaded accessories and check them against what has been discovered
    // If not discovered, they need to be removed.
    const deleteUuid : string[] = [];
    for (const accessory of this.accessories) {
      this.log.debug('Found loaded in homebridge:', accessory.displayName);
      // If there are accessories loaded, but not discovered, we will remove them from Homebridge
      this.log.debug('stored accessory UUID', accessory.UUID);
      if (this.discoveredUuid.find(accuuid => accuuid === accessory.UUID) === undefined) {
        this.log.debug('Loaded accessory not discovered to be removed:', accessory.displayName);
        deleteUuid.push(accessory.UUID);
      }
    }
    deleteUuid.forEach((uuid) => {
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
      if (existingAccessory) {
        this.log.debug('unregistering:', existingAccessory.displayName);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
      }
    });*/
  }

  //user-defined properties
  async mqttIntakeMsg(value: string, topic: string) {
    // Incoming message from SIP via MQTT
    this.log.debug('Dude, mqtt message received from SIP. topic:', topic, ', value:', value);
    switch (topic) {
      case 'SIP-Homebridge/valves':
        //this._mqttMsg = value;
        this.discoverDevices(value);
        break;
      default:
        this.log.debug('Irrigation platform object received an unrecognized topic:', topic);
        break;
    }
  }
}
