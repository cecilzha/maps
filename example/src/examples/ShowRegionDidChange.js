import React from 'react';
import {Text} from 'react-native';
import MapboxGL from '@react-native-mapbox/maps';

import sheet from '../styles/sheet';
import {DEFAULT_CENTER_COORDINATE, SF_OFFICE_COORDINATE} from '../utils';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';
import Bubble from './common/Bubble';

class ShowRegionDidChange extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      reason: '',
      cameraConfig: {
        centerCoordinate: DEFAULT_CENTER_COORDINATE,
        zoomLevel: 12,
      },
      regionFeature: undefined,
    };

    this._tabOptions = [
      {label: 'Fly To', data: SF_OFFICE_COORDINATE},
      {
        label: 'Fit Bounds',
        data: {ne: [-74.12641, 40.797968], sw: [-74.143727, 40.772177]},
      },
      {label: 'Zoom To', data: 16},
    ];

    this.onRegionDidChange = this.onRegionDidChange.bind(this);
    this.onRegionWillChange = this.onRegionWillChange.bind(this);
    this.onDidFinishLoadingMap = this.onDidFinishLoadingMap.bind(this);
    this.onOptionPress = this.onOptionPress.bind(this);
  }

  async onOptionPress(optionIndex, optionData) {
    if (optionIndex === 0) {
      this.setState({
        cameraConfig: {
          triggerKey: Date.now(),
          centerCoordinate: optionData,
          animationMode: MapboxGL.Camera.Mode.Flight,
          animationDuration: 2000,
        },
      });
    } else if (optionIndex === 1) {
      this.setState({
        cameraConfig: {
          triggerKey: Date.now(),
          bounds: optionData,
        },
      });
    } else if (optionIndex === 2) {
      this.setState({
        cameraConfig: {
          triggerKey: Date.now(),
          zoomLevel: optionData,
        },
      });
    }
  }

  async onDidFinishLoadingMap() {
    const visibleBounds = await this.map.getVisibleBounds();
    console.log('Visible Bounds', visibleBounds); // eslint-disable-line no-console
  }

  isValidCoordinate(geometry) {
    if (!geometry) {
      return false;
    }
    return geometry.coordinates[0] !== 0 && geometry.coordinates[1] !== 0;
  }

  onRegionWillChange(regionFeature) {
    this.setState({reason: 'will change', regionFeature});
  }

  onRegionDidChange(regionFeature) {
    this.setState({reason: 'did change', regionFeature});
  }

  renderRegionChange() {
    if (
      !this.state.regionFeature ||
      !this.isValidCoordinate(this.state.regionFeature.geometry)
    ) {
      return (
        <Bubble>
          <Text>Move the map!</Text>
        </Bubble>
      );
    }

    const {geometry, properties} = this.state.regionFeature;

    const neCoord = properties.visibleBounds[0]
      .map(n => n.toPrecision(6))
      .join(', ');
    const swCoord = properties.visibleBounds[1]
      .map(n => n.toPrecision(6))
      .join(', ');

    return (
      <Bubble style={{marginBottom: 100}}>
        <Text>{this.state.reason}</Text>
        <Text>Latitude: {geometry.coordinates[1]}</Text>
        <Text>Longitude: {geometry.coordinates[0]}</Text>
        <Text>Visible Bounds NE: {neCoord}</Text>
        <Text>Visible Bounds SW: {swCoord}</Text>
        <Text>Zoom Level: {properties.zoomLevel}</Text>
        <Text>Heading: {properties.heading}</Text>
        <Text>Pitch: {properties.pitch}</Text>
        <Text>
          Is User Interaction: {properties.isUserInteraction ? 'true' : 'false'}
        </Text>
        <Text>Animated: {properties.animated ? 'true' : 'false'}</Text>
      </Bubble>
    );
  }

  render() {
    return (
      <TabBarPage
        {...this.props}
        options={this._tabOptions}
        onOptionPress={this.onOptionPress}
      >
        <MapboxGL.MapView
          ref={c => (this.map = c)}
          style={sheet.matchParent}
          onDidFinishLoadingMap={this.onDidFinishLoadingMap}
          onRegionWillChange={this.onRegionWillChange}
          onRegionDidChange={this.onRegionDidChange}
        >
          <MapboxGL.Camera {...this.state.cameraConfig} />
        </MapboxGL.MapView>
        {this.renderRegionChange()}
      </TabBarPage>
    );
  }
}

export default ShowRegionDidChange;
