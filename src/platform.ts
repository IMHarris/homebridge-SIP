import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { SIPIrrigationSystemAccessory, SIPValveSystemAccessory } from './platformAccessory';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class ExampleHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  // holds the uuids of all the discovered devices
  private discoveredUuid : string[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      log.debug('Hello world!1');
      // run the method to discover / register your devices as accessories
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    // TODO Start here!!!
    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  addAccessory(device: string[], type: string) {

    const uuid = this.api.hap.uuid.generate(device['UniqueID']);
    // save uuid for all discovered devices
    this.discoveredUuid.push(uuid);
    // see if an accessory with the same uuid has already been registered and restored from
    // the cached devices we stored in the `configureAccessory` method above
    const currentAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
    if (currentAccessory) {
      // the accessory already exists
      this.log.info('Restoring existing accessory from cache:', currentAccessory.displayName);
      if (type === 'IrrigationSystem') {
        // create the accessory handler for the restored accessory
        const systemAccessory = new SIPIrrigationSystemAccessory(this, currentAccessory);
        systemAccessory.setActive(device['Active']);
        systemAccessory.setInUse(device['InUse']);
        systemAccessory.setProgramMode(device['ProgramMode']);
      } else if (type === 'Valve') {
        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        const systemAccessory = new SIPValveSystemAccessory(this, currentAccessory);
        systemAccessory.setActive(device['Active']);
        systemAccessory.setInUse(device['InUse']);
        systemAccessory.setValveType(device['ValveType']);
        systemAccessory.setName(device['Name']);
      } else {
        this.log.debug(type, 'is not recognized and will not be added to the platform.');
      }
    } else {
      // the accessory does not exist and needs to be created
      this.log.info('Adding new accessory:', device['DisplayName']);

      // create a new accessory
      const accessory = new this.api.platformAccessory(device['DisplayName'], uuid);

      // create the accessory handler for the newly create accessory
      // this is imported from `platformAccessory.ts`
      if (type === 'IrrigationSystem'){
        const systemAccessory = new SIPIrrigationSystemAccessory(this, accessory);
        systemAccessory.setActive(device['Active']);
        systemAccessory.setInUse(device['InUse']);
        systemAccessory.setProgramMode(device['ProgramMode']);
      } else if (type === 'Valve') {
        const systemAccessory = new SIPValveSystemAccessory(this, accessory);
        systemAccessory.setActive(device['Active']);
        systemAccessory.setInUse(device['InUse']);
        systemAccessory.setValveType(device['ValveType']);
        systemAccessory.setName(device['Name']);
      }

      // store a copy of the device object in the `accessory.context`
      // the `context` property can be used to store any data about the accessory you may need
      accessory.context.device = device;

      // link the accessory to the hombebridge platform
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  discoverDevices() {

    // EXAMPLE ONLY
    // A real plugin you would discover accessories from the local network, cloud services
    // or a user-defined array in the platform config.
    // TODO: This is where accessories are discovered.  For now, Lists take the place of discovered device

    // Find the irrigation systems.  This would be in a loop
    const IrrigationSystems : object[] = [];
    let found ={};

    found = {};
    found['DisplayName'] = 'SIP Kazoo2';
    found['UniqueID'] = found['DisplayName'].concat('irrigation');
    found['Active'] = 1;
    found['ProgramMode'] = 0;
    found['InUse'] = 1;

    // Find valves associated with the Irrigation System.  this would be in a sub-loop.
    let valves : object[] = [];
    valves = [];
    let vfound = {};
    vfound['Name'] = 'Potss';
    vfound['UniqueID'] = vfound['Name'].concat('valve', 'SIP Kazoo');
    vfound['Active'] = 1;
    vfound['InUse'] = 0;
    vfound['ValveType'] = 1;
    valves.push(vfound);

    vfound = {};
    vfound['Name'] = 'Perennialss';
    vfound['UniqueID'] = vfound['Name'].concat('valve', 'SIP Kazoo');
    vfound['Active'] = 1;
    vfound['InUse'] = 0;
    vfound['ValveType'] = 1;
    valves.push(vfound);

    found['Valves'] = valves;
    IrrigationSystems.push(found);
    console.log('Valves found:', valves);
    console.log('Irrigation System:', IrrigationSystems);

    // Here is how you remove a registered accessory
    // const uuid = this.api.hap.uuid.generate('ABCD');
    // const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
    // this.log.debug('Foundit', existingAccessory.displayName);
    // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
    // loop over the discovered devices and register each one if it has not already been registered

    //const discoveredUuid : string[] = [];
    for (const device of IrrigationSystems) {

      // generate a unique id for the accessory this should be generated from
      // something globally unique, but constant, for example, the device serial
      // number or MAC address

      const uuid = this.api.hap.uuid.generate(device['UniqueID']);
      this.discoveredUuid.push(uuid);
      //this.log.debug('uuid', device['DisplayName'], device['UniqueID'], uuid);

      // see if an accessory with the same uuid has already been registered and restored from
      // the cached devices we stored in the `configureAccessory` method above
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        // the accessory already exists
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        // existingAccessory.context.device = device;
        // this.api.updatePlatformAccessories([existingAccessory]);

        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        const x = new SIPIrrigationSystemAccessory(this, existingAccessory);
        x.setActive(device['Active']);
        x.setInUse(device['InUse']);
        x.setProgramMode(device['ProgramMode']);

        // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
        // remove platform accessories when no longer present
        // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
        // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
      } else {
        // the accessory does not yet exist, so we need to create it
        this.log.info('Adding new accessory:', device['DisplayName']);

        // create a new accessory
        const accessory = new this.api.platformAccessory(device['DisplayName'], uuid);

        // store a copy of the device object in the `accessory.context`
        // the `context` property can be used to store any data about the accessory you may need
        accessory.context.device = device;

        // create the accessory handler for the newly create accessory
        // this is imported from `platformAccessory.ts`
        const x = new SIPIrrigationSystemAccessory(this, accessory);
        x.setActive(device['Active']);
        x.setInUse(device['InUse']);
        x.setProgramMode(device['ProgramMode']);

        // link the accessory to your platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
    // Loop through loaded accessories and check them against what has been discovered
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
    });
  }
}
