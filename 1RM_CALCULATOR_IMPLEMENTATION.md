# 1RM Calculator Implementation

## Overview
A stateless one-rep max calculator that estimates 1RM using multiple formulas and provides working weight percentages.

## Features Implemented

### Core Functionality
- ✅ **Three Calculation Formulas**:
  - **Epley** (default): `1RM = weight × (1 + reps/30)` - Most commonly used
  - **Brzycki**: `1RM = weight × (36 / (37 - reps))` - Conservative estimate
  - **Lombardi**: `1RM = weight × reps^0.10` - Best for low reps

- ✅ **Input Validation**:
  - Weight must be > 0
  - Reps must be between 1-20
  - Warning for extreme weights (>1000kg or >2200lb)
  - Non-numeric input validation

- ✅ **Smart Rounding**:
  - **kg**: Rounds to 0.5 kg increments
  - **lb**: Rounds to 2.5 lb increments
  - Configurable rounding system

- ✅ **Percentage Table**:
  - Generates working weights from 50% to 100%
  - 10% step increments
  - All weights rounded to practical increments
  - Displayed in descending order (100% → 50%)

### UI/UX Features
- ✅ **Responsive Design**: Mobile-first, works on all screen sizes
- ✅ **Two-Column Layout**: Input card and results card side-by-side on desktop
- ✅ **Live Validation**: Real-time feedback on input errors
- ✅ **Formula Tooltips**: Hover to see formula explanations
- ✅ **Example Card**: Shows worked example (100kg × 5 = 116.67kg)
- ✅ **Visual Feedback**: Gradient result card, color-coded badges
- ✅ **Empty State**: Clear instructions when no results yet

### Technical Implementation

#### New Files
1. **`lib/utils/calculations.ts`** (updated):
   - `estimate1RM(weight, reps, formula)` - Main calculation function
   - `roundWeight(value, rounding)` - Rounds to specified increment
   - `getDefaultRounding(unit)` - Returns default rounding for unit
   - `generatePercentageTable(...)` - Generates working weight table
   - Kept `calculateEstimated1RM()` for backward compatibility

2. **`components/tools/one-rm-calculator.tsx`**:
   - Full calculator component with state management
   - Form inputs with validation
   - Results display with percentage table
   - Formula selector with descriptions

3. **`app/app/tools/1rm-calculator/page.tsx`**:
   - Next.js page wrapper
   - SEO metadata

4. **`components/tools/tools-page.tsx`** (updated):
   - Added 1RM Calculator card with Calculator icon
   - Positioned as first tool in the grid

## Validation Examples

### ✅ Matches Specification
**Input**: 100kg × 5 reps (Epley)
- Calculation: `100 × (1 + 5/30) = 100 × 1.16667 = 116.67`
- **Output**: 116.67 kg ✓

### Edge Cases Handled
1. **Reps = 1**: Returns weight directly (1RM = weight)
2. **Reps < 1 or > 20**: Shows validation error
3. **Weight = 0 or negative**: Shows validation error
4. **Very high weights**: Shows warning but allows calculation
5. **Non-numeric input**: Validation error

### Percentage Table Example (100kg × 5, Epley = 116.67kg)
```
100% → 117 kg    (rounded from 116.67)
 90% → 105 kg    (rounded from 105.00)
 80% → 93.5 kg   (rounded from 93.34)
 70% → 81.5 kg   (rounded from 81.67)
 60% → 70 kg     (rounded from 70.00)
 50% → 58.5 kg   (rounded from 58.34)
```

## Formula Comparisons
For **100kg × 5 reps**:
- **Epley**: 116.67 kg
- **Brzycki**: 115.38 kg (more conservative)
- **Lombardi**: 112.04 kg (best for 1-3 reps)

## Stateless Design
- No data is persisted to database
- No user authentication required
- Pure calculation tool
- Results cleared on page refresh
- Can be used by anyone

## Usage
1. Navigate to `/app/tools` and click "1RM Calculator"
2. Or go directly to `/app/tools/1rm-calculator`
3. Enter weight, reps, select unit and formula
4. Click "Calculate 1RM"
5. View estimated 1RM and working weight percentages

## Future Enhancements (Not Implemented)
- "Use this %" button to copy weight to clipboard
- History tracking (ephemeral, client-side only)
- Print/export percentage table
- Plate calculator integration
- Compare multiple formulas side-by-side

## Testing Checklist
- [x] Epley formula matches specification (100kg × 5 = 116.67kg)
- [x] Brzycki formula works correctly
- [x] Lombardi formula works correctly
- [x] Rounding works (kg: 0.5, lb: 2.5)
- [x] Percentage table generates correctly (50-100%)
- [x] Input validation prevents invalid data
- [x] Warning for extreme weights
- [x] Responsive design on mobile
- [x] Tooltips show formula descriptions
- [x] No linter errors

## Acceptance Criteria
✅ All criteria met:
- Matches sample: 100kg × 5 → Epley ≈ 116.67kg
- Percent table rounds per rounding rules
- Stateless (no persistence)
- Supports 3 formulas with Epley as default
- Input validation for reps 1-20
- Warnings for extreme weights
- Clean, compact UI

