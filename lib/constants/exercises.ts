export type BodyPart = 
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Full Body'

export interface DefaultExercise {
  name: string
  bodyPart: BodyPart
}

export const DEFAULT_EXERCISES: DefaultExercise[] = [
  // Chest
  { name: 'Barbell Bench Press', bodyPart: 'Chest' },
  { name: 'Dumbbell Bench Press', bodyPart: 'Chest' },
  { name: 'Incline Barbell Bench Press', bodyPart: 'Chest' },
  { name: 'Incline Dumbbell Bench Press', bodyPart: 'Chest' },
  { name: 'Decline Bench Press', bodyPart: 'Chest' },
  { name: 'Dumbbell Flyes', bodyPart: 'Chest' },
  { name: 'Cable Flyes', bodyPart: 'Chest' },
  { name: 'Push-ups', bodyPart: 'Chest' },
  { name: 'Chest Dips', bodyPart: 'Chest' },
  
  // Back
  { name: 'Deadlift', bodyPart: 'Back' },
  { name: 'Barbell Row', bodyPart: 'Back' },
  { name: 'Dumbbell Row', bodyPart: 'Back' },
  { name: 'Pull-ups', bodyPart: 'Back' },
  { name: 'Chin-ups', bodyPart: 'Back' },
  { name: 'Lat Pulldown', bodyPart: 'Back' },
  { name: 'Seated Cable Row', bodyPart: 'Back' },
  { name: 'T-Bar Row', bodyPart: 'Back' },
  { name: 'Face Pulls', bodyPart: 'Back' },
  { name: 'Hyperextensions', bodyPart: 'Back' },
  
  // Legs
  { name: 'Barbell Squat', bodyPart: 'Legs' },
  { name: 'Front Squat', bodyPart: 'Legs' },
  { name: 'Leg Press', bodyPart: 'Legs' },
  { name: 'Romanian Deadlift', bodyPart: 'Legs' },
  { name: 'Leg Curl', bodyPart: 'Legs' },
  { name: 'Leg Extension', bodyPart: 'Legs' },
  { name: 'Bulgarian Split Squat', bodyPart: 'Legs' },
  { name: 'Walking Lunges', bodyPart: 'Legs' },
  { name: 'Calf Raises', bodyPart: 'Legs' },
  { name: 'Hack Squat', bodyPart: 'Legs' },
  
  // Shoulders
  { name: 'Overhead Press', bodyPart: 'Shoulders' },
  { name: 'Dumbbell Shoulder Press', bodyPart: 'Shoulders' },
  { name: 'Lateral Raises', bodyPart: 'Shoulders' },
  { name: 'Front Raises', bodyPart: 'Shoulders' },
  { name: 'Rear Delt Flyes', bodyPart: 'Shoulders' },
  { name: 'Arnold Press', bodyPart: 'Shoulders' },
  { name: 'Upright Row', bodyPart: 'Shoulders' },
  { name: 'Shrugs', bodyPart: 'Shoulders' },
  
  // Arms
  { name: 'Barbell Curl', bodyPart: 'Arms' },
  { name: 'Dumbbell Curl', bodyPart: 'Arms' },
  { name: 'Hammer Curl', bodyPart: 'Arms' },
  { name: 'Preacher Curl', bodyPart: 'Arms' },
  { name: 'Cable Curl', bodyPart: 'Arms' },
  { name: 'Tricep Dips', bodyPart: 'Arms' },
  { name: 'Skull Crushers', bodyPart: 'Arms' },
  { name: 'Tricep Pushdown', bodyPart: 'Arms' },
  { name: 'Overhead Tricep Extension', bodyPart: 'Arms' },
  { name: 'Close-Grip Bench Press', bodyPart: 'Arms' },
  
  // Core
  { name: 'Plank', bodyPart: 'Core' },
  { name: 'Side Plank', bodyPart: 'Core' },
  { name: 'Hanging Leg Raises', bodyPart: 'Core' },
  { name: 'Cable Crunches', bodyPart: 'Core' },
  { name: 'Ab Wheel Rollout', bodyPart: 'Core' },
  { name: 'Russian Twists', bodyPart: 'Core' },
  { name: 'Mountain Climbers', bodyPart: 'Core' },
  { name: 'Bicycle Crunches', bodyPart: 'Core' },
]


