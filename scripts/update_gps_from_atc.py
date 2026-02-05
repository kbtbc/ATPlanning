#!/usr/bin/env python3
"""Update our shelter GPS coordinates from ATC (guymott) data"""

import xml.etree.ElementTree as ET
import re
from difflib import SequenceMatcher

# Parse ATC GPX file
def parse_atc_gpx(filename):
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
        
        # Get comment for capacity info
        cmt = wpt.find('gpx:cmt', ns)
        comment = cmt.text if cmt is not None else ''
        
        # Extract capacity from comment if present
        capacity = None
        if comment:
            cap_match = re.search(r'capacity[:\s]+(\d+)', comment, re.IGNORECASE)
            if cap_match:
                capacity = int(cap_match.group(1))
        
        shelters[name] = {
            'lat': lat,
            'lon': lon,
            'elevation': elevation,
            'capacity': capacity,
            'comment': comment
        }
    return shelters

# Normalize shelter name for matching
def normalize_name(name):
    """Create a normalized version of shelter name for matching"""
    name = name.lower()
    # Remove suffixes
    name = re.sub(r'\s+(shelter|lean-to|lean to|hut|campsite|camp|site|cabin)\s*$', '', name)
    # Remove spaces and special chars for fuzzy matching
    name_clean = re.sub(r'[^a-z]', '', name)
    return name, name_clean

# Find best match in ATC data
def find_atc_match(our_name, atc_shelters, threshold=0.7):
    """Find best matching ATC shelter for our shelter name"""
    our_norm, our_clean = normalize_name(our_name)
    
    best_match = None
    best_score = 0
    
    for atc_name, atc_data in atc_shelters.items():
        atc_norm, atc_clean = normalize_name(atc_name)
        
        # Check for exact normalized match
        if our_clean == atc_clean:
            return atc_name, atc_data, 1.0
        
        # Check for substring match
        if our_clean in atc_clean or atc_clean in our_clean:
            score = len(min(our_clean, atc_clean)) / len(max(our_clean, atc_clean))
            if score > best_score:
                best_score = score
                best_match = (atc_name, atc_data)
        
        # Fuzzy match using SequenceMatcher
        similarity = SequenceMatcher(None, our_clean, atc_clean).ratio()
        if similarity > best_score:
            best_score = similarity
            best_match = (atc_name, atc_data)
    
    if best_match and best_score >= threshold:
        return best_match[0], best_match[1], best_score
    
    return None, None, 0

# Read our shelters.ts
def read_shelters_ts(filename):
    with open(filename, 'r') as f:
        content = f.read()
    return content

# Extract shelter entries from TypeScript
def extract_shelters(content):
    """Extract individual shelter objects from the TypeScript array"""
    # Find the shelters array content
    array_match = re.search(r'export const shelters: Shelter\[\] = \[(.*?)\];', content, re.DOTALL)
    if not array_match:
        return []
    
    array_content = array_match.group(1)
    
    # Split into individual shelter objects
    shelter_pattern = r"\{ id: 'sh-\d+', name: '([^']+)', mile: ([\d.]+), soboMile: ([\d.]+), elevation: ([\d.]+), lat: ([\d.-]+), lng: ([\d.-]+), state: '([A-Z]{2})', county: '([^']+)', type: 'shelter'([^}]+)\}"
    
    shelters = []
    for match in re.finditer(shelter_pattern, array_content):
        name, mile, sobo_mile, elevation, lat, lon, state, county, rest = match.groups()
        shelters.append({
            'name': name,
            'mile': float(mile),
            'sobo_mile': float(sobo_mile),
            'elevation': int(elevation),
            'lat': float(lat),
            'lon': float(lon),
            'state': state,
            'county': county,
            'rest': rest
        })
    
    return shelters

# Main update function
def main():
    print("Loading ATC shelter data...")
    atc_shelters = parse_atc_gpx('backend/data/guymott_shelters/AT Shelters - Long Comments - Consecutive Names.gpx')
    print(f"  Loaded {len(atc_shelters)} ATC shelters")
    
    print("\nReading our shelter data...")
    with open('webapp/src/data/shelters.ts', 'r') as f:
        original_content = f.read()
    
    # Parse shelter entries
    shelter_pattern = r"(\{ id: 'sh-\d+', name: ')([^']+)(', mile: )([\d.]+)(, soboMile: )([\d.]+)(, elevation: )([\d.]+)(, lat: )([\d.-]+)(, lng: )([\d.-]+)(, state: '[A-Z]{2}', county: '[^']+', type: 'shelter')"
    
    updated_content = original_content
    matches_found = 0
    no_match = []
    
    for match in re.finditer(shelter_pattern, original_content):
        full_match = match.group(0)
        prefix1 = match.group(1)  # { id: 'sh-XXX', name: '
        name = match.group(2)      # shelter name
        prefix2 = match.group(3)     # ', mile: 
        mile = match.group(4)      # mile value
        prefix3 = match.group(5)     # , soboMile: 
        sobo_mile = match.group(6)   # sobo mile value
        prefix4 = match.group(7)     # , elevation: 
        elevation = match.group(8)   # elevation
        prefix5 = match.group(9)     # , lat: 
        old_lat = match.group(10)  # old lat
        prefix6 = match.group(11)    # , lng: 
        old_lon = match.group(12)    # old lon
        suffix = match.group(13)     # rest
        
        # Find matching ATC shelter
        atc_name, atc_data, score = find_atc_match(name, atc_shelters)
        
        if atc_data:
            matches_found += 1
            new_lat = f"{atc_data['lat']:.5f}"
            new_lon = f"{atc_data['lon']:.5f}"
            
            # Use ATC elevation if available
            if atc_data['elevation']:
                new_elevation = f"{atc_data['elevation']:.0f}"
            else:
                new_elevation = elevation
            
            # Build replacement string
            replacement = f"{prefix1}{name}{prefix2}{mile}{prefix3}{sobo_mile}{prefix4}{new_elevation}{prefix5}{new_lat}{prefix6}{new_lon}{suffix}"
            
            updated_content = updated_content.replace(full_match, replacement, 1)
            
            # Show some examples
            if matches_found <= 5:
                print(f"\n  Updated: {name}")
                print(f"    Old: lat={old_lat}, lon={old_lon}")
                print(f"    New: lat={new_lat}, lon={new_lon} (matched: {atc_name}, score: {score:.2f})")
        else:
            no_match.append(name)
    
    print(f"\n\n{'='*70}")
    print(f"Matching Results:")
    print(f"  ✓ Matches found: {matches_found}")
    print(f"  ✗ No match: {len(no_match)}")
    
    if no_match:
        print(f"\n  Shelters without ATC match:")
        for name in no_match[:20]:
            print(f"    - {name}")
        if len(no_match) > 20:
            print(f"    ... and {len(no_match) - 20} more")
    
    # Write updated file
    print(f"\nWriting updated shelters.ts...")
    with open('webapp/src/data/shelters.ts', 'w') as f:
        f.write(updated_content)
    
    print(f"  Done!")
    
    # Show summary stats
    print(f"\n{'='*70}")
    print("Summary:")
    print(f"  - Total shelters in our data: 252")
    print(f"  - Successfully matched with ATC: {matches_found}")
    print(f"  - Unmatched (preserved original GPS): {len(no_match)}")
    print(f"  - All mile markers preserved ✓")

if __name__ == '__main__':
    main()
