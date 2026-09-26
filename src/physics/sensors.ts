// ThermoTwin Sensor Definitions & Information

import { SensorConfig } from './types';
import { SENSOR_POSITIONS } from './materials';

export const SENSORS: SensorConfig[] = [
  {
    id: 'T1',
    name: 'T1 (Hot End Sensor)',
    positionX: SENSOR_POSITIONS[0],
    type: 'rod',
    description: 'First thermocouple along metallic rod, nearest to electrical heater (5 cm from hot end).'
  },
  {
    id: 'T2',
    name: 'T2 (Rod Sensor)',
    positionX: SENSOR_POSITIONS[1],
    type: 'rod',
    description: 'Second thermocouple along metallic rod (10 cm from hot end).'
  },
  {
    id: 'T3',
    name: 'T3 (Rod Sensor)',
    positionX: SENSOR_POSITIONS[2],
    type: 'rod',
    description: 'Third thermocouple along metallic rod (15 cm from hot end).'
  },
  {
    id: 'T4',
    name: 'T4 (Midpoint Sensor)',
    positionX: SENSOR_POSITIONS[3],
    type: 'rod',
    description: 'Fourth thermocouple at rod midsection (20 cm from hot end).'
  },
  {
    id: 'T5',
    name: 'T5 (Rod Sensor)',
    positionX: SENSOR_POSITIONS[4],
    type: 'rod',
    description: 'Fifth thermocouple along metallic rod (25 cm from hot end).'
  },
  {
    id: 'T6',
    name: 'T6 (Rod Sensor)',
    positionX: SENSOR_POSITIONS[5],
    type: 'rod',
    description: 'Sixth thermocouple along metallic rod (30 cm from hot end).'
  },
  {
    id: 'T7',
    name: 'T7 (Cold End Sensor)',
    positionX: SENSOR_POSITIONS[6],
    type: 'rod',
    description: 'Seventh thermocouple along rod, closest to water cooling jacket (35 cm from hot end).'
  },
  {
    id: 'T8',
    name: 'T8 (Water Inlet)',
    positionX: 0.44,
    type: 'water_in',
    description: 'Thermocouple measuring incoming cooling water temperature at inlet manifold.'
  },
  {
    id: 'T9',
    name: 'T9 (Water Outlet)',
    positionX: 0.48,
    type: 'water_out',
    description: 'Thermocouple measuring outgoing cooling water temperature at outlet manifold.'
  }
];
