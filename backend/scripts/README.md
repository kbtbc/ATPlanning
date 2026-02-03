# AT Planning PDF Data Extraction Scripts

This directory contains Python scripts for extracting comprehensive waypoint and town data from the Appalachian Trail planning PDF.

## Setup

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Additional Requirements

- **Tesseract OCR**: Required for text extraction from images
  - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
  - Add to PATH: `C:\Program Files\Tesseract-OCR`
  - Mac: `brew install tesseract`
  - Linux: `sudo apt-get install tesseract-ocr`

## Scripts

### 1. `extract_pdf_data.py`
Main extraction script that processes the PDF using multiple approaches:
- PyMuPDF (fitz) for text and image extraction
- pdfplumber for structured data extraction
- Icon recognition for amenity detection

**Usage:**
```bash
python extract_pdf_data.py
```

**Output:**
- `backend/data/extracted/extracted_waypoints.json`
- `backend/data/extracted/extracted_towns.json`

### 2. `icon_recognizer.py`
Icon recognition system that:
- Extracts icon templates from Icon-Legend.png
- Matches icons in PDF pages to known amenities
- Maps icons to waypoint features

**Usage:**
```bash
python icon_recognizer.py
```

### 3. `compare_data.py`
Comparison tool that:
- Compares extracted data with existing TypeScript data files
- Generates detailed comparison report
- Identifies new waypoints, towns, and missing data

**Usage:**
```bash
python compare_data.py
```

**Output:**
- `backend/data/extracted/comparison_report.txt`

## Data Extraction Strategy

### Waypoint Extraction
1. **Vertical Route Listings**: Extract waypoints from elevation profile listings
2. **Icon Recognition**: Identify amenities using icon matching
3. **GPS Coordinates**: Parse coordinates in bracket notation `[lat, lon]`
4. **Distance Notation**: Parse parentheses for distances `(1.3W)`
5. **Capacity**: Parse braces for shelter capacity `{6}`

### Town Data Extraction
1. **Town Headers**: Identify towns with "(all major services)" markers
2. **Establishment Details**: Extract business names, hours, phone numbers
3. **GPS Coordinates**: Parse coordinates for each establishment
4. **Amenity Icons**: Identify services using icon legend
5. **Shuttle Services**: Extract shuttle provider information

## Data Format

### Waypoint JSON Structure
```json
{
  "id": "wp-0001",
  "name": "Springer Mountain Shelter",
  "mile": 0.2,
  "soboMile": 2197.2,
  "elevation": 3730,
  "lat": 34.6267,
  "lng": -84.1938,
  "state": "GA",
  "type": "shelter",
  "services": ["water", "privy", "tent_site"],
  "capacity": 12,
  "hasWater": true,
  "waterDistance": 0.1,
  "hasPrivy": true,
  "isTenting": true
}
```

### Town JSON Structure
```json
{
  "id": "town-0001",
  "name": "Franklin, NC",
  "mile": 109.4,
  "soboMile": 2088.0,
  "elevation": 2100,
  "lat": 35.1823,
  "lng": -83.3815,
  "state": "NC",
  "type": "town",
  "hasGrocery": true,
  "hasOutfitter": true,
  "hasPostOffice": true,
  "resupplyQuality": "full",
  "distanceFromTrail": 10.0,
  "businesses": [
    {
      "name": "Budget Inn",
      "type": "lodging",
      "phone": "828-524-4403",
      "address": "433 East Palmer Street, Franklin, NC 28734",
      "hours": "Open year round",
      "services": ["lodging", "wifi", "laundry"]
    }
  ]
}
```

## Icon Legend Reference

The `Icon-Legend.png` file contains all icons used in the PDF with their meanings:
- **Blue filled drop**: Reliable water source
- **Blue outline drop**: Seasonal water
- **House icon**: Shelter
- **Tent icon**: Tent camping
- **Green highlight**: Hostel
- **Blue highlight**: Post office
- **Yellow highlight**: Warning/important info
- **Pink highlight**: Trail reroute

## Troubleshooting

### PDF Not Opening
- Ensure PDF path is correct: `backend/data/WBP interactive PDF-V5E.pdf`
- Check file permissions

### Icon Recognition Issues
- Verify Icon-Legend.png exists in `backend/data/`
- Check OpenCV installation: `python -c "import cv2; print(cv2.__version__)"`

### Missing Dependencies
```bash
pip install --upgrade -r requirements.txt
```

### Tesseract Not Found
- Verify Tesseract installation
- Set TESSDATA_PREFIX environment variable if needed

## Next Steps

After extraction:
1. Review `comparison_report.txt` for data quality
2. Validate extracted JSON files
3. Import data into TypeScript files using merge script
4. Test in the web application
