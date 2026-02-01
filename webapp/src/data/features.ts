import { Waypoint } from '../types';

// Notable features and landmarks along the AT
export const features: Waypoint[] = [
  // Trail Termini
  { id: 'ft-001', name: 'Springer Mountain (Southern Terminus)', mile: 0, soboMile: 2197.4, elevation: 3782, lat: 34.6267, lng: -84.1938, state: 'GA', type: 'feature', notes: 'Southern terminus of the AT. Bronze plaque marks the start.' },
  { id: 'ft-002', name: 'Mt. Katahdin (Northern Terminus)', mile: 2197.4, soboMile: 0, elevation: 5269, lat: 45.9044, lng: -68.9214, state: 'ME', type: 'feature', notes: 'Northern terminus. Baxter Peak summit. The greatest mountain.' },

  // Georgia Features
  { id: 'ft-003', name: 'Amicalola Falls', mile: -8.5, soboMile: 2205.9, elevation: 1700, lat: 34.5611, lng: -84.2481, state: 'GA', type: 'feature', notes: 'Approach trail start. 729-foot waterfall - tallest in Southeast.' },
  { id: 'ft-004', name: 'Blood Mountain', mile: 28.8, soboMile: 2168.6, elevation: 4458, lat: 34.7400, lng: -83.9367, state: 'GA', type: 'feature', notes: 'Highest point on AT in Georgia. Historic stone shelter.' },

  // North Carolina Features
  { id: 'ft-005', name: 'Standing Indian Mountain', mile: 84.5, soboMile: 2112.9, elevation: 5499, lat: 35.0556, lng: -83.5506, state: 'NC', type: 'feature', notes: 'Highest point on the AT south of the Smokies.' },
  { id: 'ft-006', name: 'Wayah Bald', mile: 116.3, soboMile: 2081.1, elevation: 5342, lat: 35.2186, lng: -83.5647, state: 'NC', type: 'feature', notes: 'Historic stone tower with 360-degree views.' },
  { id: 'ft-007', name: 'Cheoah Bald', mile: 151.5, soboMile: 2045.9, elevation: 5062, lat: 35.4167, lng: -83.8000, state: 'NC', type: 'feature', notes: 'Excellent views. Scene from movie Fugitive.' },

  // Great Smoky Mountains
  { id: 'ft-008', name: 'Fontana Dam', mile: 164.7, soboMile: 2032.7, elevation: 1700, lat: 35.4439, lng: -83.8072, state: 'NC', type: 'feature', notes: 'Tallest dam in Eastern US (480 ft). Entrance to Smokies.' },
  { id: 'ft-009', name: 'Clingmans Dome', mile: 200.0, soboMile: 1997.4, elevation: 6643, lat: 35.5628, lng: -83.4985, state: 'TN', type: 'feature', notes: 'Highest point on the AT. Observation tower.' },
  { id: 'ft-010', name: 'Newfound Gap', mile: 207.7, soboMile: 1989.7, elevation: 5046, lat: 35.6108, lng: -83.4253, state: 'TN', type: 'feature', notes: 'Major road crossing. Shuttle access to Gatlinburg.' },
  { id: 'ft-011', name: 'Charlie\'s Bunion', mile: 209.7, soboMile: 1987.7, elevation: 5375, lat: 35.6297, lng: -83.4008, state: 'TN', type: 'feature', notes: 'Famous rock outcrop with spectacular views.' },

  // Tennessee/North Carolina Highlands
  { id: 'ft-012', name: 'Max Patch', mile: 249.8, soboMile: 1947.6, elevation: 4629, lat: 35.7972, lng: -82.9569, state: 'NC', type: 'feature', notes: 'Iconic bald with 360-degree views. Popular camping spot.' },
  { id: 'ft-013', name: 'Roan Mountain', mile: 352.4, soboMile: 1845.0, elevation: 6285, lat: 36.1028, lng: -82.1100, state: 'TN', type: 'feature', notes: 'Famous for rhododendron gardens. One of highest balds.' },
  { id: 'ft-014', name: 'Roan Highlands', mile: 354.0, soboMile: 1843.4, elevation: 5500, lat: 36.1167, lng: -82.0833, state: 'TN', type: 'feature', notes: 'Stunning open balds stretch for miles.' },

  // Virginia Features
  { id: 'ft-015', name: 'Grayson Highlands', mile: 489.0, soboMile: 1708.4, elevation: 5089, lat: 36.6333, lng: -81.5167, state: 'VA', type: 'feature', notes: 'Wild ponies! Beautiful alpine-like terrain.' },
  { id: 'ft-016', name: 'Mt. Rogers (Side Trail)', mile: 497.5, soboMile: 1699.9, elevation: 5729, lat: 36.6597, lng: -81.5447, state: 'VA', type: 'feature', notes: 'Highest point in Virginia. 0.5 mile side trail.' },
  { id: 'ft-017', name: 'McAfee Knob', mile: 707.0, soboMile: 1490.4, elevation: 3197, lat: 37.3925, lng: -80.0367, state: 'VA', type: 'feature', notes: 'Most photographed spot on AT. Iconic rock ledge.' },
  { id: 'ft-018', name: 'Dragons Tooth', mile: 699.5, soboMile: 1497.9, elevation: 3020, lat: 37.3722, lng: -80.1608, state: 'VA', type: 'feature', notes: 'Dramatic rock spire. Part of Triple Crown with McAfee and Tinker.' },
  { id: 'ft-019', name: 'Tinker Cliffs', mile: 715.0, soboMile: 1482.4, elevation: 3000, lat: 37.4367, lng: -79.8833, state: 'VA', type: 'feature', notes: 'Mile of cliff-edge walking. Part of Virginia Triple Crown.' },
  { id: 'ft-020', name: 'The Priest', mile: 840.7, soboMile: 1356.7, elevation: 4063, lat: 37.8314, lng: -79.0192, state: 'VA', type: 'feature', notes: 'Major climb. Religious Mountains section.' },
  { id: 'ft-021', name: 'Shenandoah National Park (South)', mile: 886.0, soboMile: 1311.4, elevation: 2900, lat: 38.1833, lng: -78.8500, state: 'VA', type: 'feature', notes: 'Southern entrance to SNP. 105 miles through park.' },
  { id: 'ft-022', name: 'Shenandoah National Park (North)', mile: 991.0, soboMile: 1206.4, elevation: 1800, lat: 38.8833, lng: -78.0667, state: 'VA', type: 'feature', notes: 'Northern boundary of SNP at Front Royal.' },

  // Maryland/West Virginia
  { id: 'ft-023', name: 'Harpers Ferry', mile: 1026.0, soboMile: 1171.4, elevation: 310, lat: 39.3256, lng: -77.7297, state: 'WV', type: 'feature', notes: 'ATC Headquarters. Psychological halfway point. Historic town.' },
  { id: 'ft-024', name: 'Maryland Heights', mile: 1023.0, soboMile: 1174.4, elevation: 1448, lat: 39.3500, lng: -77.7333, state: 'MD', type: 'feature', notes: 'Overlook of Harpers Ferry and Potomac/Shenandoah confluence.' },

  // Pennsylvania
  { id: 'ft-025', name: 'AT Midpoint', mile: 1105.0, soboMile: 1092.4, elevation: 850, lat: 40.0333, lng: -77.3000, state: 'PA', type: 'feature', notes: 'Official halfway point at Pine Grove Furnace. Half-gallon challenge!' },
  { id: 'ft-026', name: 'Lehigh Gap', mile: 1253.0, soboMile: 944.4, elevation: 380, lat: 40.7861, lng: -75.6028, state: 'PA', type: 'feature', notes: 'Dramatic river gap. Steep rocky climb. Superfund restoration.' },

  // New Jersey/New York
  { id: 'ft-027', name: 'High Point State Park', mile: 1306.0, soboMile: 891.4, elevation: 1803, lat: 41.3206, lng: -74.6614, state: 'NJ', type: 'feature', notes: 'Highest point in New Jersey. Monument tower.' },
  { id: 'ft-028', name: 'Bear Mountain', mile: 1380.4, soboMile: 817.0, elevation: 1284, lat: 41.3117, lng: -73.9889, state: 'NY', type: 'feature', notes: 'Lowest point on AT (124 ft at Hudson River). Perkins Memorial Tower.' },
  { id: 'ft-029', name: 'Hudson River', mile: 1380.0, soboMile: 817.4, elevation: 124, lat: 41.3167, lng: -73.9833, state: 'NY', type: 'feature', notes: 'Lowest elevation on the entire AT. Cross on Bear Mountain Bridge.' },

  // Connecticut/Massachusetts
  { id: 'ft-030', name: 'Lions Head', mile: 1492.0, soboMile: 705.4, elevation: 1738, lat: 42.0167, lng: -73.4500, state: 'CT', type: 'feature', notes: 'Views across Salisbury. Distinctive profile.' },
  { id: 'ft-031', name: 'Mt. Greylock', mile: 1569.0, soboMile: 628.4, elevation: 3491, lat: 42.6375, lng: -73.1661, state: 'MA', type: 'feature', notes: 'Highest point in Massachusetts. War memorial tower. Bascom Lodge.' },

  // Vermont
  { id: 'ft-032', name: 'Stratton Mountain', mile: 1636.0, soboMile: 561.4, elevation: 3936, lat: 43.0833, lng: -72.9167, state: 'VT', type: 'feature', notes: 'Fire tower. Where Benton MacKaye conceived the AT idea.' },
  { id: 'ft-033', name: 'Killington Peak', mile: 1717.5, soboMile: 479.9, elevation: 4235, lat: 43.6044, lng: -72.8200, state: 'VT', type: 'feature', notes: 'Second highest peak in Vermont. Side trail to summit.' },

  // New Hampshire (White Mountains)
  { id: 'ft-034', name: 'Mt. Moosilauke', mile: 1820.0, soboMile: 377.4, elevation: 4802, lat: 44.0244, lng: -71.8311, state: 'NH', type: 'feature', notes: 'Gateway to the Whites. Above treeline. DOC cabin at summit.' },
  { id: 'ft-035', name: 'Franconia Ridge', mile: 1840.0, soboMile: 357.4, elevation: 5089, lat: 44.1433, lng: -71.6444, state: 'NH', type: 'feature', notes: 'Most spectacular ridge walk on AT. Little Haystack to Lafayette.' },
  { id: 'ft-036', name: 'Mt. Lincoln', mile: 1842.0, soboMile: 355.4, elevation: 5089, lat: 44.1486, lng: -71.6447, state: 'NH', type: 'feature', notes: 'Part of Franconia Ridge traverse.' },
  { id: 'ft-037', name: 'Mt. Lafayette', mile: 1843.5, soboMile: 353.9, elevation: 5260, lat: 44.1606, lng: -71.6444, state: 'NH', type: 'feature', notes: 'Highest peak on Franconia Ridge.' },
  { id: 'ft-038', name: 'Mt. Washington', mile: 1877.0, soboMile: 320.4, elevation: 6288, lat: 44.2706, lng: -71.3033, state: 'NH', type: 'feature', notes: 'Highest peak in Northeast. Notorious weather. Summit house.' },
  { id: 'ft-039', name: 'Presidential Range', mile: 1877.0, soboMile: 320.4, elevation: 6000, lat: 44.2706, lng: -71.3033, state: 'NH', type: 'feature', notes: '23 miles above treeline. Most exposed terrain on AT.' },
  { id: 'ft-040', name: 'Wildcat Mountain', mile: 1905.0, soboMile: 292.4, elevation: 4422, lat: 44.2597, lng: -71.2017, state: 'NH', type: 'feature', notes: 'Ski area. Great views of Presidential Range and Carter Notch.' },

  // Maine
  { id: 'ft-041', name: 'Mahoosuc Notch', mile: 1941.0, soboMile: 256.4, elevation: 2150, lat: 44.4833, lng: -70.9667, state: 'ME', type: 'feature', notes: 'Hardest mile on the AT. Boulder cave scrambling. Ice in summer.' },
  { id: 'ft-042', name: 'Mahoosuc Arm', mile: 1942.5, soboMile: 254.9, elevation: 3765, lat: 44.5000, lng: -70.9500, state: 'ME', type: 'feature', notes: 'Brutal 1,500 ft climb out of Mahoosuc Notch.' },
  { id: 'ft-043', name: 'Old Speck Mountain', mile: 1948.0, soboMile: 249.4, elevation: 4170, lat: 44.5000, lng: -70.9500, state: 'ME', type: 'feature', notes: 'Third highest peak in Maine. Fire tower.' },
  { id: 'ft-044', name: 'Baldpate Mountain', mile: 1965.0, soboMile: 232.4, elevation: 3812, lat: 44.5833, lng: -70.9167, state: 'ME', type: 'feature', notes: 'Open summit with excellent views.' },
  { id: 'ft-045', name: 'Saddleback Mountain', mile: 2010.0, soboMile: 187.4, elevation: 4120, lat: 44.9367, lng: -70.5050, state: 'ME', type: 'feature', notes: 'Above treeline ridge walk. Horn visible ahead.' },
  { id: 'ft-046', name: 'Bigelow Range', mile: 2040.0, soboMile: 157.4, elevation: 4145, lat: 45.1167, lng: -70.2500, state: 'ME', type: 'feature', notes: 'West Peak and Avery Peak. Impressive above-treeline traverse.' },
  { id: 'ft-047', name: '100 Mile Wilderness (South)', mile: 2079.0, soboMile: 118.4, elevation: 950, lat: 45.3000, lng: -69.4833, state: 'ME', type: 'feature', notes: 'Start of the most remote section. No road crossings for 100 miles.' },
  { id: 'ft-048', name: 'White Cap Mountain', mile: 2135.0, soboMile: 62.4, elevation: 3654, lat: 45.4500, lng: -69.3333, state: 'ME', type: 'feature', notes: 'Last 360-degree view before Katahdin. 100 Mile Wilderness.' },
  { id: 'ft-049', name: '100 Mile Wilderness (North)', mile: 2179.0, soboMile: 18.4, elevation: 600, lat: 45.8167, lng: -68.9833, state: 'ME', type: 'feature', notes: 'End of wilderness at Abol Bridge. First Katahdin views.' },
  { id: 'ft-050', name: 'Baxter State Park Entrance', mile: 2186.0, soboMile: 11.4, elevation: 1100, lat: 45.8833, lng: -69.0000, state: 'ME', type: 'feature', notes: 'Katahdin Stream Campground. Final night for most NOBOs.' },
];

// Export feature count
export const FEATURE_COUNT = features.length;
