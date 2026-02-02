import type { ContactInfo } from '../types';

// Contact directory for AT resupply points
// Phone numbers, addresses, hours, and Google Maps links
export const resupplyContacts: ContactInfo[] = [
  // Georgia
  {
    resupplyId: 'rs-001', // Mountain Crossings at Neels Gap
    businesses: [
      {
        id: 'mc-001',
        name: 'Mountain Crossings',
        type: 'outfitter',
        phone: '(706) 745-6095',
        address: '12471 Gainesville Hwy, Blairsville, GA 30512',
        hours: 'Mon-Fri 9am-5pm, Sat-Sun 9am-6pm',
        website: 'https://mountaincrossings.com',
        googleMapsUrl: 'https://maps.google.com/?q=Mountain+Crossings+Blairsville+GA',
        notes: 'Full outfitter, pack shakedowns, hostel bunks available. Trail passes through building.',
        services: ['outfitter', 'hostel', 'resupply', 'showers', 'pack shakedown'],
      },
    ],
  },
  {
    resupplyId: 'rs-002', // Hiawassee, GA
    businesses: [
      {
        id: 'hia-001',
        name: 'Holiday Inn Express & Suites',
        type: 'lodging',
        phone: '(706) 896-8884',
        address: '300 Big Sky Dr, Hiawassee, GA 30546',
        hours: '24 hours (check-in 4pm)',
        website: 'https://ihg.com',
        googleMapsUrl: 'https://maps.google.com/?q=Holiday+Inn+Express+Hiawassee+GA',
        notes: 'Free breakfast, hiker friendly',
        pricing: '$100-150/night',
      },
      {
        id: 'hia-002',
        name: 'Ingles Market',
        type: 'grocery',
        phone: '(706) 896-4567',
        address: '970 N Main St, Hiawassee, GA 30546',
        hours: '6am-11pm daily',
        googleMapsUrl: 'https://maps.google.com/?q=Ingles+Market+Hiawassee+GA',
        notes: 'Full grocery with deli',
      },
    ],
  },
  // North Carolina
  {
    resupplyId: 'rs-003', // Franklin, NC
    businesses: [
      {
        id: 'fra-001',
        name: 'Outdoor 76',
        type: 'outfitter',
        phone: '(828) 349-7676',
        address: '35 E Main St, Franklin, NC 28734',
        hours: 'Mon-Sat 10am-6pm, Sun 12pm-5pm',
        website: 'https://outdoor76.com',
        googleMapsUrl: 'https://maps.google.com/?q=Outdoor+76+Franklin+NC',
        notes: 'Full service outfitter, gear rentals, expert staff',
        services: ['outfitter', 'gear rental', 'footwear fitting'],
      },
      {
        id: 'fra-002',
        name: 'Ingles Market',
        type: 'grocery',
        phone: '(828) 524-3435',
        address: '245 Westgate Plaza, Franklin, NC 28734',
        hours: '6am-11pm daily',
        googleMapsUrl: 'https://maps.google.com/?q=Ingles+Franklin+NC',
      },
      {
        id: 'fra-003',
        name: 'Franklin Post Office',
        type: 'post_office',
        phone: '(828) 524-3219',
        address: '66 W Main St, Franklin, NC 28734',
        hours: 'Mon-Fri 8:30am-5pm, Sat 9am-12pm',
        googleMapsUrl: 'https://maps.google.com/?q=Franklin+NC+Post+Office',
        notes: 'General delivery available',
      },
    ],
  },
  {
    resupplyId: 'rs-004', // Nantahala Outdoor Center
    businesses: [
      {
        id: 'noc-001',
        name: 'Nantahala Outdoor Center',
        type: 'outfitter',
        phone: '(828) 785-5082',
        address: '13077 Highway 19 W, Bryson City, NC 28713',
        hours: 'Mon-Thu 8am-6pm, Fri-Sat 8am-7pm',
        website: 'https://noc.com',
        googleMapsUrl: 'https://maps.google.com/?q=Nantahala+Outdoor+Center',
        notes: 'Trail passes through. Outfitter, restaurant, lodging on site.',
        services: ['outfitter', 'restaurant', 'lodging', 'rafting'],
      },
    ],
  },
  {
    resupplyId: 'rs-005', // Fontana Dam
    businesses: [
      {
        id: 'fon-001',
        name: 'Fontana Village Resort',
        type: 'lodging',
        phone: '(828) 498-2211',
        address: '300 Woods Rd, Fontana Dam, NC 28733',
        hours: 'Office: 8am-8pm',
        website: 'https://fontanavillage.com',
        googleMapsUrl: 'https://maps.google.com/?q=Fontana+Village+Resort',
        notes: 'General store, restaurant, lodging. Last resupply before Smokies.',
        services: ['lodging', 'general store', 'restaurant'],
      },
      {
        id: 'fon-002',
        name: 'Fontana Dam Post Office',
        type: 'post_office',
        phone: '(828) 498-2315',
        address: '35 Lost Mine Trail, Fontana Dam, NC 28733',
        hours: 'Mon-Fri 7:30am-11:30am, 12:30pm-4pm, Sat 9:30am-11:30am',
        googleMapsUrl: 'https://maps.google.com/?q=Fontana+Dam+Post+Office',
      },
    ],
  },
  // Tennessee
  {
    resupplyId: 'rs-007', // Standing Bear Farm
    businesses: [
      {
        id: 'sbf-001',
        name: 'Standing Bear Farm',
        type: 'hostel',
        phone: '(423) 487-0014',
        address: '4255 Green Corner Rd, Hartford, TN 37753',
        hours: 'Check-in until 9pm',
        website: 'https://standingbearfarm.com',
        googleMapsUrl: 'https://maps.google.com/?q=Standing+Bear+Farm+Hartford+TN',
        notes: 'Rustic hostel with resupply. First stop after Smokies NOBO.',
        pricing: 'Bunk $25, Camping $15',
        services: ['hostel', 'camping', 'resupply', 'showers', 'laundry'],
      },
    ],
  },
  {
    resupplyId: 'rs-008', // Hot Springs, NC
    businesses: [
      {
        id: 'hs-001',
        name: 'Bluff Mountain Outfitters',
        type: 'outfitter',
        phone: '(828) 622-7162',
        address: '88 Bridge St, Hot Springs, NC 28743',
        hours: 'Mon-Thu 9am-5pm, Fri-Sat 9am-6pm, Sun 9am-5pm',
        website: 'https://bluffmountain.com',
        googleMapsUrl: 'https://maps.google.com/?q=Bluff+Mountain+Outfitters+Hot+Springs+NC',
        notes: 'Full outfitter, shuttles, ATM available',
        services: ['outfitter', 'shuttle', 'ATM'],
      },
      {
        id: 'hs-002',
        name: 'Hot Springs Resort & Spa',
        type: 'lodging',
        phone: '(828) 622-7676',
        address: '315 Bridge St, Hot Springs, NC 28743',
        hours: '10am-10pm (spa)',
        website: 'https://nchotsprings.com',
        googleMapsUrl: 'https://maps.google.com/?q=Hot+Springs+Resort+Spa+NC',
        notes: 'Natural hot springs, massage, lodging',
        services: ['hot springs', 'massage', 'lodging', 'camping'],
      },
    ],
  },
  {
    resupplyId: 'rs-009', // Erwin, TN
    businesses: [
      {
        id: 'erw-001',
        name: "Uncle Johnny's Nolichucky Hostel",
        type: 'hostel',
        phone: '(423) 735-0548',
        address: '151 River Rd, Erwin, TN 37650',
        hours: '8am-8pm daily',
        website: 'https://unclejohnnys.net',
        googleMapsUrl: 'https://maps.google.com/?q=Uncle+Johnnys+Hostel+Erwin+TN',
        notes: 'Outfitter on site, shuttles to town, riverside location',
        pricing: 'Bunk $30, Cabin $60+',
        services: ['hostel', 'outfitter', 'shuttle', 'laundry', 'resupply'],
      },
      {
        id: 'erw-002',
        name: 'Food City',
        type: 'grocery',
        phone: '(423) 743-4016',
        address: '600 N Main Ave, Erwin, TN 37650',
        hours: '6am-11pm daily',
        googleMapsUrl: 'https://maps.google.com/?q=Food+City+Erwin+TN',
      },
    ],
  },
  // Virginia
  {
    resupplyId: 'rs-012', // Damascus, VA
    businesses: [
      {
        id: 'dam-001',
        name: 'Damascus Outfitters',
        type: 'outfitter',
        phone: '(276) 546-8411',
        address: '331 Douglas Dr, Damascus, VA 24236',
        hours: '7 days a week',
        website: 'https://damascusoutfitters.com',
        googleMapsUrl: 'https://maps.google.com/?q=Damascus+Outfitters+VA',
        notes: 'Full outfitter, hiker resupply, gear',
        services: ['outfitter', 'resupply', 'footwear'],
      },
      {
        id: 'dam-002',
        name: 'Mt Rogers Outfitters Hostel',
        type: 'hostel',
        phone: '(276) 475-5416',
        address: '110 Laurel Ave, Damascus, VA 24236',
        hours: 'Check-in by 9pm',
        googleMapsUrl: 'https://maps.google.com/?q=Mt+Rogers+Outfitters+Damascus+VA',
        notes: 'Bunks with mattress pads, private rooms for couples',
        pricing: 'Bunk $25, Private $50',
        services: ['hostel', 'outfitter', 'shuttle'],
      },
      {
        id: 'dam-003',
        name: 'The Place',
        type: 'hostel',
        phone: '(276) 475-3441',
        address: '201 E Laurel Ave, Damascus, VA 24236',
        hours: 'Check-in until dark',
        googleMapsUrl: 'https://maps.google.com/?q=The+Place+Hostel+Damascus+VA',
        notes: 'Oldest hostel on AT (est. 1975). Church-run, donation based.',
        pricing: 'Donation based ($7 suggested)',
        services: ['hostel', 'showers'],
      },
    ],
  },
  {
    resupplyId: 'rs-016', // Pearisburg, VA
    businesses: [
      {
        id: 'pea-001',
        name: 'Holy Family Church Hostel',
        type: 'hostel',
        phone: '(540) 921-3355',
        address: '174 Wenonah Ave, Pearisburg, VA 24134',
        hours: 'Apr-Oct, check-in by 8pm',
        googleMapsUrl: 'https://maps.google.com/?q=Holy+Family+Church+Pearisburg+VA',
        notes: 'Church basement hostel, donation based',
        pricing: 'Donation suggested',
        services: ['hostel', 'showers', 'kitchen'],
      },
      {
        id: 'pea-002',
        name: 'Food Lion',
        type: 'grocery',
        phone: '(540) 921-1105',
        address: '320 N Main St, Pearisburg, VA 24134',
        hours: '7am-11pm daily',
        googleMapsUrl: 'https://maps.google.com/?q=Food+Lion+Pearisburg+VA',
      },
    ],
  },
  {
    resupplyId: 'rs-018', // Daleville, VA
    businesses: [
      {
        id: 'dal-001',
        name: 'Kroger',
        type: 'grocery',
        phone: '(540) 992-3620',
        address: '120 Kroger Ctr, Daleville, VA 24083',
        hours: '6am-11pm daily',
        googleMapsUrl: 'https://maps.google.com/?q=Kroger+Daleville+VA',
        notes: 'Full grocery in plaza right off trail',
      },
      {
        id: 'dal-002',
        name: 'Three Li\'l Pigs BBQ',
        type: 'restaurant',
        phone: '(540) 966-3379',
        address: '198 Roanoke Rd, Daleville, VA 24083',
        hours: 'Wed-Sun 11am-8pm',
        googleMapsUrl: 'https://maps.google.com/?q=Three+Lil+Pigs+BBQ+Daleville+VA',
        notes: 'Popular with hikers, excellent BBQ',
      },
    ],
  },
  {
    resupplyId: 'rs-020', // Waynesboro, VA
    businesses: [
      {
        id: 'way-001',
        name: 'YMCA of Waynesboro',
        type: 'hostel',
        phone: '(540) 942-5107',
        address: '648 W Broad St, Waynesboro, VA 22980',
        hours: 'Mon-Fri 5:30am-9pm, Sat 8am-5pm',
        googleMapsUrl: 'https://maps.google.com/?q=YMCA+Waynesboro+VA',
        notes: 'Camping in back, showers for hikers',
        pricing: 'Camping $5, Shower $5',
        services: ['camping', 'showers', 'gym'],
      },
      {
        id: 'way-002',
        name: 'Kroger',
        type: 'grocery',
        phone: '(540) 942-1642',
        address: '1001 W Broad St, Waynesboro, VA 22980',
        hours: '6am-11pm daily',
        googleMapsUrl: 'https://maps.google.com/?q=Kroger+Waynesboro+VA',
      },
      {
        id: 'way-003',
        name: 'Ming Garden',
        type: 'restaurant',
        phone: '(540) 949-8988',
        address: '1457 E Main St, Waynesboro, VA 22980',
        hours: '11am-9:30pm daily',
        googleMapsUrl: 'https://maps.google.com/?q=Ming+Garden+Waynesboro+VA',
        notes: 'All-you-can-eat buffet, hiker favorite',
      },
    ],
  },
  // West Virginia
  {
    resupplyId: 'rs-022', // Harpers Ferry, WV
    businesses: [
      {
        id: 'hf-001',
        name: 'ATC Visitor Center',
        type: 'visitor_center',
        phone: '(304) 535-6331',
        address: '799 Washington St, Harpers Ferry, WV 25425',
        hours: 'Tue-Wed 10am-4pm, Thu-Mon 9am-5pm',
        website: 'https://appalachiantrail.org',
        googleMapsUrl: 'https://maps.google.com/?q=ATC+Headquarters+Harpers+Ferry',
        notes: 'Psychological halfway point! Get your photo taken.',
        services: ['visitor center', 'gift shop', 'thru-hiker photo'],
      },
      {
        id: 'hf-002',
        name: 'Town\'s Inn',
        type: 'lodging',
        phone: '(304) 932-0677',
        address: '179 High St, Harpers Ferry, WV 25425',
        hours: 'Check-in 4pm',
        website: 'https://townsinn.com',
        googleMapsUrl: 'https://maps.google.com/?q=Towns+Inn+Harpers+Ferry',
        notes: 'Historic inn, hiker friendly',
        pricing: '$80-150/night',
      },
    ],
  },
  // Pennsylvania
  {
    resupplyId: 'rs-025', // Pine Grove Furnace
    businesses: [
      {
        id: 'pgf-001',
        name: 'Pine Grove Furnace General Store',
        type: 'general_store',
        phone: '(717) 486-4920',
        address: '1100 Pine Grove Rd, Gardners, PA 17324',
        hours: 'Seasonal hours vary',
        googleMapsUrl: 'https://maps.google.com/?q=Pine+Grove+Furnace+State+Park',
        notes: 'Official AT Midpoint! Half-gallon ice cream challenge.',
        services: ['general store', 'ice cream'],
      },
      {
        id: 'pgf-002',
        name: "Ironmaster's Mansion Hostel",
        type: 'hostel',
        phone: '(717) 486-4108',
        address: '1212 Pine Grove Rd, Gardners, PA 17324',
        hours: 'Check-in 5-9pm',
        website: 'https://ironmastersmansion.org',
        googleMapsUrl: 'https://maps.google.com/?q=Ironmasters+Mansion+Pine+Grove+Furnace',
        notes: 'AYH hostel in historic building',
        pricing: 'Bunk $30-40',
        services: ['hostel', 'kitchen'],
      },
    ],
  },
  {
    resupplyId: 'rs-027', // Duncannon, PA
    businesses: [
      {
        id: 'dun-001',
        name: 'The Doyle Hotel',
        type: 'lodging',
        phone: '(717) 834-6789',
        address: '7 N Market St, Duncannon, PA 17020',
        hours: 'Bar opens at noon',
        googleMapsUrl: 'https://maps.google.com/?q=Doyle+Hotel+Duncannon+PA',
        notes: 'Iconic AT landmark. Rough but cheap. Historic.',
        pricing: '$25/night',
        services: ['lodging', 'bar', 'restaurant'],
      },
    ],
  },
  {
    resupplyId: 'rs-030', // Delaware Water Gap
    businesses: [
      {
        id: 'dwg-001',
        name: 'Edge of the Woods Outfitters',
        type: 'outfitter',
        phone: '(570) 421-6681',
        address: '110 Main St, Delaware Water Gap, PA 18327',
        hours: 'Mon-Sat 9am-6pm, Sun 10am-5pm',
        website: 'https://edgeofthewoodsoutfitters.com',
        googleMapsUrl: 'https://maps.google.com/?q=Edge+of+the+Woods+Outfitters',
        notes: 'Full outfitter with gear and resupply',
        services: ['outfitter', 'resupply'],
      },
      {
        id: 'dwg-002',
        name: 'Church of the Mountain Hostel',
        type: 'hostel',
        phone: '(570) 476-0345',
        address: 'Main St, Delaware Water Gap, PA 18327',
        hours: 'Apr-Oct, check-in until 9pm',
        googleMapsUrl: 'https://maps.google.com/?q=Church+of+the+Mountain+Delaware+Water+Gap',
        notes: 'Basement hostel in Presbyterian church',
        pricing: 'Donation based',
        services: ['hostel', 'showers'],
      },
    ],
  },
  // New Hampshire
  {
    resupplyId: 'rs-045', // Hanover, NH
    businesses: [
      {
        id: 'han-001',
        name: 'Co-op Food Store',
        type: 'grocery',
        phone: '(603) 643-2667',
        address: '45 S Park St, Hanover, NH 03755',
        hours: '7am-9pm daily',
        website: 'https://coopfoodstore.coop',
        googleMapsUrl: 'https://maps.google.com/?q=Co-op+Food+Store+Hanover+NH',
        notes: 'Excellent natural foods grocery',
      },
      {
        id: 'han-002',
        name: "Lou's Restaurant",
        type: 'restaurant',
        phone: '(603) 643-3321',
        address: '30 S Main St, Hanover, NH 03755',
        hours: '6am-3pm daily',
        googleMapsUrl: 'https://maps.google.com/?q=Lous+Restaurant+Hanover+NH',
        notes: 'Free muffin for thru-hikers!',
      },
    ],
  },
  {
    resupplyId: 'rs-047', // Lincoln/North Woodstock, NH
    businesses: [
      {
        id: 'lin-001',
        name: 'The Notch Hostel',
        type: 'hostel',
        phone: '(603) 348-1483',
        address: '324 Lost River Rd, Woodstock, NH 03262',
        hours: 'Open 24 hours',
        website: 'https://notchhostel.com',
        email: 'Serena@NotchHostel.com',
        googleMapsUrl: 'https://maps.google.com/?q=Notch+Hostel+Woodstock+NH',
        notes: '1890 farmhouse, before White Mountains',
        pricing: 'Starting at $35/night',
        services: ['hostel', 'kitchen', 'shuttle'],
      },
      {
        id: 'lin-002',
        name: 'Price Chopper',
        type: 'grocery',
        phone: '(603) 745-6604',
        address: '576 Main St, Lincoln, NH 03251',
        hours: '7am-9pm daily',
        googleMapsUrl: 'https://maps.google.com/?q=Price+Chopper+Lincoln+NH',
      },
    ],
  },
  {
    resupplyId: 'rs-050', // Gorham, NH
    businesses: [
      {
        id: 'gor-001',
        name: 'White Mountains Hostel & Lodge',
        type: 'hostel',
        phone: '(603) 466-9166',
        address: '356 Main St, Gorham, NH 03581',
        hours: 'Check-in until 9pm',
        googleMapsUrl: 'https://maps.google.com/?q=White+Mountains+Hostel+Gorham+NH',
        notes: 'Formerly Libby House. Great showers, kitchen.',
        pricing: 'Bunk $35, Private $75+',
        services: ['hostel', 'kitchen', 'laundry', 'shuttle'],
      },
      {
        id: 'gor-002',
        name: 'Walmart',
        type: 'grocery',
        phone: '(603) 752-4921',
        address: '568 Main St, Berlin, NH 03570',
        hours: '6am-11pm daily',
        googleMapsUrl: 'https://maps.google.com/?q=Walmart+Berlin+NH',
        notes: 'In Berlin, 8 miles from Gorham',
      },
    ],
  },
  // Maine
  {
    resupplyId: 'rs-055', // Monson, ME
    businesses: [
      {
        id: 'mon-001',
        name: "Shaw's Hiker Hostel",
        type: 'hostel',
        phone: '(207) 997-3597',
        address: '17 Pleasant St, Monson, ME 04464',
        email: 'shawshikerhostel@gmail.com',
        website: 'https://shawshikerhostel.com',
        googleMapsUrl: 'https://maps.google.com/?q=Shaws+Hiker+Hostel+Monson+ME',
        notes: 'CRITICAL: Last full hostel before 100 Mile Wilderness!',
        pricing: 'Bunk $25, Private $70, Breakfast $12',
        services: ['hostel', 'shuttle', 'resupply', 'laundry'],
      },
      {
        id: 'mon-002',
        name: 'Lakeshore House',
        type: 'hostel',
        phone: '(207) 997-7069',
        address: '9 Tenney Hill Rd, Monson, ME 04464',
        website: 'https://lakeshorehousemaine.com',
        googleMapsUrl: 'https://maps.google.com/?q=Lakeshore+House+Monson+ME',
        notes: 'Full service hostel with meals',
        pricing: 'Bunk $35, Private $75+',
        services: ['hostel', 'restaurant', 'shuttle'],
      },
    ],
  },
  {
    resupplyId: 'rs-056', // Abol Bridge
    businesses: [
      {
        id: 'abol-001',
        name: 'Abol Bridge Campground & Store',
        type: 'general_store',
        phone: '(207) 447-5803',
        address: 'Golden Rd, Millinocket, ME 04462',
        hours: 'Seasonal, 7am-8pm',
        googleMapsUrl: 'https://maps.google.com/?q=Abol+Bridge+Campground',
        notes: 'First resupply after 100 Mile Wilderness. Views of Katahdin!',
        services: ['general store', 'camping', 'restaurant'],
      },
    ],
  },
  {
    resupplyId: 'rs-057', // Millinocket, ME
    businesses: [
      {
        id: 'mil-001',
        name: 'Appalachian Trail Lodge',
        type: 'hostel',
        phone: '(207) 723-4321',
        address: '33 Penobscot Ave, Millinocket, ME 04462',
        website: 'https://appalachiantraillodge.com',
        googleMapsUrl: 'https://maps.google.com/?q=Appalachian+Trail+Lodge+Millinocket',
        notes: 'Northernmost hostel on AT. Shuttles to Baxter.',
        pricing: 'Bunk $35, Private $50-70',
        services: ['hostel', 'outfitter', 'shuttle', 'food drops'],
      },
      {
        id: 'mil-002',
        name: 'Hannaford Supermarket',
        type: 'grocery',
        phone: '(207) 723-5406',
        address: '843 Central St, Millinocket, ME 04462',
        hours: '7am-9pm daily',
        googleMapsUrl: 'https://maps.google.com/?q=Hannaford+Millinocket+ME',
        notes: 'Full grocery for celebration supplies!',
      },
      {
        id: 'mil-003',
        name: 'Appalachian Trail Cafe',
        type: 'restaurant',
        phone: '(207) 723-6720',
        address: '210 Penobscot Ave, Millinocket, ME 04462',
        hours: '5am-2pm daily',
        googleMapsUrl: 'https://maps.google.com/?q=Appalachian+Trail+Cafe+Millinocket',
        notes: 'Hiker favorite, big portions',
      },
    ],
  },
];

// Helper to get contacts by resupply ID
export function getContactsByResupplyId(resupplyId: string): ContactInfo | undefined {
  return resupplyContacts.find(c => c.resupplyId === resupplyId);
}

// Helper to check if a resupply point has contact info
export function hasContactInfo(resupplyId: string): boolean {
  return resupplyContacts.some(c => c.resupplyId === resupplyId);
}

// Export count
export const CONTACTS_COUNT = resupplyContacts.length;
