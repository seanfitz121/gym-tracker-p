/**
 * Plate Calculator Utilities
 * Calculates per-side plate breakdown for barbell loading
 */

export interface PlateInventoryItem {
  value: number // Plate weight
  count: number // TOTAL plates available (not per-side)
}

export interface PlateCalculatorInput {
  targetTotal: number
  barWeight: number
  plateInventory: PlateInventoryItem[]
  roundingTolerance?: number // 0 for exact, or amount in weight units
  preference?: 'exact' | 'fewest_plates' | 'largest_plates_first'
}

export interface PlateCalculatorResult {
  success: boolean
  perSidePlates: number[] // Ordered outer → inner
  achievedTotal: number
  delta: number // achievedTotal - targetTotal
  shortfallReason?: string
}

export interface PlateCalculatorOutput {
  result: PlateCalculatorResult
  alternatives: PlateCalculatorResult[]
}

/**
 * Calculate plate breakdown for a barbell
 */
export function calculatePlateLoading(input: PlateCalculatorInput): PlateCalculatorOutput {
  const {
    targetTotal,
    barWeight,
    plateInventory,
    roundingTolerance = 0,
    preference = 'largest_plates_first'
  } = input

  // Validation
  if (targetTotal <= barWeight) {
    return {
      result: {
        success: false,
        perSidePlates: [],
        achievedTotal: barWeight,
        delta: barWeight - targetTotal,
        shortfallReason: 'Target weight must be greater than bar weight'
      },
      alternatives: []
    }
  }

  if (!plateInventory || plateInventory.length === 0) {
    return {
      result: {
        success: false,
        perSidePlates: [],
        achievedTotal: barWeight,
        delta: barWeight - targetTotal,
        shortfallReason: 'No plates available in inventory'
      },
      alternatives: []
    }
  }

  // Calculate needed weight per side
  const neededPerSide = (targetTotal - barWeight) / 2

  if (neededPerSide <= 0) {
    return {
      result: {
        success: false,
        perSidePlates: [],
        achievedTotal: barWeight,
        delta: barWeight - targetTotal,
        shortfallReason: 'Target weight equals or is less than bar weight'
      },
      alternatives: []
    }
  }

  // Convert inventory to per-side counts
  const perSideInventory = plateInventory
    .map(plate => ({
      value: plate.value,
      countPerSide: Math.floor(plate.count / 2)
    }))
    .filter(plate => plate.countPerSide > 0)
    .sort((a, b) => b.value - a.value) // Sort descending by weight

  // Try to find exact match or closest
  const exactMatch = findPlateCombo(neededPerSide, perSideInventory, 0, preference)

  if (exactMatch.success) {
    return {
      result: exactMatch,
      alternatives: []
    }
  }

  // If exact match not found, try with tolerance
  if (roundingTolerance > 0) {
    const tolerantMatch = findPlateCombo(neededPerSide, perSideInventory, roundingTolerance, preference)
    
    if (tolerantMatch.success || Math.abs(tolerantMatch.delta) <= roundingTolerance) {
      return {
        result: tolerantMatch,
        alternatives: []
      }
    }
  }

  // Generate alternatives
  const alternatives = generateAlternatives(neededPerSide, perSideInventory, barWeight, preference)
  
  // Return best alternative as result
  return {
    result: alternatives[0] || exactMatch,
    alternatives: alternatives.slice(1, 5) // Top 4 alternatives
  }
}

/**
 * Find plate combination using greedy algorithm with backtracking
 */
function findPlateCombo(
  target: number,
  inventory: Array<{ value: number; countPerSide: number }>,
  tolerance: number,
  preference: string
): PlateCalculatorResult {
  // Try greedy approach first (largest plates first)
  const greedyResult = greedyPlateSelection(target, inventory, tolerance)
  
  if (greedyResult.success) {
    return greedyResult
  }

  // If greedy fails and we want fewest plates, try backtracking
  if (preference === 'fewest_plates') {
    const backtrackResult = backtrackPlateSelection(target, inventory, tolerance)
    if (backtrackResult.success) {
      return backtrackResult
    }
  }

  return greedyResult // Return best attempt
}

/**
 * Greedy plate selection (largest first)
 */
function greedyPlateSelection(
  target: number,
  inventory: Array<{ value: number; countPerSide: number }>,
  tolerance: number
): PlateCalculatorResult {
  const plates: number[] = []
  let remaining = target
  const inventoryCopy = inventory.map(p => ({ ...p }))

  for (const plate of inventoryCopy) {
    while (plate.countPerSide > 0 && remaining >= plate.value - tolerance) {
      plates.push(plate.value)
      remaining -= plate.value
      plate.countPerSide--
      
      if (Math.abs(remaining) <= tolerance) {
        break
      }
    }
    
    if (Math.abs(remaining) <= tolerance) {
      break
    }
  }

  const achievedPerSide = plates.reduce((sum, p) => sum + p, 0)
  const achievedTotal = inventoryCopy[0]?.value ? (achievedPerSide * 2) : 0 // Will be corrected by caller
  const delta = achievedPerSide - target

  return {
    success: Math.abs(delta) <= tolerance,
    perSidePlates: plates,
    achievedTotal: 0, // Will be set by caller
    delta: delta,
    shortfallReason: Math.abs(delta) > tolerance ? `Cannot reach exact weight (off by ${delta.toFixed(2)})` : undefined
  }
}

/**
 * Backtracking plate selection for optimal solutions
 */
function backtrackPlateSelection(
  target: number,
  inventory: Array<{ value: number; countPerSide: number }>,
  tolerance: number
): PlateCalculatorResult {
  let bestCombo: number[] = []
  let bestDelta = Infinity

  function backtrack(
    index: number,
    current: number[],
    remaining: number,
    availableCounts: number[]
  ) {
    // Check if current solution is better
    const delta = Math.abs(target - current.reduce((s, p) => s + p, 0))
    
    if (delta < Math.abs(bestDelta)) {
      bestDelta = target - current.reduce((s, p) => s + p, 0)
      bestCombo = [...current]
    }

    if (delta <= tolerance) {
      return true // Found acceptable solution
    }

    // Prune if we've exceeded target by too much
    if (remaining < -tolerance) {
      return false
    }

    // Try each plate type
    for (let i = index; i < inventory.length; i++) {
      if (availableCounts[i] > 0 && inventory[i].value <= remaining + tolerance) {
        current.push(inventory[i].value)
        availableCounts[i]--
        
        if (backtrack(i, current, remaining - inventory[i].value, availableCounts)) {
          return true
        }
        
        current.pop()
        availableCounts[i]++
      }
    }

    return false
  }

  const counts = inventory.map(p => p.countPerSide)
  backtrack(0, [], target, counts)

  const achievedPerSide = bestCombo.reduce((sum, p) => sum + p, 0)

  return {
    success: Math.abs(bestDelta) <= tolerance,
    perSidePlates: bestCombo,
    achievedTotal: 0, // Set by caller
    delta: bestDelta,
    shortfallReason: Math.abs(bestDelta) > tolerance ? `Cannot reach exact weight (off by ${bestDelta.toFixed(2)})` : undefined
  }
}

/**
 * Generate alternative plate combinations
 */
function generateAlternatives(
  target: number,
  inventory: Array<{ value: number; countPerSide: number }>,
  barWeight: number,
  preference: string
): PlateCalculatorResult[] {
  const alternatives: PlateCalculatorResult[] = []
  const smallestPlate = inventory[inventory.length - 1]?.value || 1

  // Try targets slightly above and below
  for (let offset = smallestPlate; offset <= smallestPlate * 4; offset += smallestPlate) {
    // Try lighter
    const lighter = greedyPlateSelection(target - offset, inventory, 0)
    if (lighter.perSidePlates.length > 0) {
      const achievedPerSide = lighter.perSidePlates.reduce((s, p) => s + p, 0)
      alternatives.push({
        ...lighter,
        achievedTotal: barWeight + achievedPerSide * 2,
        delta: barWeight + achievedPerSide * 2 - (barWeight + target * 2)
      })
    }

    // Try heavier
    const heavier = greedyPlateSelection(target + offset, inventory, 0)
    if (heavier.perSidePlates.length > 0) {
      const achievedPerSide = heavier.perSidePlates.reduce((s, p) => s + p, 0)
      alternatives.push({
        ...heavier,
        achievedTotal: barWeight + achievedPerSide * 2,
        delta: barWeight + achievedPerSide * 2 - (barWeight + target * 2)
      })
    }
  }

  // Sort by absolute delta
  alternatives.sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta))

  // Remove duplicates and set achieved totals
  const seen = new Set<string>()
  return alternatives
    .filter(alt => {
      const key = alt.perSidePlates.join(',')
      if (seen.has(key)) return false
      seen.add(key)
      
      const achievedPerSide = alt.perSidePlates.reduce((s, p) => s + p, 0)
      alt.achievedTotal = barWeight + achievedPerSide * 2
      alt.delta = alt.achievedTotal - (barWeight + target * 2)
      alt.success = Math.abs(alt.delta) < 0.01
      
      return true
    })
    .slice(0, 5)
}

/**
 * Standard plate inventory presets
 */
export const PLATE_PRESETS = {
  kg_standard: [
    { value: 25, count: 4 },
    { value: 20, count: 4 },
    { value: 15, count: 2 },
    { value: 10, count: 4 },
    { value: 5, count: 4 },
    { value: 2.5, count: 4 },
    { value: 1.25, count: 4 },
    { value: 0.5, count: 2 }
  ],
  kg_basic: [
    { value: 20, count: 4 },
    { value: 10, count: 2 },
    { value: 5, count: 2 },
    { value: 2.5, count: 4 },
    { value: 1.25, count: 4 }
  ],
  lb_standard: [
    { value: 45, count: 4 },
    { value: 35, count: 2 },
    { value: 25, count: 4 },
    { value: 10, count: 4 },
    { value: 5, count: 4 },
    { value: 2.5, count: 4 }
  ],
  lb_basic: [
    { value: 45, count: 4 },
    { value: 25, count: 2 },
    { value: 10, count: 2 },
    { value: 5, count: 4 },
    { value: 2.5, count: 4 }
  ]
}

/**
 * Standard bar weights
 */
export const BAR_WEIGHTS = {
  kg: [
    { label: 'Olympic (20kg)', value: 20 },
    { label: 'Women\'s (15kg)', value: 15 },
    { label: 'Training (10kg)', value: 10 },
    { label: 'EZ Curl (7kg)', value: 7 }
  ],
  lb: [
    { label: 'Olympic (45lb)', value: 45 },
    { label: 'Women\'s (35lb)', value: 35 },
    { label: 'Training (25lb)', value: 25 },
    { label: 'EZ Curl (15lb)', value: 15 }
  ]
}

