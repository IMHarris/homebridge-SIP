'use strict';

import * as mqtt from 'mqtt';

import {SIPHomebridgePlatform} from './platform';
import {CharacteristicValue, PlatformAccessory} from 'homebridge';
// const Utils = require('./utils.js').Utils;
// const fs = require('fs');

let plugin_name, topic_prefix, Characteristic;
// let addAccessory, addService, removeAccessory, removeService,
// let setValue, getAccessories, getCharacteristic, updateReachability, setAccessoryInformation;
let client;
// let set_timout, topic_type;

// module.exports = {
//   Model: Model
// }
//
// function Model(params) {
//
//   this.config = params.config;
//   this.log = params.log;
//   plugin_name = params.plugin_name;
//   Characteristic = params.Characteristic;
//
//   // addAccessory = params.addAccessory;
//   // addService = params.addService;
//   // removeAccessory = params.removeAccessory;
//   // removeService = params.removeService;
//   // setValue = params.setValue;
//   // getAccessories = params.getAccessories;
//   // getCharacteristic = params.getCharacteristic;
//   // updateReachability = params.updateReachability;
//   // setAccessoryInformation = params.setAccessoryInformation;
// }
// const platform = ExampleHomebridgePlatform;

export class MqttManager {
  //
  // const options = {};
  // // experimental
  // this.publish_options = {};
  platform : SIPHomebridgePlatform;
  client! : mqtt.MqttClient;
  options : object;
  url : string;
  topic_type : string;
  topic_prefix : string;
  publish_options : object;
  messageQueue: Array<{topic: string, payload: string}> = [];

  constructor (platform : SIPHomebridgePlatform) {
    this.platform = platform;
    this.url = platform.config.url;
    this.topic_type = platform.config.topic_type || 'multiple';
    this.topic_prefix = 'Homebridge-SIP'
    // this.topic_prefix = platform.config.topic_prefix || 'homebridge';
    this.options = {};
    this.options['username'] = platform.config.username || null;
    this.options['password'] = platform.config.password || null;
    this.options['port'] = platform.config.port || 1883;
    this.options['clientId'] = platform.config.client_id || 'homebridge-mqtt_' + Math.random().toString(16).substr(2, 8);
    this.platform.log.debug('clientId = %s', this.options['clientId']);
    this.publish_options = {retain: platform.config.retain || false, qos: platform.config.qos || 0};
    platform.log.debug('connecting to MQTT Client');
    this.start(this);
    //this.log.debug("connect options %s", JSON.stringify(this.publish_options));
    // todo: add key support

    // if(platform.config.cert !== null) {
    //   options['cert'] = fs.readFileSync(platform.config.cert);
    // }
    // if(platform.config.key !== null) {
    //   options['key'] = fs.readFileSync(platform.config.key);
    // }
    // if(platform.config.ca !== null) {
    //   options['ca'] = fs.readFileSync(platform.config.ca);
    // }
    // register handlers for the Active Characteristic
    //
    //options default values
    //options.protocolId = 'MQTT'; // 'MQIsdp';
    //options.protocolVersion = 4; // 3;
    //options.reconnectPeriod = 5000;
    //options.keepalive = 60;
    //options.clean = true;


  }
  //this.log.debug("connect options %s", JSON.stringify(this.publish_options));

  // if(this.config.cert !== null) {
  //   options['cert'] = fs.readFileSync(this.config.cert);
  // }
  // if(this.config.key !== null) {
  //   options['key'] = fs.readFileSync(this.config.key);
  // }
  // if(this.config.ca !== null) {
  //   options['ca'] = fs.readFileSync(this.config.ca);
  // }

  //options default values
  //options.protocolId = 'MQTT'; // 'MQIsdp';
  //options.protocolVersion = 4; // 3;
  //options.reconnectPeriod = 5000;
  //options.keepalive = 60;
  //options.clean = true;
  start(me : MqttManager) {
    this.platform.log.debug('Connecting..');
    this.client = mqtt.connect(this.url, this.options)
      .on('connect', me.onConnect.bind(this))
      .on('disconnect', me.onDisconnect.bind(this))
      .on('message', me.onMessage.bind(this))
      .on('error', me.onError.bind(this));
    // this.platform.log.debug('Connection request complete');
    // this.client = mqtt.connect(this.url, this.options);
  }

  publish(topic : string, payload : string) {
    this.platform.log.debug('Publish Requested');
    if (this.client.connected) {
      if (topic !== '') {
        topic = '/' + topic;
      }
      this.client.publish(this.topic_prefix + topic, payload, this.publish_options);
      this.platform.log.debug('payload sent. topic:', this.topic_prefix + topic, 'payload:', payload.toString());
    } else {
      this.platform.log.debug('Client disconnected unable to send payload:', payload.toString());
    }
  }

  publishWhenConnected(topic: string, payload: string) {
    this.platform.log.debug('Adding message to queue for when connected');
    // Add message to queue
    this.messageQueue.push({ topic, payload });

    // If already connected, publish immediately
    if (this.client && this.client.connected) {
      this.publish(topic, payload);
    }
  }

  async onConnect() {
    if (this.client.connected) {
      this.platform.log.debug('connected (url = %s)', this.url, 'as', this.options['username']);
      // const topic = 'Homebridge-SIP/#';
      this.client.subscribe('SIP-Homebridge/#');

      // Publish any queued messages
      if (this.messageQueue.length > 0) {
        this.platform.log.debug('Publishing queued messages');
        for (const message of this.messageQueue) {
          this.publish(message.topic, message.payload);
        }
        // Clear the queue after publishing
        this.messageQueue = [];
      }
    }

    // if (this.options['username']) {
    //   this.platform.log.debug('on.connect %s %s', this.options['username'], this.options['password']);

    // const topic = 'Homebridge-SIP/#';
    // this.client.subscribe(topic);
    // this.platform.log.debug('on.connect subscribe %s', topic);

    // const plugin_version = Utils.readPluginVersion();
    // const msg = plugin_name + ' v' + plugin_version + ' started';
    // this.platform.log.debug('on.connect %s', msg);

    // client.publish(topic_prefix + '/from/connected', 'Hello from SIP', this.publish_options);
  }

  async onDisconnect() {
    this.platform.log.debug('Disconnecting:', client.error, ':', client.statusMessage);
  }

  async onError(error) {
    this.platform.log.debug('MQTT Error %s', error);
  }

  async onMessage(topic, buffer) {
    //this.platform.log.debug('Message Receivedx!', buffer.toString());
    this.platform.log.debug('MQTT message received from SIP');
    await this.platform.mqttIntakeMsg(buffer.toString(), topic);
  }
  // Returns a reference to the EventEmitter, so that calls can be chained.
  //   By default, event listeners are invoked in the order they are added.
  //   Theemitter.prependListener() method can be used as an alternative to add the event listener to the beginning of the listeners array.
  //   const myEE = new EventEmitter();
  // myEE.on('foo', () => console.log('a'));
  // myEE.prependListener('foo', () => console.log('b'));
  // myEE.emit('foo');
  // // Prints:
  // //   b
  // //   a
  // todo client.end();
  // note: the plugig doesn't get the signal, because homebridge/lib/cli.js catchs the signal first.

  /*
    const signals = { 'SIGINT': 2, 'SIGTERM': 15 };
    Object.keys(signals).forEach(function (signal) {
      process.on(signal, function () {
        this.log("Got %s, closing mqtt-client...", signal);
        client.end();
      }.bind(this));
    }.bind(this));
  */

  //   // If disconnected, attempt reconnection every 5 seconds
  //   const timeout = setTimeout(() => {
  //     if (!client.connected) {
  //       this.platform.log.error('mqtt connect error! (url = %s)', this.url);
  //     }
  //   }, 5000);
  //
  //
  //
  //   client.on('message', (topic, buffer) => {
  //
  //     const payload = buffer.toString();
  //     let message = '';
  //     let isValid = false;
  //     // const message, accessory;
  //     const result;
  //
  //     if (typeof topic === 'undefined' || payload.length === 0) {
  //       message = 'topic or payload invalid';
  //       this.log.debug('on.message %s', message);
  //       this.sendAck(false, message, 0, 'hello_ack');
  //     } else {
  //
  //       //this.log.debug("on.message topic %s payload %s", topic, payload);
  //
  //       try {
  //         const accessory = JSON.parse(payload);
  //
  //         if (typeof accessory.request_id === 'undefined') {
  //           //this.log("added request_id=0");
  //           accessory.request_id = 0;
  //         } else {
  //           //this.log("request_id %s", accessory.request_id);
  //         }
  //
  //         if (typeof accessory.subtype !== 'undefined') {
  //           message = 'Please replace \'subtype\' by \'service_name\'';
  //           this.log.debug('on.message %s', message);
  //           this.sendAck(false, message, accessory.request_id);
  //           isValid = false;
  //         } else {
  //           isValid = true;
  //         }
  //       } catch(e) {
  //         message = 'invalid JSON format';
  //         this.log.debug('on.message %s (%s)', message, e.message);
  //         this.sendAck(false, message, 0, 'hello_ack');
  //         isValid = false;
  //       }
  //
  //       if (isValid) {
  //         switch (topic) {
  //           case topic_prefix + '/to/add':
  //           case topic_prefix + '/to/add/accessory':
  //             // this.log.debug('on.message add \n%s', JSON.stringify(accessory, null, 2));
  //             // result = addAccessory(accessory);
  //             // this.handle(result, accessory.name, accessory.request_id);
  //             break;
  //
  //           case topic_prefix + '/to/add/service':
  //           case topic_prefix + '/to/add/services':
  //             // this.log.debug("on.message add/service \n%s", JSON.stringify(accessory, null, 2));
  //             // result = addService(accessory);
  //             // this.handle(result, accessory.name, accessory.request_id);
  //             break;
  //
  //           case topic_prefix + '/to/set/reachability':
  //           case topic_prefix + '/to/set/reachable':
  //             // if (typeof accessory.reachable === 'boolean') {
  //             //   result = updateReachability(accessory);
  //             //   this.handle(result, accessory.name, accessory.request_id);
  //             // } else {
  //             //   message = "accessory '" + accessory.name + "' reachable not boolean.";
  //             //   this.log.warn("on.message %s", message);
  //             //   this.sendAck(false, message, accessory.request_id);
  //             // }
  //             break;
  //
  //           case topic_prefix + '/to/set/accessoryinformation':
  //           case topic_prefix + '/to/set/information':
  //             // result = setAccessoryInformation(accessory);
  //             // this.handle(result, accessory.name, accessory.request_id);
  //             break;
  //
  //           case topic_prefix + '/to/remove':
  //           case topic_prefix + '/to/remove/accessory':
  //             // result = removeAccessory(accessory.name);
  //             // this.handle(result, accessory.name, accessory.request_id);
  //             break;
  //
  //           case topic_prefix + '/to/remove/service':
  //             // result = removeService(accessory);
  //             // this.handle(result, accessory.name, accessory.request_id);
  //             break;
  //
  //           case topic_prefix + '/to/set':
  //             // result = setValue(accessory);
  //             // if (!result.ack) {
  //             //   this.handle(result, accessory.name, accessory.request_id);
  //             // }
  //             break;
  //
  //           case topic_prefix + '/to/get':
  //             // result = getAccessories(accessory);
  //             // if (result.ack) {
  //             //   this.sendAccessories(result.accessories, accessory.name, accessory.request_id);
  //             // } else {
  //             //   this.handle(result, accessory.name, accessory.request_id);
  //             // }
  //             break;
  //
  //           case topic_prefix + '/to/get/characteristic':
  //             // this.log("/to/get/characteristic: %s", JSON.stringify(accessory));
  //             // result = getCharacteristic(accessory);
  //             // if (result.ack) {
  //             //   this.sendCharacteristic(result.characteristic, accessory.name, accessory.request_id);
  //             // } else {
  //             //   this.handle(result, accessory.name, accessory.request_id);
  //             // }
  //             break;
  //
  //           default:
  //             // message = 'topic \'' + topic + '\' unknown.';
  //             // this.log.warn('on.message default %s', message);
  //             // this.sendAck(false, message, accessory.request_id);
  //         }
  //       }
  //     }
  //   });
  //
  //   client.on('close', () => {
  //     this.log.warn('on.close <to analyze>');
  //     // todo
  //     //this.log("mqtt-client closed, shutting down Homebridge...");
  //     //process.exit();
  //   });
  //
  //   client.on('error', (error) => {
  //     this.log.error('on.error %s', error);
  //   });
  //
  //   client.on('reconnect', () => {
  //     this.log.warn('on.reconnect <to analyze>');
  //   });
  //
  //
  //   client.on('offline', () => {
  //     this.log.warn('on.offline <to analyze>');
  //   });
  //
  // };
  //
  // Model.prototype.get = function(name, service_name, service_type, c, value, callback) {
  //
  //   //this.log.debug("get '%s' '%s' '%s' '%s'", name, service_name, c, value);
  //   const msg = {"name": name, "service_name": service_name, "service_type": service_type, "characteristic": c, "cachedValue": value};
  //   const topic = this.buildTopic('/from/get', name);
  //   client.publish(topic, JSON.stringify(msg), this.publish_options);
  //   // callback(null, null);  // not used
  // }
  //
  // Model.prototype.set = function(name, service_name, service_type, c, value, callback) {
  //
  //   //this.log.debug("set '%s' '%s' '%s' %s", name, service_name, c, value);
  //   const msg = {"name": name, "service_name": service_name, "service_type": service_type, "characteristic": c, "value": value};
  //   const topic = this.buildTopic('/from/set', name);
  //   client.publish(topic, JSON.stringify(msg), this.publish_options);
  //   callback();
  // }
  //
  // Model.prototype.identify = function (name, manufacturer, model, serialnumber, firmwarerevision) {
  //
  //   const msg = {
  //   "name": name, "manufacturer": manufacturer, "model": model, "serialnumber": serialnumber, "firmwarerevision": firmwarerevision};
  //   //this.log.debug("identify %s", JSON.stringify(msg));
  //   const topic = this.buildTopic('/from/identify', name);
  //   client.publish(topic, JSON.stringify(msg), this.publish_options);
  // }
  //
  // Model.prototype.sendAccessories = function (accessories, name, request_id) {
  //
  //   const msg = accessories;
  //   msg.request_id = request_id;
  //   this.log.debug("sendAccessories \n%s", JSON.stringify(msg, null, 2));
  //   const topic = this.buildTopic('/from/response', name);
  //   client.publish(topic, JSON.stringify(msg), this.publish_options);
  // }
  //
  // Model.prototype.sendCharacteristic = function (characteristic, name, request_id) {
  //
  //   const msg = characteristic;
  //   msg.request_id = request_id;
  //   this.log.debug("sendCharacteristic \n%s", JSON.stringify(msg, null, 2));
  //   const topic = this.buildTopic('/from/response', name);
  //   client.publish(topic, JSON.stringify(msg), this.publish_options);
  // }
  //
  // Model.prototype.handle = function (result, name, request_id) {
  //
  //   this.sendAck(result.ack, result.message, request_id, name);
  //   this.log("%s %s, %s [%s]", result.topic, result.ack, result.message, request_id);
  // }
  //
  // Model.prototype.sendAck = function (ack, message, request_id, name) {
  //
  //   const msg = {"ack": ack, "message": message, "request_id": request_id};
  //   //this.log.debug("sendAck %s", JSON.stringify(msg));
  //   const topic = this.buildTopic('/from/response', name);
  //   client.publish(topic, JSON.stringify(msg), this.publish_options);
  // }
  //
  // Model.prototype.buildTopic = function(topic_section, name) {
  //   const topic;
  //   if (topic_type == "single") {
  //     topic = topic_prefix + topic_section + '/' + name;
  //   } else {
  //     topic = topic_prefix + topic_section;
  //   }
  //   this.log.debug("buildTopic %s", topic);
  //   return (topic);
}
