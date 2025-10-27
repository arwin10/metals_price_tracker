# Weight Unit Filter Feature

## Overview
Added weight unit conversion filters to display precious metal prices in different units:
- **Troy Ounce** (oz) - Standard unit for precious metals
- **Kilogram** (1 kg)
- **10 Grams**
- **1 Gram**

## Changes Made

### 1. New Utility Module (`lib/weightConversions.ts`)
Created a centralized utility for weight conversions:
- Conversion factors based on troy ounce standard
- Unit labels (full and short versions)
- Helper functions for price conversion and label formatting

**Conversion Formulas:**
- 1 troy ounce = 31.1035 grams
- 1 kilogram = 32.1507 troy ounces
- 10 grams = 0.32151 troy ounces
- 1 gram = 0.032151 troy ounces

### 2. Updated Components

#### PriceCard Component (`components/PriceCard.tsx`)
- Added `unit` prop to accept weight unit selection
- Automatically converts prices based on selected unit
- Displays unit label below metal name
- Converts 24h change amount accordingly

#### Home Page (`app/page.tsx`)
- Added weight unit selector dropdown
- State management for selected unit
- Passes unit to PriceCard components
- Responsive layout for filters (currency + unit)

### 3. User Interface

**Filter Controls:**
- Currency selector: USD, EUR, GBP, INR
- Unit selector: Troy Ounce, Kilogram, 10 Grams, 1 Gram
- Both filters update all price cards simultaneously

**Price Display:**
Each metal card shows:
- Converted price for selected unit
- Unit label (e.g., "per Kilogram", "per Gram")
- Converted 24h change amount
- Change percentage (remains same)

## Example Price Conversions

If Gold is $2,000/oz:
- **Per Troy Ounce**: $2,000.00
- **Per Kilogram**: $64,301.40 (2000 × 32.1507)
- **Per 10 Grams**: $643.02 (2000 × 0.32151)
- **Per Gram**: $64.30 (2000 × 0.032151)

## Usage

1. Start the development server: `npm run dev`
2. Navigate to the home page
3. Select desired currency from the dropdown
4. Select desired weight unit from the unit dropdown
5. All prices update automatically to show values in selected unit

## Technical Notes

- All prices are stored in database as troy ounce values
- Conversion happens on the frontend for display
- No API changes required
- Maintains backward compatibility
- Type-safe with TypeScript enums
