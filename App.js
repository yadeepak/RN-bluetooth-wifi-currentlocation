import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  PermissionsAndroid,
  Dimensions,
  Button,
  SafeAreaView,
} from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import {BleManager} from 'react-native-ble-plx';
import GetLocation from 'react-native-get-location';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

const window = Dimensions.get('window');

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      scanning: false,
      bluetoothData: [],
      appState: '',
    };
    this.manager = new BleManager();
  }
  getwifi = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location permission is required for WiFi connections',
          message:
            'This app needs location permission as this is required  ' +
            'to scan for wifi networks.',
          buttonNegative: 'DENY',
          buttonPositive: 'ALLOW',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        WifiManager.loadWifiList().then((data) => console.log(data));
      } else {
        alert('denied');
      }
    } catch (e) {
      console.log(e);
    }
  };
  startScan = async () => {
    const bleState = await this.manager.state();
    if (bleState !== 'PoweredOn') {
      await this.manager.enable();
    }
    let deviceIds = [];
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        this.manager.stopDeviceScan();

        // Handle error (scanning will be stopped automatically)
        return;
      }
      const checkIdExists = deviceIds.find((v) => v.id === device.id);
      if (checkIdExists) {
        this.manager.stopDeviceScan();
      }
      deviceIds.push({
        id: device.id,
        name: device.name,
        localName: device.localName,
      });
      console.log(device.id, device.name, device.localName);
      // Check if it is a device you are looking for based on advertisement data
      // or other criteria.
      if (!device.id) {
        // Stop scanning as it's not necessary if you are scanning for one device.
        this.manager.stopDeviceScan();

        // Proceed with connection.
      }
    });
    this.setState({bluetoothData: deviceIds});
  };
  getloc = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then((location) => {
        console.log(location);
      })
      .catch((error) => {
        const {code, message} = error;
        console.warn(code, message);
      });
  };
  componentDidMount = async () => {
    await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
      interval: 10000,
      fastInterval: 5000,
    });
  };
  render() {
    const btnScanTitle = 'Scan Bluetooth ';

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <View style={{margin: 10}}>
            <Button title={btnScanTitle} onPress={() => this.startScan()} />
          </View>
          <Button title="get wifi list" onPress={() => this.getwifi()} />
          <View style={{margin: 10}}></View>
          <Button title="get location" onPress={() => this.getloc()} />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    width: window.width,
    height: window.height,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    margin: 10,
  },
  row: {
    margin: 10,
  },
});
