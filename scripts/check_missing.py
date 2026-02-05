#!/usr/bin/env python3
"""Check missing shelters in tnlandforms and compare elevation data"""

import xml.etree.ElementTree as ET
import re
from difflib import SequenceMatcher

# Parse GPX file
def parse_gpx(filename):
    tree = ET.parse(filename)
    root = tree.getroot()
    ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
    
    shelters = {}
    for wpt in root.findall('.//gpx:wpt', ns):
        lat = float(wpt.get('lat'))
        lon = float(wpt.get('lon'))
        name_elem = wpt.find('gpx:name', ns)
        name = name_elem.text.strip() if name_elem is not None else 'Unknown'
        
        ele = wpt.find('gpx:ele', ns)
        elevation = float(ele.text) if ele is not None else None
        
        shelters[name] = {
            'lat': lat,
            'lon': lon,
            'elevation': elevation
        }
    return shelters

# Parse our shelters.ts
def parse_our_shelters(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    pattern = r"\{ id: 'sh-\d+', name: '([^']+)', mile: ([\d.]+), soboMile: ([\d.]+), elevation: (\d+), lat: ([\d.-]+), lng: ([\d.-]+)"
    
    shelters = {}
    for match in re.finditer(pattern, content):
        name, mile, sobo_mile, elevation, lat, lng = match.groups()
        shelters[name] = {
            'mile': float(mile),
            'elevation': int(elevation),
            'lat': float(lat),
            'lon': float(lng)
        }
    return shelters

# Normalize names
def normalize_name(name):
    name = name.lower()
    name = re.sub(r'\s+(shelter|lean-to|lean to|hut|campsite|camp|site|cabin)\s*$', '', name)
    name_clean = re.sub(r'[^a-z]', '', name)
    return name, name_clean

# Find match
def find_match(our_name, their_shelters, threshold=0.7):
    our_norm, our_clean = normalize_name(our_name)
    
    best_match = None
    best_score = 0
    
    for their_name, their_data in their_shelters.items():
        their_norm, their_clean = normalize_name(their_name)
        
        if our_clean == their_clean:
            return their_name, their_data, 1.0
        
        if our_clean in their_clean or their_clean in our_clean:
            score = len(min(our_clean, their_clean)) / len(max(our_clean, their_clean))
            if score > best_score:
                best_score = score
                best_match = (their_name, their_data)
        
        similarity = SequenceMatcher(None, our_clean, their_clean).ratio()
        if similarity > best_score:
            best_score = similarity
            best_match = (their_name, their_data)
    
    if best_match and best_score >= threshold:
        return best_match[0], best_match[1], best_score
    
    return None, None, 0

# The 24 shelters that weren't matched with ATC
missing_shelters = [
    "Wayah Shelter", "Birch Spring Gap Shelter", "Jerry Cabin Shelter",
    "Mountaineer Falls Shelter", "Johns Spring Shelter", "Raven Rock Shelter",
    "Birch Run Shelter", "Toms Run Shelter", "Backpacker Site (Camp Rd)",
    "Silver Hill Campsite", "Shaker Campsite", "Bromley Shelter",
    "Griffith Lake Tenting Area", "Churchill Scott Shelter", "Firewarden Cabin",
    "Liberty Springs Tentsite", "Guyot Shelter", "Ethan Pond Shelter",
    "Nauman Tentsite", "Osgood Tentsite", "Imp Shelter", "Trident Col Tentsite",
    "Gentian Pond Shelter", "Carlo Col Shelter"
]

def main():
    print("="*80)
    print("MISSING SHELTERS CHECK - tnlandforms.us")
    print("="*80)
    
    # Load data
    tn_shelters = parse_gpx('backend/data/tnlandforms_shelters.gpx')
    atc_shelters = parse_gpx('backend/data/guymott_shelters/AT Shelters - Long Comments - Consecutive Names.gpx')
    our_shelters = parse_our_shelters('webapp/src/data/shelters.ts')
    
    print(f"\nChecking {len(missing_shelters)} shelters not found in ATC data...\n")
    
    found_in_tn = []
    not_found = []
    
    for shelter_name in missing_shelters:
        tn_name, tn_data, tn_score = find_match(shelter_name, tn_shelters)
        atc_name, atc_data, atc_score = find_match(shelter_name, atc_shelters)
        our_data = our_shelters.get(shelter_name, {})
        
        if tn_data:
            found_in_tn.append({
                'name': shelter_name,
                'tn_name': tn_name,
                'tn_data': tn_data,
                'match_score': tn_score
            })
            print(f"✓ {shelter_name}")
            print(f"  tnlandforms: {tn_name}")
            print(f"  GPS: lat={tn_data['lat']:.5f}, lon={tn_data['lon']:.5f}")
            if tn_data['elevation']:
                print(f"  Elevation: {tn_data['elevation']:.0f}ft (ours: {our_data.get('elevation', 'N/A')}ft)")
            print()
        else:
            not_found.append(shelter_name)
            print(f"✗ {shelter_name} - Not found in tnlandforms either\n")
    
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Found in tnlandforms.us: {len(found_in_tn)}/{len(missing_shelters)}")
    print(f"Not found anywhere: {len(not_found)}")
    
    if not_found:
        print(f"\nTruly missing shelters:")
        for name in not_found:
            print(f"  - {name}")
    
    # Now check elevation for ALL shelters
    print(f"\n{'='*80}")
    print("ELEVATION COMPARISON - All Sources")
    print(f"{'='*80}\n")
    
    elevation_differences = []
    
    for our_name, our_data in our_shelters.items():
        tn_name, tn_data, _ = find_match(our_name, tn_shelters)
        atc_name, atc_data, _ = find_match(our_name, atc_shelters)
        
        sources = []
        if tn_data and tn_data['elevation']:
            sources.append(('tnlandforms', tn_data['elevation']))
        if atc_data and atc_data['elevation']:
            sources.append(('ATC', atc_data['elevation']))
        
        if sources:
            # Calculate average from sources
            avg_elevation = sum(e[1] for e in sources) / len(sources)
            our_elevation = our_data['elevation']
            
            diff = abs(our_elevation - avg_elevation)
            
            if diff > 100:  # More than 100ft difference
                elevation_differences.append({
                    'name': our_name,
                    'our_elev': our_elevation,
                    'sources': sources,
                    'diff': diff
                })
    
    # Sort by difference
    elevation_differences.sort(key=lambda x: x['diff'], reverse=True)
    
    print(f"Found {len(elevation_differences)} shelters with >100ft elevation difference:\n")
    
    for item in elevation_differences[:20]:  # Show top 20
        print(f"{item['name']}:")
        print(f"  Our elevation: {item['our_elev']}ft")
        for source_name, source_elev in item['sources']:
            print(f"  {source_name}: {source_elev:.0f}ft")
        print(f"  Difference: {item['diff']:.0f}ft")
        print()

if __name__ == '__main__':
    main()
